"use server";

import { unstable_cache } from "next/cache";
import { connectToDatabase } from "../db";
import { Product, Category } from "../db/models";

export interface HeroProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  shortDescription?: string;
  description?: string;
  features: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  isBestSeller?: boolean;
}

// Cached version of getHeroProducts with tag-based revalidation
export const getHeroProducts = unstable_cache(
  async (): Promise<HeroProduct[]> => {
    try {
      await connectToDatabase();

      // Get Juice and Iced Tea categories
      const categories = await Category.find({
        name: { $in: ["Juice", "Iced Tea"] },
        isActive: true,
      }).lean();

      if (categories.length === 0) {
        console.log("No Juice or Iced Tea categories found");
        return [];
      }

      const categoryIds = categories.map((cat) => cat._id);

      // Get products from these categories
      const products = await Product.find({
        category: { $in: categoryIds },
        isActive: true,
      })
        .populate("category", "name slug")
        .sort({ createdAt: -1 }) // Get latest products first
        .limit(6) // Limit to 6 products for the slider
        .lean();

      // Transform products to HeroProduct format
      const heroProducts: HeroProduct[] = products.map((product) => {
        const categoryInfo = product.category as any;
        const isNutraReset = product.name?.match(/Nutra.*Reset|Nutra-Reset/i);
        
        return {
          _id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images || [],
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features || [],
          category: {
            _id: categoryInfo._id.toString(),
            name: categoryInfo.name,
            slug: categoryInfo.slug,
          },
          isBestSeller: isNutraReset, // Mark Nutra-Reset as best seller
        };
      });

      // Sort so that Nutra-Reset (best seller) comes first
      heroProducts.sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        return 0;
      });

      console.log(`✅ Fetched ${heroProducts.length} hero products from cache`);
      return heroProducts;
    } catch (error) {
      console.error("❌ Error fetching hero products:", error);
      return [];
    }
  },
  ["hero-products"], // Cache key
  {
    revalidate: false, // No time-based revalidation
    tags: ["hero-products", "products", "categories"], // Tags for manual revalidation
  }
);

// Function to revalidate hero products cache
export async function revalidateHeroProducts(): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("hero-products");
    console.log("✅ Hero products cache revalidated");
  } catch (error) {
    console.error("❌ Error revalidating hero products cache:", error);
  }
}

