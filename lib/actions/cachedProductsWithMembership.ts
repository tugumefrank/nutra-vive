"use server";

import { unstable_cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../db";
import { Product, Category, User, UserMembership } from "../db/models";
import { ProductWithMembership, ProductListResponse } from "./membershipProductServerActions";

// Helper function to get user's active membership
async function getUserActiveMembership(userId: string) {
  try {
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      return null;
    }

    const membership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership").lean();

    return membership;
  } catch (error) {
    console.error("❌ Error fetching user membership:", error);
    return null;
  }
}

// Helper function to enhance products with membership info
async function enhanceProductsWithMembership(
  products: any[], 
  userId: string | null
): Promise<ProductWithMembership[]> {
  // Get user membership if authenticated
  let membership: any = null;
  
  if (userId) {
    membership = await getUserActiveMembership(userId);
  }

  // Enhance products with membership info
  const enhancedProducts: ProductWithMembership[] = products.map((product) => {
    const enhancedProduct: ProductWithMembership = {
      ...product,
      _id: product._id.toString(),
      category: product.category
        ? {
            ...(product.category as any),
            _id: (product.category as any)._id.toString(),
          }
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Add membership info if user has membership and product is eligible
    if (membership && product.category) {
      const categoryUsage = membership.productUsage.find((usage: any) => {
        const usageCategoryId = usage.categoryId?.toString();
        const productCategoryId = (product.category as any)?._id?.toString();
        const productCategoryName = (product.category as any)?.name?.toLowerCase();
        const usageCategoryName = usage.categoryName?.toLowerCase();

        // Handle potential undefined values
        if (!usageCategoryId || !productCategoryId) {
          return false;
        }

        // Primary match: by category ID
        if (usageCategoryId === productCategoryId) {
          return true;
        }

        // Fallback match: by category name (case-insensitive)
        if (
          usageCategoryName &&
          productCategoryName &&
          usageCategoryName === productCategoryName
        ) {
          return true;
        }

        // Special case mapping for category name variations
        const nameMapping: { [key: string]: string[] } = {
          "iced tea": ["iced tea", "ice tea", "iced-tea"],
          "tea bags": ["tea bags", "tea bag", "tea-bags", "teabags"],
          juice: ["juice", "juices"],
          "herbal tea": ["herbal tea", "herbal-tea", "herbal"],
        };

        for (const [canonical, variations] of Object.entries(nameMapping)) {
          if (
            variations.includes(usageCategoryName) &&
            variations.includes(productCategoryName)
          ) {
            return true;
          }
        }

        return false;
      });

      if (categoryUsage && categoryUsage.availableQuantity > 0) {
        enhancedProduct.membershipInfo = {
          isEligibleForFree: true,
          remainingAllocation: categoryUsage.availableQuantity,
          categoryName: categoryUsage.categoryName,
          categoryId: categoryUsage.categoryId.toString(),
          membershipTier: (membership.membership as any).tier,
          totalAllocation: categoryUsage.allocatedQuantity,
          usedAllocation: categoryUsage.usedQuantity,
          savings: enhancedProduct.price, // They save the full price
        };
      }
    }

    return enhancedProduct;
  });

  return enhancedProducts;
}

// Core cached function for products (without membership data)
const getCachedProductsCore = unstable_cache(
  async (filters: {
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<{
    products: any[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    try {
      await connectToDatabase();

      // Build product query
      const query: any = { isActive: true };
      const sortOptions: any = {};

      // Fix category filtering - use slug instead of name
      if (filters?.category && filters.category !== "All") {
        const category = await Category.findOne({ 
          $or: [
            { slug: filters.category },
            { name: filters.category }
          ]
        });
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

      // Apply sorting - prioritize featured products when no filters
      const sortBy = filters?.sortBy || "name";
      const sortOrder = filters?.sortOrder === "desc" ? -1 : 1;
      
      // Special sorting for default view (no search, no category filter)
      if (!filters?.search && (!filters?.category || filters.category === "All")) {
        // Custom sort will be handled in aggregation pipeline
        sortOptions[sortBy] = sortOrder;
      } else {
        sortOptions[sortBy] = sortOrder;
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const skip = (page - 1) * limit;

      let products, total;

      // Special handling for default view (no filters) - show ALL products but with custom sorting
      if (!filters?.search && (!filters?.category || filters.category === "All")) {
        // Get all products first, then sort by priority
        const allProducts = await Product.find(query)
          .populate("category", "name slug description imageUrl isActive createdAt updatedAt")
          .lean();

        // Sort products by priority
        const sortedProducts = allProducts.sort((a, b) => {
          const getPriority = (product: any) => {
            // Highest priority: Nutra-Reset specifically
            if (product.name?.match(/Nutra.*Reset|Nutra-Reset/i)) {
              return 1;
            }
            // Second priority: Juice category
            if (product.category?.name === "Juice") {
              return 2;
            }
            // Third priority: Iced Tea category
            if (product.category?.name === "Iced Tea") {
              return 3;
            }
            // Fourth priority: Herbal Tea category
            if (product.category?.name === "Herbal Tea") {
              return 4;
            }
            // Fifth priority: Tea bags category
            if (product.category?.name === "Tea bags") {
              return 5;
            }
            // All other products
            return 6;
          };

          const priorityA = getPriority(a);
          const priorityB = getPriority(b);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // If same priority, sort by name
          return a.name.localeCompare(b.name);
        });

        // Apply pagination to sorted results
        products = sortedProducts.slice(skip, skip + limit);
        total = allProducts.length;
      } else {
        // Regular sorting for filtered views
        [products, total] = await Promise.all([
          Product.find(query)
            .populate("category", "name slug description imageUrl isActive createdAt updatedAt")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
          Product.countDocuments(query),
        ]);
      }

      const totalPages = Math.ceil(total / limit);

      return {
        products,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  },
  ["products-with-membership"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["products"],
  }
);

// Main function that combines cached products with membership data
export async function getCachedProductsWithMembership(filters?: {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> {
  try {
    const { userId } = await auth();
    
    // Get cached products data
    const { products, total, totalPages, currentPage } = await getCachedProductsCore(filters || {});
    
    // Enhance products with membership info
    const enhancedProducts = await enhanceProductsWithMembership(products, userId);
    
    // Build membership summary if user is authenticated
    let membershipSummary: any = undefined;
    if (userId) {
      const membership = await getUserActiveMembership(userId);
      if (membership) {
        membershipSummary = {
          tier: (membership.membership as any).tier,
          totalAllocations: membership.productUsage.map((usage: any) => ({
            categoryId: usage.categoryId.toString(),
            categoryName: usage.categoryName,
            totalAllocation: usage.allocatedQuantity,
            usedAllocation: usage.usedQuantity,
            remainingAllocation: usage.availableQuantity,
          })),
          totalMonthlySavings: membership.productUsage.reduce((sum: number, usage: any) => {
            return sum + (usage.usedQuantity * 10); // Approximate savings
          }, 0),
        };
      }
    }

    return {
      products: enhancedProducts,
      total,
      totalPages,
      currentPage,
      membershipSummary,
    };
  } catch (error) {
    console.error("❌ Error in getCachedProductsWithMembership:", error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Function to invalidate caches when products are updated
export async function revalidateProductsWithMembershipCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("products");
  revalidateTag("products-with-membership");
}