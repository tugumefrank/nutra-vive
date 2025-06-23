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
  IPromotion,
  ICustomerPromotionUsage,
} from "../db/models";
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
