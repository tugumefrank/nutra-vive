"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase } from "../db";
import {
  Promotion,
  CustomerPromotionUsage,
  User,
  Category,
  Product,
  ProductDiscount,
  IPromotion,
  ICustomerPromotionUsage,
  IProductDiscount,
} from "../db/models";
import { sendEmail } from "../email";
import { getCustomerSegments, getCustomersWithAnalytics } from "./customerServerActions";
import mongoose from "mongoose";

// Validation Schemas
const promotionFiltersSchema = z.object({
  type: z.enum(["seasonal", "custom", "flash_sale"]).optional(),
  isActive: z.boolean().optional(),
  isScheduled: z.boolean().optional(),
  discountType: z
    .enum(["percentage", "fixed_amount", "buy_x_get_y"])
    .optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z
    .enum([
      "name",
      "createdAt",
      "totalRedemptions",
      "totalRevenue",
      "startsAt",
      "endsAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const createPromotionSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  description: z.string().optional(),
  type: z.enum(["seasonal", "custom", "flash_sale"]),

  // Discount Configuration
  discountType: z.enum(["percentage", "fixed_amount", "buy_x_get_y"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  buyXGetYConfig: z
    .object({
      buyQuantity: z.number().min(1),
      getQuantity: z.number().min(1),
      getDiscountPercentage: z.number().min(0).max(100),
    })
    .optional(),

  // Applicability
  applicabilityScope: z.enum([
    "entire_store",
    "categories",
    "products",
    "collections",
    "customer_segments",
  ]),
  targetCategories: z.array(z.string()).default([]),
  targetProducts: z.array(z.string()).default([]),
  targetCollections: z.array(z.string()).default([]),
  customerSegments: z
    .enum(["new_customers", "returning_customers", "vip_customers", "all"])
    .default("all"),

  // Usage Limits
  usageLimit: z.number().min(1).optional(),
  usageLimitPerCustomer: z.number().min(1).optional(),

  // Requirements
  minimumPurchaseAmount: z.number().min(0).optional(),
  minimumQuantity: z.number().min(1).optional(),

  // Exclusions
  excludedCategories: z.array(z.string()).default([]),
  excludedProducts: z.array(z.string()).default([]),
  excludedCollections: z.array(z.string()).default([]),
  excludeDiscountedItems: z.boolean().default(false),

  // Timing
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().default(true),
  isScheduled: z.boolean().default(false),

  // Codes
  generateCode: z.boolean().default(true),
  customCodes: z.array(z.string()).default([]),

  // Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const updatePromotionSchema = createPromotionSchema.partial();

const assignCustomerSchema = z.object({
  userId: z.string().min(1, "Customer ID is required"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  type: z.enum(["permanent", "temporary"]),
  expiresAt: z.string().optional(),
});

type PromotionFilters = z.infer<typeof promotionFiltersSchema>;
type CreatePromotionData = z.infer<typeof createPromotionSchema>;
type UpdatePromotionData = z.infer<typeof updatePromotionSchema>;
type AssignCustomerData = z.infer<typeof assignCustomerSchema>;

// Helper function to check admin access
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Helper function to serialize promotion data
const serializePromotion = (promotion: any): any => {
  if (!promotion) return null;

  return {
    ...promotion,
    _id: promotion._id?.toString() || promotion._id,
    createdBy: promotion.createdBy?.toString() || promotion.createdBy,
    updatedBy: promotion.updatedBy?.toString() || promotion.updatedBy,
    targetCategories:
      promotion.targetCategories?.map((cat: any) =>
        typeof cat === "object"
          ? {
              ...cat,
              _id: cat._id?.toString() || cat._id,
            }
          : cat.toString()
      ) || [],
    targetProducts:
      promotion.targetProducts?.map((prod: any) =>
        typeof prod === "object"
          ? {
              ...prod,
              _id: prod._id?.toString() || prod._id,
            }
          : prod.toString()
      ) || [],
    excludedCategories:
      promotion.excludedCategories?.map((cat: any) =>
        typeof cat === "object"
          ? {
              ...cat,
              _id: cat._id?.toString() || cat._id,
            }
          : cat.toString()
      ) || [],
    excludedProducts:
      promotion.excludedProducts?.map((prod: any) =>
        typeof prod === "object"
          ? {
              ...prod,
              _id: prod._id?.toString() || prod._id,
            }
          : prod.toString()
      ) || [],
    createdAt: promotion.createdAt?.toISOString() || promotion.createdAt,
    updatedAt: promotion.updatedAt?.toISOString() || promotion.updatedAt,
    startsAt: promotion.startsAt?.toISOString() || promotion.startsAt,
    endsAt: promotion.endsAt?.toISOString() || promotion.endsAt,
  };
};

// Generate unique promotion code
function generatePromotionCode(prefix: string = "PROMO"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Create Promotion
export async function createPromotion(
  data: CreatePromotionData
): Promise<{ success: boolean; promotion?: any; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Creating promotion...");

    // Validate data
    const validatedData = createPromotionSchema.parse(data);

    // Check for existing promotion with same name
    const existingPromotion = await Promotion.findOne({
      name: validatedData.name,
    });
    if (existingPromotion) {
      return {
        success: false,
        error: "A promotion with this name already exists",
      };
    }

    // Validate target categories and products if specified
    if (validatedData.targetCategories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: validatedData.targetCategories },
      });
      if (categoryCount !== validatedData.targetCategories.length) {
        return {
          success: false,
          error: "One or more target categories are invalid",
        };
      }
    }

    if (validatedData.targetProducts.length > 0) {
      const productCount = await Product.countDocuments({
        _id: { $in: validatedData.targetProducts },
      });
      if (productCount !== validatedData.targetProducts.length) {
        return {
          success: false,
          error: "One or more target products are invalid",
        };
      }
    }

    // Create promotion
    const promotion = new Promotion({
      ...validatedData,
      startsAt: validatedData.startsAt
        ? new Date(validatedData.startsAt)
        : undefined,
      endsAt: validatedData.endsAt ? new Date(validatedData.endsAt) : undefined,
      createdBy: admin._id,
      codes: [],
    });

    // Generate codes
    if (validatedData.generateCode) {
      const autoCode = generatePromotionCode();
      promotion.codes.push({
        code: autoCode,
        isPublic: true,
        usageLimit: validatedData.usageLimit,
        usedCount: 0,
        isActive: true,
        createdAt: new Date(),
      });
    }

    // Add custom codes
    for (const customCode of validatedData.customCodes) {
      promotion.codes.push({
        code: customCode.toUpperCase(),
        isPublic: true,
        usageLimit: validatedData.usageLimit,
        usedCount: 0,
        isActive: true,
        createdAt: new Date(),
      });
    }

    await promotion.save();

    console.log("✅ Promotion created successfully:", promotion.name);

    revalidatePath("/admin/promotions");

    // Populate promotion for response
    await promotion.populate([
      { path: "targetCategories", select: "name slug" },
      { path: "targetProducts", select: "name slug price" },
      { path: "excludedCategories", select: "name slug" },
      { path: "excludedProducts", select: "name slug price" },
    ]);

    return {
      success: true,
      promotion: serializePromotion(promotion.toObject()),
    };
  } catch (error) {
    console.error("❌ Error creating promotion:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Update Promotion
export async function updatePromotion(
  promotionId: string,
  data: UpdatePromotionData
): Promise<{ success: boolean; promotion?: any; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Updating promotion:", promotionId);

    // Validate data
    const validatedData = updatePromotionSchema.parse(data);

    // Check if promotion exists
    const existingPromotion = await Promotion.findById(promotionId);
    if (!existingPromotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingPromotion.name) {
      const nameConflict = await Promotion.findOne({
        name: validatedData.name,
        _id: { $ne: promotionId },
      });
      if (nameConflict) {
        return {
          success: false,
          error: "A promotion with this name already exists",
        };
      }
    }

    // Update promotion
    const updateData: any = {
      ...validatedData,
      updatedBy: admin._id,
    };

    if (validatedData.startsAt) {
      updateData.startsAt = new Date(validatedData.startsAt);
    }
    if (validatedData.endsAt) {
      updateData.endsAt = new Date(validatedData.endsAt);
    }

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      updateData,
      { new: true }
    ).populate([
      { path: "targetCategories", select: "name slug" },
      { path: "targetProducts", select: "name slug price" },
      { path: "excludedCategories", select: "name slug" },
      { path: "excludedProducts", select: "name slug price" },
    ]);

    console.log("✅ Promotion updated successfully:", updatedPromotion?.name);

    revalidatePath("/admin/promotions");

    return {
      success: true,
      promotion: serializePromotion(updatedPromotion?.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating promotion:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Delete Promotion
export async function deletePromotion(
  promotionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🗑️ Deleting promotion:", promotionId);

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    // Check if promotion has been used
    const usageCount = await CustomerPromotionUsage.countDocuments({
      promotion: promotionId,
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: `Cannot delete promotion. It has been used ${usageCount} times.`,
      };
    }

    await Promotion.findByIdAndDelete(promotionId);

    console.log("✅ Promotion deleted successfully:", promotion.name);

    revalidatePath("/admin/promotions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Promotions with Filters
export async function getPromotions(
  filters?: Partial<PromotionFilters>
): Promise<{
  promotions: any[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const validatedFilters = promotionFiltersSchema.parse(filters || {});

    // Build query
    const query: any = {};

    if (validatedFilters.type) {
      query.type = validatedFilters.type;
    }

    if (validatedFilters.isActive !== undefined) {
      query.isActive = validatedFilters.isActive;
    }

    if (validatedFilters.isScheduled !== undefined) {
      query.isScheduled = validatedFilters.isScheduled;
    }

    if (validatedFilters.discountType) {
      query.discountType = validatedFilters.discountType;
    }

    if (validatedFilters.search) {
      query.$or = [
        { name: { $regex: validatedFilters.search, $options: "i" } },
        { description: { $regex: validatedFilters.search, $options: "i" } },
        { "codes.code": { $regex: validatedFilters.search, $options: "i" } },
        { tags: { $in: [new RegExp(validatedFilters.search, "i")] } },
      ];
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      query.createdAt = {};
      if (validatedFilters.dateFrom) {
        query.createdAt.$gte = new Date(validatedFilters.dateFrom);
      }
      if (validatedFilters.dateTo) {
        query.createdAt.$lte = new Date(validatedFilters.dateTo);
      }
    }

    // Build sort
    const sort: any = {};
    sort[validatedFilters.sortBy] =
      validatedFilters.sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const page = validatedFilters.page;
    const limit = validatedFilters.limit;
    const skip = (page - 1) * limit;

    // Execute queries
    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .populate("createdBy", "firstName lastName email")
        .populate("targetCategories", "name slug")
        .populate("targetProducts", "name slug price")
        .populate("excludedCategories", "name slug")
        .populate("excludedProducts", "name slug price")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Promotion.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${promotions.length} promotions from database`);

    return {
      promotions: promotions.map((promotion) => serializePromotion(promotion)),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching promotions:", error);
    return {
      promotions: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error:
        error instanceof Error ? error.message : "Failed to fetch promotions",
    };
  }
}

// Get Single Promotion
export async function getPromotion(promotionId: string): Promise<{
  success: boolean;
  promotion?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const promotion = await Promotion.findById(promotionId)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("targetCategories", "name slug")
      .populate("targetProducts", "name slug price images")
      .populate("excludedCategories", "name slug")
      .populate("excludedProducts", "name slug price images")
      .lean();

    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    return {
      success: true,
      promotion: serializePromotion(promotion),
    };
  } catch (error) {
    console.error("❌ Error fetching promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Promotion Status
export async function togglePromotionStatus(
  promotionId: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      {
        isActive: !promotion.isActive,
        updatedBy: admin._id,
      },
      { new: true }
    );

    console.log(
      `✅ Promotion ${updatedPromotion?.isActive ? "activated" : "deactivated"}:`,
      promotion.name
    );

    revalidatePath("/admin/promotions");

    return {
      success: true,
      isActive: updatedPromotion?.isActive,
    };
  } catch (error) {
    console.error("❌ Error toggling promotion status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Assign Customer to Promotion
export async function assignCustomerToPromotion(
  promotionId: string,
  customerData: AssignCustomerData
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Assigning customer to promotion:", promotionId);

    // Validate data
    const validatedData = assignCustomerSchema.parse(customerData);

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    // Check if customer is already assigned
    const existingAssignment = promotion.assignedCustomers.find(
      (customer) => customer.userId === validatedData.userId
    );

    if (existingAssignment) {
      return {
        success: false,
        error: "Customer is already assigned to this promotion",
      };
    }

    // Add customer assignment
    const assignmentData: any = {
      userId: validatedData.userId,
      email: validatedData.email,
      firstName: validatedData.firstName || "",
      lastName: validatedData.lastName || "",
      type: validatedData.type,
      isActive: true,
      assignedAt: new Date(),
    };

    if (validatedData.type === "temporary" && validatedData.expiresAt) {
      assignmentData.expiresAt = new Date(validatedData.expiresAt);
    }

    promotion.assignedCustomers.push(assignmentData);
    await promotion.save();

    console.log("✅ Customer assigned to promotion successfully");

    revalidatePath("/admin/promotions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error assigning customer to promotion:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Remove Customer from Promotion
export async function removeCustomerFromPromotion(
  promotionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    promotion.assignedCustomers = promotion.assignedCustomers.filter(
      (customer) => customer.userId !== userId
    );

    await promotion.save();

    console.log("✅ Customer removed from promotion successfully");

    revalidatePath("/admin/promotions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error removing customer from promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Add Promotion Code
export async function addPromotionCode(
  promotionId: string,
  codeData: {
    code?: string;
    isPublic?: boolean;
    usageLimit?: number;
  }
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    const code = codeData.code?.toUpperCase() || generatePromotionCode();

    // Check if code already exists
    const existingCode = await Promotion.findOne({
      "codes.code": code,
    });

    if (existingCode) {
      return {
        success: false,
        error: "This code already exists",
      };
    }

    promotion.codes.push({
      code,
      isPublic: codeData.isPublic ?? true,
      usageLimit: codeData.usageLimit || promotion.usageLimit,
      usedCount: 0,
      isActive: true,
      createdAt: new Date(),
    });

    await promotion.save();

    console.log("✅ Promotion code added successfully:", code);

    revalidatePath("/admin/promotions");

    return {
      success: true,
      code,
    };
  } catch (error) {
    console.error("❌ Error adding promotion code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Promotion Statistics
export async function getPromotionStats(): Promise<{
  totalPromotions: number;
  activePromotions: number;
  scheduledPromotions: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageDiscountValue: number;
  topPerformingPromotions: Array<{
    name: string;
    totalRedemptions: number;
    totalRevenue: number;
    redemptionRate: number;
  }>;
  recentPromotions: any[];
  promotionsByType: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const [
      totalPromotions,
      activePromotions,
      scheduledPromotions,
      recentPromotions,
      promotionStats,
      promotionsByType,
    ] = await Promise.all([
      Promotion.countDocuments(),
      Promotion.countDocuments({ isActive: true }),
      Promotion.countDocuments({ isScheduled: true }),
      Promotion.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "firstName lastName")
        .lean(),
      Promotion.aggregate([
        {
          $group: {
            _id: null,
            totalRedemptions: { $sum: "$totalRedemptions" },
            totalRevenue: { $sum: "$totalRevenue" },
            averageDiscountValue: { $avg: "$discountValue" },
          },
        },
      ]),
      Promotion.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            revenue: { $sum: "$totalRevenue" },
          },
        },
        {
          $project: {
            type: "$_id",
            count: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    // Get top performing promotions
    const topPerformingPromotions = await Promotion.aggregate([
      {
        $match: {
          totalRedemptions: { $gt: 0 },
        },
      },
      {
        $addFields: {
          redemptionRate: {
            $cond: {
              if: { $gt: ["$usageLimit", 0] },
              then: {
                $multiply: [{ $divide: ["$usedCount", "$usageLimit"] }, 100],
              },
              else: 0,
            },
          },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: 1,
          totalRedemptions: 1,
          totalRevenue: 1,
          redemptionRate: 1,
          _id: 0,
        },
      },
    ]);

    const stats = promotionStats[0] || {
      totalRedemptions: 0,
      totalRevenue: 0,
      averageDiscountValue: 0,
    };

    console.log("✅ Promotion statistics calculated successfully");

    return {
      totalPromotions,
      activePromotions,
      scheduledPromotions,
      totalRedemptions: stats.totalRedemptions,
      totalRevenue: stats.totalRevenue,
      averageDiscountValue: stats.averageDiscountValue,
      topPerformingPromotions,
      recentPromotions: recentPromotions.map((promotion) =>
        serializePromotion(promotion)
      ),
      promotionsByType,
    };
  } catch (error) {
    console.error("❌ Error fetching promotion statistics:", error);
    return {
      totalPromotions: 0,
      activePromotions: 0,
      scheduledPromotions: 0,
      totalRedemptions: 0,
      totalRevenue: 0,
      averageDiscountValue: 0,
      topPerformingPromotions: [],
      recentPromotions: [],
      promotionsByType: [],
    };
  }
}

// Export Promotions to CSV
export async function exportPromotions(
  filters?: Partial<PromotionFilters>
): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const { promotions } = await getPromotions({ ...filters, limit: 10000 });

    // Convert promotions to CSV format
    const csvHeaders = [
      "Name",
      "Type",
      "Discount Type",
      "Discount Value",
      "Status",
      "Total Redemptions",
      "Total Revenue",
      "Usage Limit",
      "Starts At",
      "Ends At",
      "Created At",
      "Codes",
    ];

    const csvData = promotions.map((promotion) => [
      promotion.name,
      promotion.type,
      promotion.discountType,
      promotion.discountType === "percentage"
        ? `${promotion.discountValue}%`
        : `$${promotion.discountValue}`,
      promotion.isActive ? "Active" : "Inactive",
      promotion.totalRedemptions,
      `$${promotion.totalRevenue.toFixed(2)}`,
      promotion.usageLimit || "Unlimited",
      promotion.startsAt
        ? new Date(promotion.startsAt).toLocaleDateString()
        : "",
      promotion.endsAt ? new Date(promotion.endsAt).toLocaleDateString() : "",
      new Date(promotion.createdAt).toLocaleDateString(),
      promotion.codes.map((code: any) => code.code).join("; "),
    ]);

    const csv = [csvHeaders, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    console.log(`✅ Exported ${promotions.length} promotions to CSV`);

    return {
      success: true,
      data: csv,
    };
  } catch (error) {
    console.error("❌ Error exporting promotions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to export promotions",
    };
  }
}

// Bulk Update Promotions
export async function bulkUpdatePromotions(
  promotionIds: string[],
  updates: {
    isActive?: boolean;
    type?: string;
    tags?: string[];
  }
): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    const updateData: any = {
      updatedBy: admin._id,
      updatedAt: new Date(),
    };

    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    if (updates.type) {
      updateData.type = updates.type;
    }

    if (updates.tags) {
      updateData.tags = updates.tags;
    }

    const result = await Promotion.updateMany(
      { _id: { $in: promotionIds } },
      updateData
    );

    console.log(`✅ Bulk updated ${result.modifiedCount} promotions`);

    revalidatePath("/admin/promotions");

    return {
      success: true,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk updating promotions:", error);
    return {
      success: false,
      updated: 0,
      error:
        error instanceof Error
          ? error.message
          : "Failed to bulk update promotions",
    };
  }
}

// Enhanced Customer Targeting Functions

// Get available customer segments for promotion targeting
export async function getPromotionTargetingOptions() {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    // Get customer analytics to get customer segments and individual customers
    const customerAnalytics = await getCustomersWithAnalytics();
    const customerSegments = await getCustomerSegments();

    // Get individual customers (limit to recent 500 for performance)
    const customers = await User.find({ role: 'user' })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Create segments object with counts
    const segments = {
      new_customers: customerSegments.find(s => s.id === 'new_customers')?.count || 0,
      returning_customers: customerSegments.find(s => s.id === 'returning_customers')?.count || 0,
      vip_customers: customerSegments.find(s => s.id === 'vip_customers')?.count || 0,
      high_value: customerSegments.find(s => s.id === 'high_value')?.count || 0,
      at_risk: customerSegments.find(s => s.id === 'at_risk')?.count || 0,
      recent_buyers: customerSegments.find(s => s.id === 'recent_buyers')?.count || 0
    };

    return {
      success: true,
      segments,
      customers: customers.map(customer => ({
        _id: customer._id.toString(),
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User',
        email: customer.email,
        createdAt: customer.createdAt?.toISOString() || new Date().toISOString()
      })),
      totalCustomers: customers.length
    };
  } catch (error) {
    console.error("❌ Error getting targeting options:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get targeting options"
    };
  }
}

// Assign promotion to specific customers or customer segments
export async function assignPromotionToCustomers(params: {
  promotionId: string;
  customerSegment?: string;
  customerIds?: string[];
  sendNotification?: boolean;
}) {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const { promotionId, customerSegment, customerIds, sendNotification = true } = params;

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return { success: false, error: "Promotion not found" };
    }

    let targetCustomers: any[] = [];

    if (customerIds && customerIds.length > 0) {
      // Individual customer assignment
      const customers = await User.find({ 
        _id: { $in: customerIds.map(id => new mongoose.Types.ObjectId(id)) },
        role: 'user'
      }).select('firstName lastName email clerkId').lean();
      targetCustomers = customers;
    } else if (customerSegment) {
      // Segment-based assignment
      const customerAnalytics = await getCustomersWithAnalytics();
      const allCustomers = customerAnalytics.customers || [];
      
      // Filter customers based on segment
      switch (customerSegment) {
        case 'new_customers':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'New Customers');
          break;
        case 'returning_customers':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'Returning Customers');
          break;
        case 'vip_customers':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'VIP Customers');
          break;
        case 'high_value':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'High Value');
          break;
        case 'at_risk':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'At Risk');
          break;
        case 'recent_buyers':
          targetCustomers = allCustomers.filter(c => (c as any).segment === 'Recent Buyers');
          break;
        default:
          targetCustomers = allCustomers;
      }
    } else {
      // All customers
      const customerAnalytics = await getCustomersWithAnalytics();
      targetCustomers = customerAnalytics.customers || [];
    }

    if (targetCustomers.length === 0) {
      return { success: false, error: "No customers found matching the criteria" };
    }

    // Filter out customers already assigned to avoid duplicates
    const existingCustomerIds = promotion.assignedCustomers.map(ac => ac.userId || ac.email);
    const newAssignments = targetCustomers.filter(customer => 
      !existingCustomerIds.includes(customer._id.toString()) && 
      !existingCustomerIds.includes(customer.email)
    );

    if (newAssignments.length === 0) {
      return { success: false, error: "All selected customers are already assigned to this promotion" };
    }

    // Create assignment data for promotion document
    const promotionAssignments = newAssignments.map(customer => ({
      userId: customer._id.toString(),
      email: customer.email,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      type: 'permanent' as 'permanent' | 'temporary',
      isActive: true,
      assignedAt: new Date()
    }));

    // Note: We don't create CustomerPromotionUsage records here
    // CustomerPromotionUsage should only be created when a customer actually uses/redeems a promotion
    // Assignment records are stored in the promotion's assignedCustomers array

    // Add customers to promotion
    promotion.assignedCustomers.push(...promotionAssignments);
    await promotion.save();

    // Send notification emails if requested
    if (sendNotification && newAssignments.length > 0) {
      await sendPromotionNotifications(promotion, newAssignments);
    }

    return {
      success: true,
      assignedCount: newAssignments.length,
      totalAssigned: promotion.assignedCustomers.length
    };
  } catch (error) {
    console.error("❌ Error assigning promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign promotion"
    };
  }
}

// Send promotion notifications via email
async function sendPromotionNotifications(promotion: any, customers: any[]) {
  const batchSize = 50;
  
  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);
    
    const promises = batch.map(async (customer) => {
      try {
        await sendEmail({
          to: customer.email,
          subject: `Exclusive Offer: ${promotion.name}`,
          template: "promotion-notification",
          data: {
            customerName: customer.firstName || 'Valued Customer',
            promotionName: promotion.name,
            promotionDescription: promotion.description,
            promotionCode: promotion.codes[0]?.code,
            discountValue: promotion.discountValue,
            discountType: promotion.discountType,
            expiresAt: promotion.endsAt
          }
        });
      } catch (error) {
        console.error(`Failed to send promotion email to ${customer.email}:`, error);
      }
    });

    await Promise.allSettled(promises);
    
    // Add delay between batches
    if (i + batchSize < customers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Get product-specific pricing with promotions applied
export async function getProductPricingWithPromotions(productId: string, customerEmail?: string) {
  try {
    await connectToDatabase();
    
    const product = await Product.findById(productId).lean();
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const now = new Date();
    
    // Find active promotions that apply to this product
    const promotionQuery: any = {
      isActive: true,
      $and: [
        {
          $or: [
            { startsAt: { $exists: false } },
            { startsAt: { $lte: now } }
          ]
        },
        {
          $or: [
            { endsAt: { $exists: false } },
            { endsAt: { $gte: now } }
          ]
        },
        {
          $or: [
            { applicabilityScope: 'entire_store' },
            { 
              applicabilityScope: 'products',
              targetProducts: productId
            },
            {
              applicabilityScope: 'categories',
              targetCategories: product.category
            }
          ]
        }
      ]
    };

    let applicablePromotions = await Promotion.find(promotionQuery).lean();
    
    // If customer email provided, filter for customer-specific promotions
    if (customerEmail) {
      applicablePromotions = applicablePromotions.filter(promo => 
        promo.assignedCustomers.length === 0 || 
        promo.assignedCustomers.some(ac => ac.email === customerEmail && ac.isActive)
      );
    }

    // Calculate best discount
    let bestDiscount = 0;
    let appliedPromotion = null;

    for (const promotion of applicablePromotions) {
      let discount = 0;
      
      if (promotion.discountType === 'percentage') {
        discount = (product.price * promotion.discountValue) / 100;
      } else if (promotion.discountType === 'fixed_amount') {
        discount = Math.min(promotion.discountValue, product.price);
      }
      
      if (discount > bestDiscount) {
        bestDiscount = discount;
        appliedPromotion = promotion;
      }
    }

    const finalPrice = Math.max(0, product.price - bestDiscount);
    
    return {
      success: true,
      pricing: {
        originalPrice: product.price,
        discountAmount: bestDiscount,
        discountPercentage: bestDiscount > 0 ? Math.round((bestDiscount / product.price) * 100) : 0,
        finalPrice: finalPrice,
        hasDiscount: bestDiscount > 0,
        appliedPromotion: appliedPromotion ? {
          id: appliedPromotion._id.toString(),
          name: appliedPromotion.name,
          code: appliedPromotion.codes[0]?.code,
          discountType: appliedPromotion.discountType,
          discountValue: appliedPromotion.discountValue,
          endsAt: appliedPromotion.endsAt?.toISOString()
        } : null
      }
    };
  } catch (error) {
    console.error("❌ Error calculating product pricing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate pricing"
    };
  }
}

// Get promotion analytics and insights
export async function getPromotionAnalytics(promotionId?: string) {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const matchStage = promotionId ? { promotion: new mongoose.Types.ObjectId(promotionId) } : {};
    
    const analytics = await CustomerPromotionUsage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: promotionId ? null : "$promotion",
          totalUsage: { $sum: 1 },
          totalRevenue: { $sum: "$orderTotal" },
          totalDiscount: { $sum: "$discountAmount" },
          avgOrderValue: { $avg: "$orderTotal" },
          avgDiscountAmount: { $avg: "$discountAmount" },
          uniqueCustomers: { $addToSet: "$customerEmail" }
        }
      },
      {
        $addFields: {
          uniqueCustomerCount: { $size: "$uniqueCustomers" },
          discountPercentage: { 
            $multiply: [
              { $divide: ["$totalDiscount", "$totalRevenue"] }, 
              100
            ] 
          }
        }
      }
    ]);

    // Get time-series data for the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const timeSeriesData = await CustomerPromotionUsage.aggregate([
      { 
        $match: { 
          ...matchStage,
          usedAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$usedAt" },
            month: { $month: "$usedAt" },
            day: { $dayOfMonth: "$usedAt" }
          },
          usage: { $sum: 1 },
          revenue: { $sum: "$orderTotal" },
          discount: { $sum: "$discountAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    return {
      success: true,
      analytics: analytics[0] || {
        totalUsage: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
        avgDiscountAmount: 0,
        uniqueCustomerCount: 0,
        discountPercentage: 0
      },
      timeSeriesData
    };
  } catch (error) {
    console.error("❌ Error getting promotion analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get analytics"
    };
  }
}

// Auto-apply best available promotion to cart
export async function getCartPromotions(cartItems: any[], customerEmail?: string) {
  try {
    await connectToDatabase();
    
    const now = new Date();
    let totalSavings = 0;
    const appliedPromotions: any[] = [];
    
    // Process each cart item
    for (const item of cartItems) {
      const pricingResult = await getProductPricingWithPromotions(item.productId, customerEmail);
      
      if (pricingResult.success && pricingResult.pricing.hasDiscount) {
        const itemSavings = pricingResult.pricing.discountAmount * item.quantity;
        totalSavings += itemSavings;
        
        appliedPromotions.push({
          productId: item.productId,
          promotionId: pricingResult.pricing.appliedPromotion?.id,
          promotionName: pricingResult.pricing.appliedPromotion?.name,
          originalPrice: pricingResult.pricing.originalPrice,
          discountedPrice: pricingResult.pricing.finalPrice,
          savings: itemSavings,
          quantity: item.quantity
        });
      }
    }

    return {
      success: true,
      totalSavings,
      appliedPromotions,
      hasPromotions: appliedPromotions.length > 0
    };
  } catch (error) {
    console.error("❌ Error calculating cart promotions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate promotions"
    };
  }
}

// Get promotion assignments
export async function getPromotionAssignments(params: { page?: number; limit?: number } = {}) {
  try {
    await connectToDatabase();
    
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Get assignments with promotion and customer details
    const assignments = await CustomerPromotionUsage.aggregate([
      {
        $match: {
          assignedAt: { $exists: true },
          $or: [
            { usedAt: { $exists: false } },
            { usedAt: null }
          ]
        }
      },
      {
        $lookup: {
          from: 'promotions',
          localField: 'promotionId',
          foreignField: '_id',
          as: 'promotion'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $group: {
          _id: {
            promotionId: '$promotionId',
            targetType: '$targetType',
            customerSegment: '$customerSegment'
          },
          customerCount: { $sum: 1 },
          redemptionCount: { 
            $sum: { 
              $cond: [{ $ne: ['$usedAt', null] }, 1, 0] 
            }
          },
          promotionName: { $first: '$promotion.name' },
          promotion: { $first: '$promotion' },
          createdAt: { $first: '$assignedAt' },
          assignmentId: { $first: '$_id' }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    const total = await CustomerPromotionUsage.countDocuments({
      assignedAt: { $exists: true }
    });

    return {
      success: true,
      assignments: assignments.map(assignment => ({
        _id: assignment.assignmentId?.toString() || assignment._id.toString(),
        promotionId: assignment._id.promotionId?.toString(),
        promotionName: assignment.promotionName,
        promotion: assignment.promotion[0] ? {
          ...assignment.promotion[0],
          _id: assignment.promotion[0]._id?.toString()
        } : null,
        targetType: assignment._id.targetType,
        customerSegment: assignment._id.customerSegment,
        customerCount: assignment.customerCount,
        redemptionCount: assignment.redemptionCount,
        createdAt: assignment.createdAt?.toISOString() || new Date().toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("❌ Error getting promotion assignments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get assignments"
    };
  }
}

// Remove promotion assignment
export async function removePromotionAssignment(assignmentId: string) {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return {
        success: false,
        error: "Invalid assignment ID"
      };
    }

    const result = await CustomerPromotionUsage.deleteMany({
      _id: new mongoose.Types.ObjectId(assignmentId)
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Assignment not found"
      };
    }

    console.log(`✅ Removed promotion assignment: ${assignmentId}`);
    revalidatePath('/admin/promotions');

    return {
      success: true,
      message: "Assignment removed successfully"
    };
  } catch (error) {
    console.error("❌ Error removing promotion assignment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove assignment"
    };
  }
}

// Assign product discounts (updates compareAtPrice)
export async function assignProductDiscounts(params: {
  name: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  scope: 'all_products' | 'categories' | 'specific_products';
  categoryIds?: string[];
  productIds?: string[];
}) {
  try {
    console.log('🔍 Starting assignProductDiscounts with params:', params);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ No userId found');
      return { success: false, error: "Authentication required" };
    }
    
    console.log('✅ User authenticated:', userId);
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected');
    
    // Verify user exists (simplified - no admin check for now)
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log('❌ User not found in database');
      return { success: false, error: "User not found" };
    }
    console.log('✅ User found in database:', user.email);

    const { name, discountType, discountValue, scope, categoryIds, productIds } = params;

    let query: any = {};

    // Build query based on scope
    console.log('🔍 Building query for scope:', scope);
    switch (scope) {
      case 'all_products':
        query = { isActive: true };
        break;
      case 'categories':
        if (!categoryIds || categoryIds.length === 0) {
          console.log('❌ No categories specified');
          return { success: false, error: "No categories specified" };
        }
        query = { 
          isActive: true,
          category: { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        console.log('✅ Category query built:', query);
        break;
      case 'specific_products':
        if (!productIds || productIds.length === 0) {
          console.log('❌ No products specified');
          return { success: false, error: "No products specified" };
        }
        query = { 
          _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        console.log('✅ Product query built:', query);
        break;
    }

    console.log('🔍 Searching for products with query:', query);
    // Get products to update
    const products = await Product.find(query);
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found matching criteria');
      return { success: false, error: "No products found matching the criteria" };
    }

    // Calculate new compareAtPrice for each product
    const updatePromises = products.map(async (product) => {
      let compareAtPrice: number;
      
      if (discountType === 'percentage') {
        // Calculate the original price before discount
        const discountMultiplier = (100 + discountValue) / 100;
        compareAtPrice = product.price * discountMultiplier;
      } else {
        // Fixed amount discount
        compareAtPrice = product.price + discountValue;
      }

      // Only update if the compareAtPrice would be higher than current price
      if (compareAtPrice > product.price) {
        return Product.findByIdAndUpdate(
          product._id,
          { 
            compareAtPrice: Math.round(compareAtPrice * 100) / 100 // Round to 2 decimal places
          },
          { new: true }
        );
      }
      return null;
    });

    console.log('🔍 Executing updates...');
    const updateResults = await Promise.all(updatePromises);
    const updatedCount = updateResults.filter(result => result !== null).length;

    console.log(`✅ Applied discount "${name}" to ${updatedCount} products`);
    revalidatePath('/admin/promotions');
    revalidatePath('/shop');

    return {
      success: true,
      affectedCount: updatedCount,
      totalChecked: products.length,
      message: `Discount applied to ${updatedCount} out of ${products.length} products`
    };
  } catch (error) {
    console.error("❌ Error applying product discounts:", error);
    console.error("❌ Full error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply discounts"
    };
  }
}

// Create Product Discount Campaign
export async function createProductDiscount(params: {
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  scope: 'all_products' | 'categories' | 'specific_products';
  categoryIds?: string[];
  productIds?: string[];
  scheduleType: 'immediate' | 'scheduled';
  startsAt: Date;
  endsAt?: Date;
  autoDisable: boolean;
  priority: number;
  canStackWithOtherDiscounts: boolean;
  notes?: string;
  duration?: {
    amount: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
}) {
  try {
    console.log('🔍 Starting createProductDiscount with params:', params);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ No userId found');
      return { success: false, error: "Authentication required" };
    }
    
    console.log('✅ User authenticated:', userId);
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected');
    
    // Verify user exists and get user info
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log('❌ User not found in database');
      return { success: false, error: "User not found" };
    }
    console.log('✅ User found in database:', user.email);

    const {
      name,
      description,
      discountType,
      discountValue,
      scope,
      categoryIds = [],
      productIds = [],
      scheduleType,
      startsAt,
      endsAt,
      autoDisable,
      priority,
      canStackWithOtherDiscounts,
      notes,
      duration
    } = params;

    // Check for existing discount with same name
    const existingDiscount = await ProductDiscount.findOne({ name });
    if (existingDiscount) {
      return { success: false, error: "A discount with this name already exists" };
    }

    // Count affected products for the campaign
    let query: any = {};
    switch (scope) {
      case 'all_products':
        query = { isActive: true };
        break;
      case 'categories':
        if (categoryIds.length === 0) {
          return { success: false, error: "No categories specified" };
        }
        query = { 
          isActive: true,
          category: { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
      case 'specific_products':
        if (productIds.length === 0) {
          return { success: false, error: "No products specified" };
        }
        query = { 
          _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
    }

    const productCount = await Product.countDocuments(query);
    console.log(`✅ Found ${productCount} products that will be affected`);

    // Create the product discount campaign
    const discountCampaign = new ProductDiscount({
      name,
      description,
      discountType,
      discountValue,
      scope,
      categoryIds,
      productIds,
      affectedProductCount: productCount,
      isActive: scheduleType === 'immediate', // Only active if immediate
      startsAt,
      endsAt,
      autoDisable,
      scheduleType,
      duration,
      canStackWithOtherDiscounts,
      priority,
      totalSavings: 0,
      usageCount: 0,
      viewCount: 0,
      createdBy: user._id,
      notes,
      tags: []
    });

    await discountCampaign.save();
    console.log('✅ Product discount campaign created:', discountCampaign._id);

    // If immediate, apply the discounts now
    if (scheduleType === 'immediate') {
      const applyResult = await applyProductDiscounts(discountCampaign._id.toString());
      if (!applyResult.success) {
        // Clean up the campaign if application failed
        await ProductDiscount.findByIdAndDelete(discountCampaign._id);
        return applyResult;
      }
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/shop');

    return {
      success: true,
      campaign: discountCampaign.toObject(),
      affectedCount: productCount,
      message: scheduleType === 'immediate' 
        ? `Discount campaign created and applied to ${productCount} products`
        : `Discount campaign scheduled for ${startsAt.toLocaleString()}`
    };
  } catch (error) {
    console.error("❌ Error creating product discount campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create discount campaign"
    };
  }
}

// Apply discounts from a campaign to products
async function applyProductDiscounts(campaignId: string) {
  try {
    const campaign = await ProductDiscount.findById(campaignId);
    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Build query based on campaign scope
    let query: any = {};
    switch (campaign.scope) {
      case 'all_products':
        query = { isActive: true };
        break;
      case 'categories':
        query = { 
          isActive: true,
          category: { $in: campaign.categoryIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
      case 'specific_products':
        query = { 
          _id: { $in: campaign.productIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
    }

    // Get products to update
    const products = await Product.find(query);
    console.log(`Found ${products.length} products to apply discount to`);

    // Calculate discounted prices for each product
    const updatePromises = products.map(async (product) => {
      // Store original price if not already stored
      const originalPrice = product.compareAtPrice || product.price;
      let newPrice: number;
      
      if (campaign.discountType === 'percentage') {
        // Calculate new discounted price
        const discountDecimal = campaign.discountValue / 100;
        newPrice = originalPrice * (1 - discountDecimal);
      } else {
        // Fixed amount discount
        newPrice = Math.max(0, originalPrice - campaign.discountValue);
      }

      // Only update if there's actually a discount to apply
      if (newPrice < originalPrice) {
        return Product.findByIdAndUpdate(
          product._id,
          { 
            price: Math.round(newPrice * 100) / 100,
            compareAtPrice: originalPrice, // Keep original price for display
            isDiscounted: true
          },
          { new: true }
        );
      }
      return null;
    });

    const updateResults = await Promise.all(updatePromises);
    const updatedCount = updateResults.filter(result => result !== null).length;

    // Update campaign with actual applied count
    await ProductDiscount.findByIdAndUpdate(campaignId, {
      affectedProductCount: updatedCount,
      usageCount: updatedCount
    });

    console.log(`✅ Applied discount to ${updatedCount} products`);

    return {
      success: true,
      affectedCount: updatedCount,
      totalChecked: products.length
    };
  } catch (error) {
    console.error("❌ Error applying product discounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply discounts"
    };
  }
}

// Get all product discount campaigns
export async function getProductDiscounts(filters?: {
  isActive?: boolean;
  scope?: string;
  search?: string;
}) {
  try {
    await connectToDatabase();
    
    const query: any = {};
    
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    if (filters?.scope) {
      query.scope = filters.scope;
    }
    
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    const campaigns = await ProductDiscount.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    return {
      success: true,
      campaigns: campaigns.map(campaign => ({
        ...campaign.toObject(),
        _id: campaign._id.toString(),
        createdBy: campaign.createdBy || null
      }))
    };
  } catch (error) {
    console.error("❌ Error fetching product discounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch campaigns"
    };
  }
}

// Toggle product discount campaign status
export async function toggleProductDiscountStatus(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }
    
    await connectToDatabase();
    
    const campaign = await ProductDiscount.findById(campaignId);
    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }
    
    const newStatus = !campaign.isActive;
    
    await ProductDiscount.findByIdAndUpdate(campaignId, {
      isActive: newStatus,
      updatedBy: userId
    });
    
    // If activating, apply discounts; if deactivating, remove them
    if (newStatus) {
      await applyProductDiscounts(campaignId);
    } else {
      await removeProductDiscounts(campaignId);
    }
    
    revalidatePath('/admin/promotions');
    revalidatePath('/shop');
    
    return {
      success: true,
      isActive: newStatus,
      message: `Campaign ${newStatus ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error("❌ Error toggling campaign status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle status"
    };
  }
}

// Remove discounts from products when campaign is deactivated
async function removeProductDiscounts(campaignId: string) {
  try {
    const campaign = await ProductDiscount.findById(campaignId);
    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Build query based on campaign scope
    let query: any = {};
    switch (campaign.scope) {
      case 'all_products':
        query = { isActive: true, isDiscounted: true };
        break;
      case 'categories':
        query = { 
          isActive: true,
          isDiscounted: true,
          category: { $in: campaign.categoryIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
      case 'specific_products':
        query = { 
          isDiscounted: true,
          _id: { $in: campaign.productIds.map(id => new mongoose.Types.ObjectId(id)) }
        };
        break;
    }

    // Restore original prices and remove discount flags
    const productsToRestore = await Product.find(query);
    
    const restorePromises = productsToRestore.map(async (product) => {
      // If there's a compareAtPrice, it means there was an original price to restore
      if (product.compareAtPrice && product.compareAtPrice > product.price) {
        return Product.findByIdAndUpdate(
          product._id,
          {
            price: product.compareAtPrice, // Restore original price
            $unset: { compareAtPrice: 1 }, // Remove compareAtPrice
            $set: { isDiscounted: false }  // Remove discount flag
          },
          { new: true }
        );
      } else {
        // Just remove the discount flag if no price restoration needed
        return Product.findByIdAndUpdate(
          product._id,
          { $set: { isDiscounted: false } },
          { new: true }
        );
      }
    });
    
    const restoreResults = await Promise.all(restorePromises);
    const restoredCount = restoreResults.filter(result => result !== null).length;

    console.log(`✅ Restored original prices for ${restoredCount} products`);

    return {
      success: true,
      affectedCount: restoredCount
    };
  } catch (error) {
    console.error("❌ Error removing product discounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove discounts"
    };
  }
}

// Delete product discount campaign
export async function deleteProductDiscountCampaign(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }
    
    await connectToDatabase();
    
    const campaign = await ProductDiscount.findById(campaignId);
    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }
    
    // Remove discounts from products first
    if (campaign.isActive) {
      await removeProductDiscounts(campaignId);
    }
    
    // Delete the campaign
    await ProductDiscount.findByIdAndDelete(campaignId);
    
    revalidatePath('/admin/promotions');
    revalidatePath('/shop');
    
    return {
      success: true,
      message: "Campaign deleted successfully"
    };
  } catch (error) {
    console.error("❌ Error deleting campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete campaign"
    };
  }
}
