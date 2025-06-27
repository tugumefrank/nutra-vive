// lib/actions/membershipProductServerActions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../db";
import {
  Product,
  Category,
  User,
  UserMembership,
  IProduct,
  ICategory,
  IUserMembership,
} from "../db/models";

// Enhanced product interface with membership context
export interface ProductWithMembership extends IProduct {
  membershipInfo?: {
    isEligibleForFree: boolean;
    remainingAllocation: number;
    categoryName: string;
    categoryId: string;
    membershipTier: string;
    totalAllocation: number;
    usedAllocation: number;
    savings: number; // How much they'd save if they get it free
  };
}

export interface ProductListResponse {
  products: ProductWithMembership[];
  total: number;
  totalPages: number;
  currentPage: number;
  membershipSummary?: {
    tier: string;
    totalAllocations: Array<{
      categoryId: string;
      categoryName: string;
      totalAllocation: number;
      usedAllocation: number;
      remainingAllocation: number;
    }>;
    totalMonthlySavings: number;
  };
}

// Helper function to get user's active membership
async function getUserActiveMembership(userId: string) {
  try {
    const user = await User.findOne({ clerkId: userId });
    if (!user) return null;

    const membership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership");

    return membership;
  } catch (error) {
    console.error("Error fetching user membership:", error);
    return null;
  }
}

// Enhanced product fetching with membership context
export async function getProductsWithMembership(filters?: {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<ProductListResponse> {
  try {
    const { userId } = await auth();
    await connectToDatabase();

    // Build product query (same as existing)
    const query: any = { isActive: true };
    const sortOptions: any = {};

    if (filters?.category && filters.category !== "All") {
      const category = await Category.findOne({ name: filters.category });
      if (category) {
        query.category = category._id;
      }
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "name";
    const sortOrder = filters?.sortOrder === "desc" ? -1 : 1;
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    // Fetch products
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug _id")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get user membership if authenticated
    let membership: any = null;
    let membershipSummary: any = undefined;

    if (userId) {
      membership = await getUserActiveMembership(userId);

      if (membership) {
        // Calculate membership summary
        membershipSummary = {
          tier: (membership.membership as any).tier,
          totalAllocations: membership.productUsage.map((usage: any) => ({
            categoryId: usage.categoryId.toString(),
            categoryName: usage.categoryName,
            totalAllocation: usage.allocatedQuantity,
            usedAllocation: usage.usedQuantity,
            remainingAllocation: usage.availableQuantity,
          })),
          totalMonthlySavings: 0, // Will calculate below
        };
      }
    }

    // Enhance products with membership info
    const enhancedProducts: ProductWithMembership[] = products.map(
      (product) => {
        const enhancedProduct: ProductWithMembership = {
          ...product,
          _id: product._id.toString(),
          category: product.category
            ? {
                ...(product.category as any),
                _id: (product.category as any)._id.toString(),
              }
            : null,
        };

        // Add membership info if user has membership and product is eligible
        if (membership && product.category) {
          const categoryUsage = membership.productUsage.find(
            (usage: any) =>
              usage.categoryId.toString() === (product.category as any)._id.toString()
          );

          if (categoryUsage && categoryUsage.availableQuantity > 0) {
            enhancedProduct.membershipInfo = {
              isEligibleForFree: true,
              remainingAllocation: categoryUsage.availableQuantity,
              categoryName: categoryUsage.categoryName,
              categoryId: categoryUsage.categoryId.toString(),
              membershipTier: (membership.membership as any).tier,
              totalAllocation: categoryUsage.allocatedQuantity,
              usedAllocation: categoryUsage.usedQuantity,
              savings: product.price, // They save the full price
            };

            // Add to total monthly savings
            if (membershipSummary) {
              membershipSummary.totalMonthlySavings += product.price;
            }
          }
        }

        return enhancedProduct;
      }
    );

    console.log(
      `✅ Fetched ${enhancedProducts.length} products with membership context`
    );

    return {
      products: enhancedProducts,
      total,
      totalPages,
      currentPage: page,
      membershipSummary,
    };
  } catch (error) {
    console.error("❌ Error fetching products with membership:", error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Get single product with membership context
export async function getProductWithMembership(
  slug: string
): Promise<ProductWithMembership | null> {
  try {
    const { userId } = await auth();
    await connectToDatabase();

    const product = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug _id")
      .lean();

    if (!product) return null;

    const enhancedProduct: ProductWithMembership = {
      ...product,
      _id: product._id.toString(),
      category: product.category
        ? {
            ...(product.category as any),
            _id: (product.category as any)._id.toString(),
          }
        : null,
    };

    // Add membership info if user is authenticated
    if (userId) {
      const membership = await getUserActiveMembership(userId);

      if (membership && product.category) {
        const categoryUsage = membership.productUsage.find(
          (usage: any) =>
            usage.categoryId.toString() === (product.category as any)._id.toString()
        );

        if (categoryUsage && categoryUsage.availableQuantity > 0) {
          enhancedProduct.membershipInfo = {
            isEligibleForFree: true,
            remainingAllocation: categoryUsage.availableQuantity,
            categoryName: categoryUsage.categoryName,
            categoryId: categoryUsage.categoryId.toString(),
            membershipTier: (membership.membership as any).tier,
            totalAllocation: categoryUsage.allocatedQuantity,
            usedAllocation: categoryUsage.usedQuantity,
            savings: product.price,
          };
        }
      }
    }

    return enhancedProduct;
  } catch (error) {
    console.error("❌ Error fetching product with membership:", error);
    return null;
  }
}

// Check if user has active membership
export async function getUserMembershipStatus(): Promise<{
  hasMembership: boolean;
  tier?: string;
  allocations?: Array<{
    categoryId: string;
    categoryName: string;
    remainingAllocation: number;
    totalAllocation: number;
  }>;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { hasMembership: false };
    }

    const membership = await getUserActiveMembership(userId);

    if (!membership) {
      return { hasMembership: false };
    }

    return {
      hasMembership: true,
      tier: (membership.membership as any).tier,
      allocations: membership.productUsage.map((usage: any) => ({
        categoryId: usage.categoryId.toString(),
        categoryName: usage.categoryName,
        remainingAllocation: usage.availableQuantity,
        totalAllocation: usage.allocatedQuantity,
      })),
    };
  } catch (error) {
    console.error("❌ Error checking membership status:", error);
    return { hasMembership: false };
  }
}

// Get featured products with membership context
export async function getFeaturedProductsWithMembership(
  limit: number = 8
): Promise<ProductWithMembership[]> {
  try {
    const result = await getProductsWithMembership({
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    return result.products.filter((product) => product.isFeatured);
  } catch (error) {
    console.error(
      "❌ Error fetching featured products with membership:",
      error
    );
    return [];
  }
}
