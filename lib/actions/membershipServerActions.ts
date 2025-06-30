"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import {
  Membership,
  UserMembership,
  User,
  Category,
  IMembership,
  IUserMembership,
} from "../db/models";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-05-28.basil",
// });

// // ============================================================================
// // VALIDATION SCHEMAS
// // ============================================================================

// const membershipFiltersSchema = z.object({
//   tier: z.enum(["basic", "premium", "vip", "elite"]).optional(),
//   billingFrequency: z.enum(["monthly", "quarterly", "yearly"]).optional(),
//   isActive: z.boolean().optional(),
//   search: z.string().optional(),
//   sortBy: z
//     .enum(["name", "price", "tier", "totalSubscribers", "createdAt"])
//     .default("createdAt"),
//   sortOrder: z.enum(["asc", "desc"]).default("desc"),
//   page: z.number().int().min(1).default(1),
//   limit: z.number().int().min(1).max(100).default(20),
// });

// const createMembershipSchema = z.object({
//   name: z.string().min(1, "Membership name is required"),
//   description: z.string().optional(),
//   tier: z.enum(["basic", "premium", "vip", "elite"]),

//   // Pricing
//   price: z.number().min(0, "Price must be positive"),
//   billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),

//   // Product Allocations
//   productAllocations: z
//     .array(
//       z.object({
//         categoryId: z.string().min(1, "Category is required"),
//         categoryName: z.string().min(1, "Category name is required"),
//         quantity: z.number().min(0, "Quantity must be positive"),
//         allowedProducts: z.array(z.string()).default([]),
//       })
//     )
//     .min(1, "At least one product allocation is required"),

//   // Custom Benefits
//   customBenefits: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Benefit title is required"),
//         description: z.string().min(1, "Benefit description is required"),
//         type: z.enum(["webinar", "content", "discount", "service", "other"]),
//         value: z.string().optional(),
//       })
//     )
//     .default([]),

//   // Features
//   features: z.array(z.string()).default([]),

//   // Configuration
//   maxProductsPerMonth: z.number().min(0).optional(),
//   deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]),
//   freeDelivery: z.boolean().default(false),
//   prioritySupport: z.boolean().default(false),

//   // Display
//   isActive: z.boolean().default(true),
//   isPopular: z.boolean().default(false),
//   sortOrder: z.number().default(0),
//   color: z.string().optional(),
//   icon: z.string().optional(),
// });

// const updateMembershipSchema = createMembershipSchema.partial();

// const userMembershipFiltersSchema = z.object({
//   status: z
//     .enum(["active", "cancelled", "expired", "paused", "trial"])
//     .optional(),
//   membershipId: z.string().optional(),
//   search: z.string().optional(),
//   sortBy: z
//     .enum(["startDate", "nextBillingDate", "lastPaymentDate"])
//     .default("startDate"),
//   sortOrder: z.enum(["asc", "desc"]).default("desc"),
//   page: z.number().int().min(1).default(1),
//   limit: z.number().int().min(1).max(100).default(20),
// });

// type MembershipFilters = z.infer<typeof membershipFiltersSchema>;
// type CreateMembershipData = z.infer<typeof createMembershipSchema>;
// type UpdateMembershipData = z.infer<typeof updateMembershipSchema>;
// type UserMembershipFilters = z.infer<typeof userMembershipFiltersSchema>;

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// async function checkAdminAuth() {
//   const { userId } = await auth();
//   if (!userId) {
//     redirect("/sign-in");
//   }

//   await connectToDatabase();
//   const user = await User.findOne({ clerkId: userId });

//   if (!user || user.role !== "admin") {
//     throw new Error("Unauthorized: Admin access required");
//   }

//   return user;
// }

// const serializeMembership = (membership: any): any => {
//   if (!membership) return null;

//   return {
//     ...membership,
//     _id: membership._id?.toString() || membership._id,
//     createdBy: membership.createdBy?.toString() || membership.createdBy,
//     updatedBy: membership.updatedBy?.toString() || membership.updatedBy,
//     productAllocations:
//       membership.productAllocations?.map((allocation: any) => ({
//         ...allocation,
//         categoryId: allocation.categoryId?.toString() || allocation.categoryId,
//         allowedProducts:
//           allocation.allowedProducts?.map((id: any) => id?.toString() || id) ||
//           [],
//       })) || [],
//     createdAt: membership.createdAt?.toISOString() || membership.createdAt,
//     updatedAt: membership.updatedAt?.toISOString() || membership.updatedAt,
//   };
// };

// const serializeUserMembership = (userMembership: any): any => {
//   if (!userMembership) return null;

