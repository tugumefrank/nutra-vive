"use server";

import { unstable_cache } from "next/cache";
import { connectToDatabase } from "../db";
import { Product, Category } from "../db/models";
import type { IProduct, ICategory } from "@/types/product";
import { ProductWithMembership, ProductListResponse } from "./membershipProductServerActions";
import { auth } from "@clerk/nextjs/server";

// Helper function to transform MongoDB document to IProduct
function transformProductDocument(doc: any): IProduct {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    shortDescription: doc.shortDescription,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    costPrice: doc.costPrice,
    sku: doc.sku,
    barcode: doc.barcode,
    category: doc.category
      ? {
          _id: doc.category._id.toString(),
          name: doc.category.name,
          slug: doc.category.slug,
          description: doc.category.description,
          imageUrl: doc.category.imageUrl,
          isActive: doc.category.isActive,
          createdAt: doc.category.createdAt,
          updatedAt: doc.category.updatedAt,
        }
      : null,
    images: doc.images || [],
    tags: doc.tags || [],
    features: doc.features || [],
    ingredients: doc.ingredients || [],
    nutritionFacts: doc.nutritionFacts,
    inventory: doc.inventory,
    trackQuantity: doc.trackQuantity,
    allowBackorder: doc.allowBackorder,
    weight: doc.weight,
    dimensions: doc.dimensions,
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    averageRating: doc.averageRating,
    reviewCount: doc.reviewCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Helper function to transform MongoDB document to ICategory
function transformCategoryDocument(doc: any): ICategory {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    imageUrl: doc.imageUrl,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Cached function to get all categories
export const getCachedCategories = unstable_cache(
  async (): Promise<ICategory[]> => {
    try {
      await connectToDatabase();

      const categories = await Category.find({ isActive: true })
        .sort({ name: 1 })
        .lean();

      return categories.map(transformCategoryDocument);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return [];
    }
  },
  ["categories"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["categories"],
  }
);

// Cached function to get products with filtering
export const getCachedProducts = unstable_cache(
  async (filters: {
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<{
    products: IProduct[];
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
        // Use aggregation for custom sorting - show ALL products, just reorder them
        const aggregationPipeline = [
          { $match: query },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              sortPriority: {
                $switch: {
                  branches: [
                    // Highest priority: Nutra-Reset specifically
                    {
                      case: { 
                        $regexMatch: { 
                          input: "$name", 
                          regex: "Nutra.*Reset|Nutra-Reset", 
                          options: "i" 
                        } 
                      },
                      then: 1
                    },
                    // Second priority: Juice category
                    {
                      case: { 
                        $eq: ["$category.name", "Juice"]
                      },
                      then: 2
                    },
                    // Third priority: Iced Tea category
                    {
                      case: { 
                        $eq: ["$category.name", "Iced Tea"]
                      },
                      then: 3
                    },
                    // Fourth priority: Herbal Tea category
                    {
                      case: { 
                        $eq: ["$category.name", "Herbal Tea"]
                      },
                      then: 4
                    },
                    // Fifth priority: Tea bags category
                    {
                      case: { 
                        $eq: ["$category.name", "Tea bags"]
                      },
                      then: 5
                    }
                  ],
                  default: 6 // All other products
                }
              }
            }
          },
          { $sort: { sortPriority: 1, name: 1 } },
          { $skip: skip },
          { $limit: limit }
        ];

        [products, total] = await Promise.all([
          Product.aggregate(aggregationPipeline),
          Product.countDocuments(query),
        ]);
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
        products: products.map(transformProductDocument),
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
  ["products"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["products"],
  }
);

// Cached function to get a single product by slug
export const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<IProduct | null> => {
    try {
      await connectToDatabase();

      const product = await Product.findOne({ slug, isActive: true })
        .populate("category", "name slug description imageUrl isActive createdAt updatedAt")
        .lean();

      if (!product) {
        return null;
      }

      return transformProductDocument(product);
    } catch (error) {
      console.error("❌ Error fetching product by slug:", error);
      return null;
    }
  },
  ["product-by-slug"],
  {
    revalidate: 600, // Cache for 10 minutes
    tags: ["products"],
  }
);

// Function to invalidate caches when products or categories are updated
export async function revalidateProductCaches() {
  // This would be called from admin actions when products/categories are updated
  const { revalidateTag } = await import("next/cache");
  revalidateTag("products");
  revalidateTag("categories");
}