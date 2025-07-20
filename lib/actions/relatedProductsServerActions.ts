"use server";

import { connectToDatabase } from "../db";
import { Product, Order } from "../db/models";
import type { IProduct } from "@/types/product";

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
    averageRating: doc.averageRating || 0,
    reviewCount: doc.reviewCount || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Get random products by category name
 * Returns random products from a specific category
 */
export async function getRandomProductsByCategory(
  categoryName: string,
  limit: number = 3
): Promise<{
  success: boolean;
  products: IProduct[];
  error?: string;
}> {
  try {
    await connectToDatabase();

    // Find the category by name (case insensitive)
    const category = await Product.db.collection("categories").findOne({
      name: { $regex: new RegExp(categoryName, "i") },
      isActive: true,
    });

    if (!category) {
      // If category not found, return featured products
      const featuredProducts = await Product.find({
        isActive: true,
        isFeatured: true,
      })
        .populate(
          "category",
          "name slug description imageUrl isActive createdAt updatedAt"
        )
        .limit(limit)
        .lean();

      return {
        success: true,
        products: featuredProducts.map(transformProductDocument),
      };
    }

    // Get random products from the specified category
    const randomProducts = await Product.aggregate([
      {
        $match: {
          isActive: true,
          category: category._id,
        },
      },
      { $sample: { size: limit } }, // Get random products
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    // If we don't have enough products from the category, fill with other random products
    if (randomProducts.length < limit) {
      const remainingCount = limit - randomProducts.length;
      const additionalProducts = await Product.aggregate([
        {
          $match: {
            isActive: true,
            _id: {
              $nin: randomProducts.map((p) => p._id),
            },
          },
        },
        { $sample: { size: remainingCount } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      randomProducts.push(...additionalProducts);
    }

    console.log(`✅ Found ${randomProducts.length} random products from ${categoryName} category`);

    return {
      success: true,
      products: randomProducts.map(transformProductDocument),
    };
  } catch (error) {
    console.error("❌ Error fetching random products by category:", error);
    return {
      success: false,
      products: [],
      error: "Failed to fetch random products",
    };
  }
}

/**
 * Get related products based on the categories of items in an order
 * Returns 3 random products from the same categories, excluding the original order items
 */
export async function getRelatedProductsByOrderNumber(
  orderNumber: string,
  limit: number = 3
): Promise<{
  success: boolean;
  products: IProduct[];
  error?: string;
}> {
  try {
    await connectToDatabase();

    // First, get the order and its items
    const order = await Order.findOne({ orderNumber })
      .populate({
        path: "items.product",
        populate: {
          path: "category",
          select: "name slug description imageUrl isActive createdAt updatedAt",
        },
      })
      .lean();

    if (!order) {
      return {
        success: false,
        products: [],
        error: "Order not found",
      };
    }

    // Extract unique category IDs from order items
    const categoryIds = new Set<string>();
    const excludeProductIds = new Set<string>();

    for (const item of order.items) {
      // In the order schema, item.product is always a string (Product ID)
      if (item.product) {
        excludeProductIds.add(item.product.toString());
      }
    }

    // Now we need to fetch the actual products to get their categories
    if (excludeProductIds.size > 0) {
      const products = await Product.find({
        _id: { $in: Array.from(excludeProductIds) }
      })
      .populate('category')
      .lean();

      for (const product of products) {
        // TypeScript doesn't know that category is populated, so we need to cast it
        if (product.category && typeof product.category === 'object') {
          const populatedCategory = product.category as { _id: any };
          if (populatedCategory._id) {
            categoryIds.add(populatedCategory._id.toString());
          }
        }
      }
    }

    if (categoryIds.size === 0) {
      // If no categories found, return featured products instead
      const featuredProducts = await Product.find({
        isActive: true,
        isFeatured: true,
        _id: { $nin: Array.from(excludeProductIds) },
      })
        .populate(
          "category",
          "name slug description imageUrl isActive createdAt updatedAt"
        )
        .limit(limit)
        .lean();

      return {
        success: true,
        products: featuredProducts.map(transformProductDocument),
      };
    }

    // Get random products from the same categories, excluding original order items
    const relatedProducts = await Product.aggregate([
      {
        $match: {
          isActive: true,
          category: { $in: Array.from(categoryIds) },
          _id: { $nin: Array.from(excludeProductIds) },
        },
      },
      { $sample: { size: limit } }, // Get random products
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    // If we don't have enough products from the same categories, fill with other random products
    if (relatedProducts.length < limit) {
      const remainingCount = limit - relatedProducts.length;
      const additionalProducts = await Product.aggregate([
        {
          $match: {
            isActive: true,
            _id: {
              $nin: [
                ...Array.from(excludeProductIds),
                ...relatedProducts.map((p) => p._id),
              ],
            },
          },
        },
        { $sample: { size: remainingCount } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      relatedProducts.push(...additionalProducts);
    }

    console.log(`✅ Found ${relatedProducts.length} related products for order ${orderNumber}`);

    return {
      success: true,
      products: relatedProducts.map(transformProductDocument),
    };
  } catch (error) {
    console.error("❌ Error fetching related products:", error);
    return {
      success: false,
      products: [],
      error: "Failed to fetch related products",
    };
  }
}