//   return {
//     ...userMembership,
//     _id: userMembership._id?.toString() || userMembership._id,
//     user: userMembership.user?.toString() || userMembership.user,
//     membership:
//       typeof userMembership.membership === "object" && userMembership.membership
//         ? {
//             ...userMembership.membership,
//             _id:
//               userMembership.membership._id?.toString() ||
//               userMembership.membership._id,
//           }
//         : userMembership.membership?.toString() || userMembership.membership,
//     startDate:
//       userMembership.startDate?.toISOString() || userMembership.startDate,
//     endDate: userMembership.endDate?.toISOString() || userMembership.endDate,
//     nextBillingDate:
//       userMembership.nextBillingDate?.toISOString() ||
//       userMembership.nextBillingDate,
//     lastPaymentDate:
//       userMembership.lastPaymentDate?.toISOString() ||
//       userMembership.lastPaymentDate,
//     currentPeriodStart:
//       userMembership.currentPeriodStart?.toISOString() ||
//       userMembership.currentPeriodStart,
//     currentPeriodEnd:
//       userMembership.currentPeriodEnd?.toISOString() ||
//       userMembership.currentPeriodEnd,
//     usageResetDate:
//       userMembership.usageResetDate?.toISOString() ||
//       userMembership.usageResetDate,
//     createdAt:
//       userMembership.createdAt?.toISOString() || userMembership.createdAt,
//     updatedAt:
//       userMembership.updatedAt?.toISOString() || userMembership.updatedAt,
//   };
// };

// function calculateNextBillingDate(startDate: Date, frequency: string): Date {
//   const next = new Date(startDate);

//   switch (frequency) {
//     case "monthly":
//       next.setMonth(next.getMonth() + 1);
//       break;
//     case "quarterly":
//       next.setMonth(next.getMonth() + 3);
//       break;
//     case "yearly":
//       next.setFullYear(next.getFullYear() + 1);
//       break;
//   }

//   return next;
// }

// function calculatePeriodDates(startDate: Date, frequency: string) {
//   const periodStart = new Date(startDate);
//   const periodEnd = calculateNextBillingDate(startDate, frequency);

//   return { periodStart, periodEnd };
// }

// // ============================================================================
// // MEMBERSHIP CRUD OPERATIONS
// // ============================================================================

// export async function createMembership(
//   data: CreateMembershipData
// ): Promise<{ success: boolean; membership?: any; error?: string }> {
//   try {
//     const admin = await checkAdminAuth();
//     await connectToDatabase();

//     console.log("🔍 Creating membership...");

//     // Validate data
//     const validatedData = createMembershipSchema.parse(data);

//     // Check for existing membership with same name
//     const existingMembership = await Membership.findOne({
//       name: validatedData.name,
//     });
//     if (existingMembership) {
//       return {
//         success: false,
//         error: "A membership with this name already exists",
//       };
//     }

//     // Validate categories exist
//     for (const allocation of validatedData.productAllocations) {
//       const category = await Category.findById(allocation.categoryId);
//       if (!category) {
//         return {
//           success: false,
//           error: `Category "${allocation.categoryName}" not found`,
//         };
//       }
//     }

//     // Create membership
//     const membership = new Membership({
//       ...validatedData,
//       createdBy: admin._id,
//       totalSubscribers: 0,
//       totalRevenue: 0,
//     });

//     await membership.save();

//     console.log("✅ Membership created successfully:", membership.name);

//     revalidatePath("/admin/memberships");

//     // Populate categories for response
//     await membership.populate({
//       path: "productAllocations.categoryId",
//       select: "name slug",
//     });

//     return {
//       success: true,
//       membership: serializeMembership(membership.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error creating membership:", error);

//     if (error instanceof z.ZodError) {
//       const errorMessage = error.errors
//         .map((err) => `${err.path.join(".")}: ${err.message}`)
//         .join("; ");

//       return {
//         success: false,
//         error: `Validation failed: ${errorMessage}`,
//       };
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// export async function updateMembership(
//   membershipId: string,
//   data: UpdateMembershipData
// ): Promise<{ success: boolean; membership?: any; error?: string }> {
//   try {
//     const admin = await checkAdminAuth();
//     await connectToDatabase();

//     console.log("🔍 Updating membership:", membershipId);

//     // Validate data
//     const validatedData = updateMembershipSchema.parse(data);

//     // Check if membership exists
//     const existingMembership = await Membership.findById(membershipId);
//     if (!existingMembership) {
//       return {
//         success: false,
//         error: "Membership not found",
//       };
//     }

//     // Check for name conflicts if name is being updated
//     if (validatedData.name && validatedData.name !== existingMembership.name) {
//       const nameConflict = await Membership.findOne({
//         name: validatedData.name,
//         _id: { $ne: membershipId },
//       });
//       if (nameConflict) {
//         return {
//           success: false,
//           error: "A membership with this name already exists",
//         };
//       }
//     }

//     // Validate categories if being updated
//     if (validatedData.productAllocations) {
//       for (const allocation of validatedData.productAllocations) {
//         const category = await Category.findById(allocation.categoryId);
//         if (!category) {
//           return {
//             success: false,
//             error: `Category "${allocation.categoryName}" not found`,
//           };
//         }
//       }
//     }

//     // Update membership
//     const updatedMembership = await Membership.findByIdAndUpdate(
//       membershipId,
//       {
//         ...validatedData,
//         updatedBy: admin._id,
//       },
//       { new: true }
//     ).populate({
//       path: "productAllocations.categoryId",
//       select: "name slug",
//     });

//     console.log("✅ Membership updated successfully:", updatedMembership?.name);

//     revalidatePath("/admin/memberships");

//     return {
//       success: true,
//       membership: serializeMembership(updatedMembership?.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error updating membership:", error);

//     if (error instanceof z.ZodError) {
//       const errorMessage = error.errors
//         .map((err) => `${err.path.join(".")}: ${err.message}`)
//         .join("; ");

