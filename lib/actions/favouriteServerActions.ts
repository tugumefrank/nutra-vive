"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import { Favorite, Product, User, IFavorite, IProduct } from "../db/models";
import mongoose from "mongoose";

// Add product to favorites
export async function addToFavorites(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId,
    });

    if (existingFavorite) {
      return {
        success: false,
        error: "Product already in favorites",
      };
    }

    // Add to favorites
    const favorite = new Favorite({
      user: userId,
      product: productId,
    });

    await favorite.save();

    console.log(
      `✅ Added product ${product.name} to favorites for user ${userId}`
    );

    // Revalidate pages that show favorites
    revalidatePath("/favorites");
    revalidatePath("/shop");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error adding to favorites:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Remove product from favorites
export async function removeFromFavorites(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Remove from favorites
    const result = await Favorite.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!result) {
      return {
        success: false,
        error: "Product not in favorites",
      };
    }

    console.log(`✅ Removed product from favorites for user ${userId}`);

    // Revalidate pages that show favorites
    revalidatePath("/favorites");
    revalidatePath("/shop");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error removing from favorites:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle favorite status
export async function toggleFavorite(
  productId: string
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId,
    });

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.findByIdAndDelete(existingFavorite._id);

      console.log(
        `✅ Removed product ${product.name} from favorites for user ${userId}`
      );

      // Revalidate pages
      revalidatePath("/favorites");
      revalidatePath("/shop");

      return {
        success: true,
        isFavorite: false,
      };
    } else {
      // Add to favorites
      const favorite = new Favorite({
        user: userId,
        product: productId,
      });

      await favorite.save();

      console.log(
        `✅ Added product ${product.name} to favorites for user ${userId}`
      );

      // Revalidate pages
      revalidatePath("/favorites");
      revalidatePath("/shop");

      return {
        success: true,
        isFavorite: true,
      };
    }
  } catch (error) {
    console.error("❌ Error toggling favorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get user's favorite products
export async function getUserFavorites(): Promise<{
  products: IProduct[];
  total: number;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        products: [],
        total: 0,
      };
    }

    await connectToDatabase();

    // Get favorites with populated product data
    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "product",
        match: { isActive: true }, // Only include active products
        populate: {
          path: "category",
          select: "name slug",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out favorites where product is null (inactive products)
    const validFavorites = favorites.filter((fav) => fav.product !== null);

    const products = validFavorites.map((favorite: any) => ({
      ...favorite.product,
      _id: favorite.product._id.toString(),
    }));

    console.log(
      `✅ Fetched ${products.length} favorite products for user ${userId}`
    );

    return {
      products,
      total: products.length,
    };
  } catch (error) {
    console.error("❌ Error fetching user favorites:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

// Check if product is in user's favorites
export async function isProductFavorite(productId: string): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    await connectToDatabase();

    // Check if favorite exists
    const favorite = await Favorite.findOne({
      user: userId,
      product: productId,
    });

    return !!favorite;
  } catch (error) {
    console.error("❌ Error checking favorite status:", error);
    return false;
  }
}

// Get user's favorite product IDs (for efficient checking)
export async function getUserFavoriteIds(): Promise<string[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    await connectToDatabase();

    // Get only the product IDs
    const favorites = await Favorite.find({ user: userId })
      .select("product")
      .lean();

    return favorites.map((fav) => fav.product.toString());
  } catch (error) {
    console.error("❌ Error fetching favorite IDs:", error);
    return [];
  }
}

// Clear all favorites for user
export async function clearAllFavorites(): Promise<{
  success: boolean;
  cleared: number;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        cleared: 0,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Delete all favorites for user
    const result = await Favorite.deleteMany({ user: userId });

    console.log(
      `✅ Cleared ${result.deletedCount} favorites for user ${userId}`
    );

    // Revalidate pages
    revalidatePath("/favorites");
    revalidatePath("/shop");

    return {
      success: true,
      cleared: result.deletedCount,
    };
  } catch (error) {
    console.error("❌ Error clearing favorites:", error);
    return {
      success: false,
      cleared: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get favorite stats for user
export async function getFavoriteStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  recent: number; // favorites added in last 7 days
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        total: 0,
        byCategory: {},
        recent: 0,
      };
    }

    await connectToDatabase();

    // Get all favorites with product and category data
    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .lean();

    const total = favorites.length;

    // Count by category
    const byCategory: Record<string, number> = {};
    favorites.forEach((favorite: any) => {
      if (favorite.product && favorite.product.category) {
        const categoryName = favorite.product.category.name;
        byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
      }
    });

    // Count recent favorites (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = favorites.filter(
      (fav) => fav.createdAt >= sevenDaysAgo
    ).length;

    return {
      total,
      byCategory,
      recent,
    };
  } catch (error) {
    console.error("❌ Error fetching favorite stats:", error);
    return {
      total: 0,
      byCategory: {},
      recent: 0,
    };
  }
}