//       return {
//         success: false,
//         error: `Validation failed: ${errorMessage}`,
//       };
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// export async function deleteMembership(
//   membershipId: string
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     console.log("🗑️ Deleting membership:", membershipId);

//     const membership = await Membership.findById(membershipId);
//     if (!membership) {
//       return {
//         success: false,
//         error: "Membership not found",
//       };
//     }

//     // Check if membership has active subscribers
//     const activeSubscribers = await UserMembership.countDocuments({
//       membership: membershipId,
//       status: "active",
//     });

//     if (activeSubscribers > 0) {
//       return {
//         success: false,
//         error: `Cannot delete membership. It has ${activeSubscribers} active subscribers.`,
//       };
//     }

//     await Membership.findByIdAndDelete(membershipId);

//     console.log("✅ Membership deleted successfully:", membership.name);

//     revalidatePath("/admin/memberships");

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("❌ Error deleting membership:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// export async function getMemberships(
//   filters?: Partial<MembershipFilters>
// ): Promise<{
//   memberships: any[];
//   pagination: {
//     total: number;
//     totalPages: number;
//     currentPage: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//   };
//   error?: string;
// }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     const validatedFilters = membershipFiltersSchema.parse(filters || {});

//     // Build query
//     const query: any = {};

//     if (validatedFilters.tier) {
//       query.tier = validatedFilters.tier;
//     }

//     if (validatedFilters.billingFrequency) {
//       query.billingFrequency = validatedFilters.billingFrequency;
//     }

//     if (validatedFilters.isActive !== undefined) {
//       query.isActive = validatedFilters.isActive;
//     }

//     if (validatedFilters.search) {
//       query.$or = [
//         { name: { $regex: validatedFilters.search, $options: "i" } },
//         { description: { $regex: validatedFilters.search, $options: "i" } },
//         { features: { $in: [new RegExp(validatedFilters.search, "i")] } },
//       ];
//     }

//     // Build sort
//     const sort: any = {};
//     sort[validatedFilters.sortBy] =
//       validatedFilters.sortOrder === "asc" ? 1 : -1;

//     // Calculate pagination
//     const page = validatedFilters.page;
//     const limit = validatedFilters.limit;
//     const skip = (page - 1) * limit;

//     // Execute queries
//     const [memberships, total] = await Promise.all([
//       Membership.find(query)
//         .populate("createdBy", "firstName lastName email")
//         .populate({
//           path: "productAllocations.categoryId",
//           select: "name slug",
//         })
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Membership.countDocuments(query),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     console.log(`✅ Fetched ${memberships.length} memberships from database`);

//     return {
//       memberships: memberships.map((membership) =>
//         serializeMembership(membership)
//       ),
//       pagination: {
//         total,
//         totalPages,
//         currentPage: page,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     };
//   } catch (error) {
//     console.error("❌ Error fetching memberships:", error);
//     return {
//       memberships: [],
//       pagination: {
//         total: 0,
//         totalPages: 0,
//         currentPage: 1,
//         hasNextPage: false,
//         hasPrevPage: false,
//       },
//       error:
//         error instanceof Error ? error.message : "Failed to fetch memberships",
//     };
//   }
// }

// export async function getMembership(membershipId: string): Promise<{
//   success: boolean;
//   membership?: any;
//   error?: string;
// }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     const membership = await Membership.findById(membershipId)
//       .populate("createdBy", "firstName lastName email")
//       .populate("updatedBy", "firstName lastName email")
//       .populate({
//         path: "productAllocations.categoryId",
//         select: "name slug",
//       })
//       .lean();

//     if (!membership) {
//       return {
//         success: false,
//         error: "Membership not found",
//       };
//     }

//     return {
//       success: true,
//       membership: serializeMembership(membership),
//     };
//   } catch (error) {
//     console.error("❌ Error fetching membership:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// export async function toggleMembershipStatus(
//   membershipId: string
// ): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
//   try {
//     const admin = await checkAdminAuth();
//     await connectToDatabase();

//     const membership = await Membership.findById(membershipId);
//     if (!membership) {
//       return {
//         success: false,
//         error: "Membership not found",
//       };
//     }

//     const updatedMembership = await Membership.findByIdAndUpdate(
//       membershipId,
//       {
//         isActive: !membership.isActive,
//         updatedBy: admin._id,
//       },
//       { new: true }
//     );

//     console.log(
//       `✅ Membership ${updatedMembership?.isActive ? "activated" : "deactivated"}:`,
//       membership.name
//     );

//     revalidatePath("/admin/memberships");

//     return {
//       success: true,
//       isActive: updatedMembership?.isActive,
//     };
//   } catch (error) {
//     console.error("❌ Error toggling membership status:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // ============================================================================
// // USER MEMBERSHIP MANAGEMENT
// // ============================================================================

// export async function getUserMemberships(
//   filters?: Partial<UserMembershipFilters>
// ): Promise<{
//   userMemberships: any[];
//   pagination: {
//     total: number;
//     totalPages: number;
//     currentPage: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//   };
//   error?: string;
// }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     const validatedFilters = userMembershipFiltersSchema.parse(filters || {});

//     // Build query
//     const query: any = {};

//     if (validatedFilters.status) {
//       query.status = validatedFilters.status;
//     }

//     if (validatedFilters.membershipId) {
//       query.membership = validatedFilters.membershipId;
//     }

//     if (validatedFilters.search) {
//       // Search in user fields
//       const users = await User.find({
//         $or: [
//           { firstName: { $regex: validatedFilters.search, $options: "i" } },
//           { lastName: { $regex: validatedFilters.search, $options: "i" } },
//           { email: { $regex: validatedFilters.search, $options: "i" } },
//         ],
//       }).select("_id");

//       query.user = { $in: users.map((u) => u._id) };
//     }

//     // Build sort
//     const sort: any = {};
//     sort[validatedFilters.sortBy] =
//       validatedFilters.sortOrder === "asc" ? 1 : -1;

//     // Calculate pagination
//     const page = validatedFilters.page;
//     const limit = validatedFilters.limit;
//     const skip = (page - 1) * limit;

//     // Execute queries
//     const [userMemberships, total] = await Promise.all([
//       UserMembership.find(query)
//         .populate("user", "firstName lastName email imageUrl")
//         .populate("membership", "name tier price billingFrequency")
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       UserMembership.countDocuments(query),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     console.log(
//       `✅ Fetched ${userMemberships.length} user memberships from database`
//     );

//     return {
//       userMemberships: userMemberships.map((um) => serializeUserMembership(um)),
//       pagination: {
//         total,
//         totalPages,
//         currentPage: page,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     };
//   } catch (error) {
//     console.error("❌ Error fetching user memberships:", error);
//     return {
//       userMemberships: [],
//       pagination: {
//         total: 0,
//         totalPages: 0,
//         currentPage: 1,
//         hasNextPage: false,
//         hasPrevPage: false,
//       },
//       error:
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch user memberships",
//     };
//   }
// }

// export async function createUserMembership(
//   userId: string,
//   membershipId: string,
//   startDate?: Date
// ): Promise<{ success: boolean; userMembership?: any; error?: string }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     // Validate user and membership exist
//     const [user, membership] = await Promise.all([
//       User.findById(userId),
//       Membership.findById(membershipId),
//     ]);

//     if (!user) {
//       return { success: false, error: "User not found" };
//     }

//     if (!membership || !membership.isActive) {
//       return { success: false, error: "Membership not found or inactive" };
//     }

//     // Check if user already has an active membership
//     const existingMembership = await UserMembership.findOne({
//       user: userId,
//       status: "active",
//     });

//     if (existingMembership) {
//       return {
//         success: false,
//         error: "User already has an active membership",
//       };
//     }

//     const start = startDate || new Date();
//     const { periodStart, periodEnd } = calculatePeriodDates(
//       start,
//       membership.billingFrequency
//     );

//     // Initialize product usage tracking
//     const productUsage = membership.productAllocations.map((allocation) => ({
//       categoryId: allocation.categoryId,
//       categoryName: allocation.categoryName,
//       allocatedQuantity: allocation.quantity,
//       usedQuantity: 0,
//       availableQuantity: allocation.quantity,
//     }));

//     const userMembership = new UserMembership({
//       user: userId,
//       membership: membershipId,
//       startDate: start,
//       nextBillingDate: calculateNextBillingDate(
//         start,
//         membership.billingFrequency
//       ),
//       currentPeriodStart: periodStart,
//       currentPeriodEnd: periodEnd,
//       usageResetDate: periodEnd,
//       productUsage,
//       autoRenewal: true,
//     });

//     await userMembership.save();

//     // Update membership stats
//     await Membership.findByIdAndUpdate(membershipId, {
//       $inc: { totalSubscribers: 1 },
//     });

//     console.log(`✅ Created user membership for ${user.email}`);

//     revalidatePath("/admin/memberships");

//     return {
//       success: true,
//       userMembership: serializeUserMembership(userMembership.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error creating user membership:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // ============================================================================
// // MEMBERSHIP STATISTICS
// // ============================================================================

// export async function getMembershipStats(): Promise<{
//   totalMemberships: number;
//   activeMemberships: number;
//   totalSubscribers: number;
//   totalRevenue: number;
//   averageRevenue: number;
//   membershipsByTier: Array<{
//     tier: string;
//     count: number;
//     subscribers: number;
//     revenue: number;
//   }>;
//   recentSubscriptions: any[];
//   topMemberships: any[];
// }> {
//   try {
//     await checkAdminAuth();
//     await connectToDatabase();

//     const [
//       totalMemberships,
//       activeMemberships,
//       totalSubscribers,
//       membershipStats,
//       membershipsByTier,
//       recentSubscriptions,
//       topMemberships,
//     ] = await Promise.all([
//       Membership.countDocuments(),
//       Membership.countDocuments({ isActive: true }),
//       UserMembership.countDocuments({ status: "active" }),
//       Membership.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalRevenue: { $sum: "$totalRevenue" },
//             averagePrice: { $avg: "$price" },
//           },
//         },
//       ]),
//       Membership.aggregate([
//         {
//           $group: {
//             _id: "$tier",
//             count: { $sum: 1 },
//             subscribers: { $sum: "$totalSubscribers" },
//             revenue: { $sum: "$totalRevenue" },
//           },
//         },
//         {
//           $project: {
//             tier: "$_id",
//             count: 1,
//             subscribers: 1,
//             revenue: 1,
//             _id: 0,
//           },
//         },
//       ]),
//       UserMembership.find({ status: "active" })
//         .populate("user", "firstName lastName email")
//         .populate("membership", "name tier")
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .lean(),
//       Membership.find()
//         .sort({ totalSubscribers: -1 })
//         .limit(5)
//         .select("name tier totalSubscribers totalRevenue")
//         .lean(),
//     ]);

//     const stats = membershipStats[0] || { totalRevenue: 0, averagePrice: 0 };

//     console.log("✅ Membership statistics calculated successfully");

//     return {
//       totalMemberships,
//       activeMemberships,
//       totalSubscribers,
//       totalRevenue: stats.totalRevenue,
//       averageRevenue: stats.averagePrice,
//       membershipsByTier,
//       recentSubscriptions: recentSubscriptions.map((sub) =>
//         serializeUserMembership(sub)
//       ),
//       topMemberships: topMemberships.map((membership) =>
//         serializeMembership(membership)
//       ),
//     };
//   } catch (error) {
//     console.error("❌ Error fetching membership statistics:", error);
//     return {
//       totalMemberships: 0,
//       activeMemberships: 0,
//       totalSubscribers: 0,
//       totalRevenue: 0,
//       averageRevenue: 0,
//       membershipsByTier: [],
//       recentSubscriptions: [],
//       topMemberships: [],
//     };
//   }
// }
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import Stripe from "stripe";
import { connectToDatabase } from "../db";
import {
  Membership,
  UserMembership,
  MembershipOrder,
  MembershipAnalytics,
  User,
  Category,
  Product,
  IMembership,
  IUserMembership,
  IMembershipOrder,
} from "../db/models";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to extract ID from various formats (same as frontend)
const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    // Handle nested objects like { _id: "...", name: "..." }
    if (value._id) {
      const id = value._id;
      if (typeof id === "string") return id;
      if (id.toHexString && typeof id.toHexString === "function") {
        return id.toHexString();
      }
      return String(id);
    }
    // Handle MongoDB ObjectId directly
    if (value.toHexString && typeof value.toHexString === "function") {
      return value.toHexString();
    }
    // Handle case where the whole object is the ID
    if (value.toString && value.toString() !== "[object Object]") {
      return value.toString();
    }
  }
  return String(value);
};

// Helper function to clean product allocations data
const cleanProductAllocations = (allocations: any[]) => {
  return allocations.map((allocation) => ({
    ...allocation,
    categoryId: extractId(allocation.categoryId),
    allowedProducts: Array.isArray(allocation.allowedProducts)
      ? allocation.allowedProducts.map(extractId)
      : [],
  }));
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const membershipFiltersSchema = z.object({
  tier: z.enum(["basic", "premium", "vip", "elite"]).optional(),
  billingFrequency: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["name", "price", "tier", "totalSubscribers", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const createMembershipSchema = z.object({
  name: z.string().min(1, "Membership name is required"),
  description: z.string().optional(),
  tier: z.enum(["basic", "premium", "vip", "elite"]),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),
  currency: z.string().min(1, "Currency is required"),

  // Product Allocations
  productAllocations: z
    .array(
      z.object({
        categoryId: z.string().min(1, "Category is required"),
        categoryName: z.string().min(1, "Category name is required"),
        quantity: z.number().min(0, "Quantity must be positive"),
        allowedProducts: z.array(z.string()).default([]),
      })
    )
    .min(1, "At least one product allocation is required"),

  // Custom Benefits
  customBenefits: z
    .array(
      z.object({
        title: z.string().min(1, "Benefit title is required"),
        description: z.string().min(1, "Benefit description is required"),
        type: z.enum(["webinar", "content", "discount", "service", "other"]),
        value: z.string().optional(),
      })
    )
    .default([]),

  // Features
  features: z.array(z.string()).default([]),

  // Configuration
  maxProductsPerMonth: z.number().min(0).optional(),
  deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  freeDelivery: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),

  // Display
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const updateMembershipSchema = createMembershipSchema.partial();

const userMembershipFiltersSchema = z.object({
  status: z
    .enum(["active", "cancelled", "expired", "paused", "trial"])
    .optional(),
  membershipId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["startDate", "nextBillingDate", "lastPaymentDate"])
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

type MembershipFilters = z.infer<typeof membershipFiltersSchema>;
type CreateMembershipData = z.infer<typeof createMembershipSchema>;
type UpdateMembershipData = z.infer<typeof updateMembershipSchema>;
type UserMembershipFilters = z.infer<typeof userMembershipFiltersSchema>;

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

const serializeMembership = (membership: any): any => {
  if (!membership) return null;

  return {
    ...membership,
    _id: membership._id?.toString() || membership._id,
    createdBy: membership.createdBy?.toString() || membership.createdBy,
    updatedBy: membership.updatedBy?.toString() || membership.updatedBy,
    productAllocations:
      membership.productAllocations?.map((allocation: any) => ({
        ...allocation,
        categoryId: allocation.categoryId?.toString() || allocation.categoryId,
        allowedProducts:
          allocation.allowedProducts?.map((id: any) => id?.toString() || id) ||
          [],
      })) || [],
    createdAt: membership.createdAt?.toISOString() || membership.createdAt,
    updatedAt: membership.updatedAt?.toISOString() || membership.updatedAt,
  };
};

const serializeUserMembership = (userMembership: any): any => {
  if (!userMembership) return null;

  return {
    ...userMembership,
    _id: userMembership._id?.toString() || userMembership._id,
    user: userMembership.user?.toString() || userMembership.user,
    membership:
      typeof userMembership.membership === "object" && userMembership.membership
        ? {
            ...userMembership.membership,
            _id:
              userMembership.membership._id?.toString() ||
              userMembership.membership._id,
          }
        : userMembership.membership?.toString() || userMembership.membership,
    startDate:
      userMembership.startDate?.toISOString() || userMembership.startDate,
    endDate: userMembership.endDate?.toISOString() || userMembership.endDate,
    nextBillingDate:
      userMembership.nextBillingDate?.toISOString() ||
      userMembership.nextBillingDate,
    lastPaymentDate:
      userMembership.lastPaymentDate?.toISOString() ||
      userMembership.lastPaymentDate,
    currentPeriodStart:
      userMembership.currentPeriodStart?.toISOString() ||
      userMembership.currentPeriodStart,
    currentPeriodEnd:
      userMembership.currentPeriodEnd?.toISOString() ||
      userMembership.currentPeriodEnd,
    usageResetDate:
      userMembership.usageResetDate?.toISOString() ||
      userMembership.usageResetDate,
    createdAt:
      userMembership.createdAt?.toISOString() || userMembership.createdAt,
    updatedAt:
      userMembership.updatedAt?.toISOString() || userMembership.updatedAt,
  };
};

function calculateNextBillingDate(startDate: Date, frequency: string): Date {
  const next = new Date(startDate);

  switch (frequency) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

function calculatePeriodDates(startDate: Date, frequency: string) {
  const periodStart = new Date(startDate);
  const periodEnd = calculateNextBillingDate(startDate, frequency);

  return { periodStart, periodEnd };
}

// ============================================================================
// MEMBERSHIP CRUD OPERATIONS
// ============================================================================

export async function createMembership(
  data: CreateMembershipData
): Promise<{ success: boolean; membership?: any; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Creating membership...");
    console.log("Raw data received:", JSON.stringify(data, null, 2));

    // Validate data
    const validatedData = createMembershipSchema.parse(data);
    console.log("Validated data:", JSON.stringify(validatedData, null, 2));

    // Clean product allocations to ensure proper ID extraction
    const cleanedAllocations = cleanProductAllocations(
      validatedData.productAllocations
    );
    console.log(
      "Cleaned allocations:",
      JSON.stringify(cleanedAllocations, null, 2)
    );

    // Check for existing membership with same name
    const existingMembership = await Membership.findOne({
      name: validatedData.name,
    });
    if (existingMembership) {
      return {
        success: false,
        error: "A membership with this name already exists",
      };
    }

    // Validate categories exist
    for (const allocation of cleanedAllocations) {
      console.log(`Validating category ID: "${allocation.categoryId}"`);

      if (
        !allocation.categoryId ||
        allocation.categoryId === "[object Object]"
      ) {
        return {
          success: false,
          error: `Invalid category ID for "${allocation.categoryName}"`,
        };
      }

      const category = await Category.findById(allocation.categoryId);
      if (!category) {
        return {
          success: false,
          error: `Category "${allocation.categoryName}" not found`,
        };
      }
      console.log(`✅ Category "${category.name}" validated`);
    }

    // Create membership with cleaned data
    const membership = new Membership({
      ...validatedData,
      productAllocations: cleanedAllocations,
      createdBy: admin._id,
      totalSubscribers: 0,
      totalRevenue: 0,
    });

    await membership.save();

    console.log("✅ Membership created successfully:", membership.name);

    revalidatePath("/admin/memberships");

    // Populate categories for response
    await membership.populate({
      path: "productAllocations.categoryId",
      select: "name slug",
    });

    return {
      success: true,
      membership: serializeMembership(membership.toObject()),
    };
  } catch (error) {
    console.error("❌ Error creating membership:", error);

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

export async function updateMembership(
  membershipId: string,
  data: UpdateMembershipData
): Promise<{ success: boolean; membership?: any; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Updating membership:", membershipId);
    console.log("Raw update data received:", JSON.stringify(data, null, 2));

    // Validate data
    const validatedData = updateMembershipSchema.parse(data);
    console.log(
      "Validated update data:",
      JSON.stringify(validatedData, null, 2)
    );

    // Check if membership exists
    const existingMembership = await Membership.findById(membershipId);
    if (!existingMembership) {
      return {
        success: false,
        error: "Membership not found",
      };
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingMembership.name) {
      const nameConflict = await Membership.findOne({
        name: validatedData.name,
        _id: { $ne: membershipId },
      });
      if (nameConflict) {
        return {
          success: false,
          error: "A membership with this name already exists",
        };
      }
    }

    // Clean and validate product allocations if being updated
    const updateData = { ...validatedData };

    if (validatedData.productAllocations) {
      const cleanedAllocations = cleanProductAllocations(
        validatedData.productAllocations
      );
      console.log(
        "Cleaned update allocations:",
        JSON.stringify(cleanedAllocations, null, 2)
      );

      // Validate categories exist
      for (const allocation of cleanedAllocations) {
        console.log(
          `Validating category ID for update: "${allocation.categoryId}"`
        );

        if (
          !allocation.categoryId ||
          allocation.categoryId === "[object Object]"
        ) {
          return {
            success: false,
            error: `Invalid category ID for "${allocation.categoryName}"`,
          };
        }

        const category = await Category.findById(allocation.categoryId);
        if (!category) {
          return {
            success: false,
            error: `Category "${allocation.categoryName}" not found`,
          };
        }
        console.log(`✅ Category "${category.name}" validated for update`);
      }

      updateData.productAllocations = cleanedAllocations;
    }

    // Update membership
    const updatedMembership = await Membership.findByIdAndUpdate(
      membershipId,
      {
        ...updateData,
        updatedBy: admin._id,
      },
      { new: true }
    ).populate({
      path: "productAllocations.categoryId",
      select: "name slug",
    });

    console.log("✅ Membership updated successfully:", updatedMembership?.name);

    revalidatePath("/admin/memberships");

    return {
      success: true,
      membership: serializeMembership(updatedMembership?.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating membership:", error);

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

export async function deleteMembership(
  membershipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🗑️ Deleting membership:", membershipId);

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return {
        success: false,
        error: "Membership not found",
      };
    }

    // Check if membership has active subscribers
    const activeSubscribers = await UserMembership.countDocuments({
      membership: membershipId,
      status: "active",
    });

    if (activeSubscribers > 0) {
      return {
        success: false,
        error: `Cannot delete membership. It has ${activeSubscribers} active subscribers.`,
      };
    }

    await Membership.findByIdAndDelete(membershipId);

    console.log("✅ Membership deleted successfully:", membership.name);

    revalidatePath("/admin/memberships");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getMemberships(
  filters?: Partial<MembershipFilters>
): Promise<{
  memberships: any[];
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

    const validatedFilters = membershipFiltersSchema.parse(filters || {});

    // Build query
    const query: any = {};

    if (validatedFilters.tier) {
      query.tier = validatedFilters.tier;
    }

    if (validatedFilters.billingFrequency) {
      query.billingFrequency = validatedFilters.billingFrequency;
    }

    if (validatedFilters.isActive !== undefined) {
      query.isActive = validatedFilters.isActive;
    }

    if (validatedFilters.search) {
      query.$or = [
        { name: { $regex: validatedFilters.search, $options: "i" } },
        { description: { $regex: validatedFilters.search, $options: "i" } },
        { features: { $in: [new RegExp(validatedFilters.search, "i")] } },
      ];
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
    const [memberships, total] = await Promise.all([
      Membership.find(query)
        .populate("createdBy", "firstName lastName email")
        .populate({
          path: "productAllocations.categoryId",
          select: "name slug",
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Membership.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${memberships.length} memberships from database`);

    return {
      memberships: memberships.map((membership) =>
        serializeMembership(membership)
      ),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching memberships:", error);
    return {
      memberships: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error:
        error instanceof Error ? error.message : "Failed to fetch memberships",
    };
  }
}

export async function getMembership(membershipId: string): Promise<{
  success: boolean;
  membership?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const membership = await Membership.findById(membershipId)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate({
        path: "productAllocations.categoryId",
        select: "name slug",
      })
      .lean();

    if (!membership) {
      return {
        success: false,
        error: "Membership not found",
      };
    }

    return {
      success: true,
      membership: serializeMembership(membership),
    };
  } catch (error) {
    console.error("❌ Error fetching membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function toggleMembershipStatus(
  membershipId: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  try {
    const admin = await checkAdminAuth();
    await connectToDatabase();

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return {
        success: false,
        error: "Membership not found",
      };
    }

    const updatedMembership = await Membership.findByIdAndUpdate(
      membershipId,
      {
        isActive: !membership.isActive,
        updatedBy: admin._id,
      },
      { new: true }
    );

    console.log(
      `✅ Membership ${updatedMembership?.isActive ? "activated" : "deactivated"}:`,
      membership.name
    );

    revalidatePath("/admin/memberships");

    return {
      success: true,
      isActive: updatedMembership?.isActive,
    };
  } catch (error) {
    console.error("❌ Error toggling membership status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// ============================================================================
// USER MEMBERSHIP MANAGEMENT
// ============================================================================

export async function getUserMemberships(
  filters?: Partial<UserMembershipFilters>
): Promise<{
  userMemberships: any[];
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

    const validatedFilters = userMembershipFiltersSchema.parse(filters || {});

    // Build query
    const query: any = {};

    if (validatedFilters.status) {
      query.status = validatedFilters.status;
    }

    if (validatedFilters.membershipId) {
      query.membership = validatedFilters.membershipId;
    }

    if (validatedFilters.search) {
      // Search in user fields
      const users = await User.find({
        $or: [
          { firstName: { $regex: validatedFilters.search, $options: "i" } },
          { lastName: { $regex: validatedFilters.search, $options: "i" } },
          { email: { $regex: validatedFilters.search, $options: "i" } },
        ],
      }).select("_id");

      query.user = { $in: users.map((u) => u._id) };
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
    const [userMemberships, total] = await Promise.all([
      UserMembership.find(query)
        .populate("user", "firstName lastName email imageUrl")
        .populate("membership", "name tier price billingFrequency")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      UserMembership.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(
      `✅ Fetched ${userMemberships.length} user memberships from database`
    );

    return {
      userMemberships: userMemberships.map((um) => serializeUserMembership(um)),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching user memberships:", error);
    return {
      userMemberships: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user memberships",
    };
  }
}

export async function createUserMembership(
  userId: string,
  membershipId: string,
  startDate?: Date
): Promise<{ success: boolean; userMembership?: any; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    // Validate user and membership exist
    const [user, membership] = await Promise.all([
      User.findById(userId),
      Membership.findById(membershipId),
    ]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!membership || !membership.isActive) {
      return { success: false, error: "Membership not found or inactive" };
    }

    // Check if user already has an active membership
    const existingMembership = await UserMembership.findOne({
      user: userId,
      status: "active",
    });

    if (existingMembership) {
      return {
        success: false,
        error: "User already has an active membership",
      };
    }

    const start = startDate || new Date();
    const { periodStart, periodEnd } = calculatePeriodDates(
      start,
      membership.billingFrequency
    );

    // Initialize product usage tracking
    const productUsage = membership.productAllocations.map((allocation) => ({
      categoryId: allocation.categoryId,
      categoryName: allocation.categoryName,
      allocatedQuantity: allocation.quantity,
      usedQuantity: 0,
      availableQuantity: allocation.quantity,
    }));

    const userMembership = new UserMembership({
      user: userId,
      membership: membershipId,
      startDate: start,
      nextBillingDate: calculateNextBillingDate(
        start,
        membership.billingFrequency
      ),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      usageResetDate: periodEnd,
      productUsage,
      autoRenewal: true,
    });

    await userMembership.save();

    // Update membership stats
    await Membership.findByIdAndUpdate(membershipId, {
      $inc: { totalSubscribers: 1 },
    });

    console.log(`✅ Created user membership for ${user.email}`);

    revalidatePath("/admin/memberships");

    return {
      success: true,
      userMembership: serializeUserMembership(userMembership.toObject()),
    };
  } catch (error) {
    console.error("❌ Error creating user membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// ============================================================================
// MEMBERSHIP STATISTICS
// ============================================================================

export async function getMembershipStats(): Promise<{
  totalMemberships: number;
  activeMemberships: number;
  totalSubscribers: number;
  totalRevenue: number;
  averageRevenue: number;
  membershipsByTier: Array<{
    tier: string;
    count: number;
    subscribers: number;
    revenue: number;
  }>;
  recentSubscriptions: any[];
  topMemberships: any[];
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const [
      totalMemberships,
      activeMemberships,
      totalSubscribers,
      membershipStats,
      membershipsByTier,
      recentSubscriptions,
      topMemberships,
    ] = await Promise.all([
      Membership.countDocuments(),
      Membership.countDocuments({ isActive: true }),
      UserMembership.countDocuments({ status: "active" }),
      Membership.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalRevenue" },
            averagePrice: { $avg: "$price" },
          },
        },
      ]),
      Membership.aggregate([
        {
          $group: {
            _id: "$tier",
            count: { $sum: 1 },
            subscribers: { $sum: "$totalSubscribers" },
            revenue: { $sum: "$totalRevenue" },
          },
        },
        {
          $project: {
            tier: "$_id",
            count: 1,
            subscribers: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]),
      UserMembership.find({ status: "active" })
        .populate("user", "firstName lastName email")
        .populate("membership", "name tier")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Membership.find()
        .sort({ totalSubscribers: -1 })
        .limit(5)
        .select("name tier totalSubscribers totalRevenue")
        .lean(),
    ]);

    const stats = membershipStats[0] || { totalRevenue: 0, averagePrice: 0 };

    console.log("✅ Membership statistics calculated successfully");

    return {
      totalMemberships,
      activeMemberships,
      totalSubscribers,
      totalRevenue: stats.totalRevenue,
      averageRevenue: stats.averagePrice,
      membershipsByTier,
      recentSubscriptions: recentSubscriptions.map((sub) =>
        serializeUserMembership(sub)
      ),
      topMemberships: topMemberships.map((membership) =>
        serializeMembership(membership)
      ),
    };
  } catch (error) {
    console.error("❌ Error fetching membership statistics:", error);
    return {
      totalMemberships: 0,
      activeMemberships: 0,
      totalSubscribers: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      membershipsByTier: [],
      recentSubscriptions: [],
      topMemberships: [],
    };
  }
}

// ============================================================================
// GET CATEGORIES FOR DROPDOWN
// ============================================================================

export async function getCategories(): Promise<{
  success: boolean;
  categories?: any[];
  error?: string;
}> {
  try {
    await connectToDatabase();

    const categories = await Category.find({ isActive: true })
      .select("_id name slug")
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      categories: categories.map((cat) => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}
// Add this function to your membershipServerActions.ts file

// Get Current User's Memberships (for account page)
export async function getCurrentUserMemberships(): Promise<{
  success: boolean;
  userMemberships?: any[];
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Find the user by Clerk ID first
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get user's memberships using the database user ID
    const userMemberships = await UserMembership.find({
      user: user._id,
    })
      .populate(
        "membership",
        "name tier price billingFrequency deliveryFrequency productAllocations features customBenefits"
      )
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      `✅ Fetched ${userMemberships.length} memberships for user ${user.email}`
    );

    return {
      success: true,
      userMemberships: userMemberships.map((um) => serializeUserMembership(um)),
    };
  } catch (error) {
    console.error("❌ Error fetching current user memberships:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch memberships",
    };
  }
}
