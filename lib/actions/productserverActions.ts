"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase } from "../db";
import { Product, Category, IProduct, ICategory } from "../db/models";
import mongoose from "mongoose";

// Validation Schema for Product
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Product slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  ingredients: z.array(z.string()).default([]),
  nutritionFacts: z
    .object({
      servingSize: z.string().optional(),
      calories: z.number().optional(),
      totalFat: z.string().optional(),
      sodium: z.string().optional(),
      totalCarbs: z.string().optional(),
      sugars: z.string().optional(),
      protein: z.string().optional(),
      vitaminC: z.string().optional(),
    })
    .optional(),
  inventory: z.number().min(0, "Inventory cannot be negative").default(0),
  trackQuantity: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weight: z.number().optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.enum(["in", "cm"]).optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Check if user is admin
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await mongoose.model("User").findOne({ clerkId: userId });

  if (!user) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Generate unique slug
async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingProduct = await Product.findOne(query);
    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Create Product
export async function createProduct(
  data: ProductFormData
): Promise<{ success: boolean; product?: IProduct; error?: string }> {
  try {
    // await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Validating product data...");

    // Validate form data
    const validatedData = productSchema.parse(data);

    // Generate unique slug if not provided or not unique
    if (!validatedData.slug || validatedData.slug === "") {
      validatedData.slug = await generateUniqueSlug(validatedData.name);
    } else {
      validatedData.slug = await generateUniqueSlug(validatedData.slug);
    }

    // Validate category if provided
    if (validatedData.category) {
      const categoryExists = await Category.findById(validatedData.category);
      if (!categoryExists) {
        return {
          success: false,
          error: "Invalid category selected",
        };
      }
    }

    // Check SKU uniqueness if provided
    if (validatedData.sku) {
      const existingSku = await Product.findOne({ sku: validatedData.sku });
      if (existingSku) {
        return {
          success: false,
          error: "SKU already exists",
        };
      }
    }

    // Create product
    const product = new Product({
      ...validatedData,
      averageRating: 0,
      reviewCount: 0,
    });

    await product.save();

    console.log("✅ Product created successfully:", product.name);

    revalidatePath("/admin/products");

    return {
      success: true,
      product: product.toObject(),
    };
  } catch (error) {
    console.error("❌ Error creating product:", error);

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

// Update Product
export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<{ success: boolean; product?: IProduct; error?: string }> {
  try {
    // await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Updating product:", id);

    // Validate form data
    const validatedData = productSchema.parse(data);

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Generate unique slug if changed
    if (validatedData.slug !== existingProduct.slug) {
      validatedData.slug = await generateUniqueSlug(validatedData.slug, id);
    }

    // Validate category if provided
    if (validatedData.category) {
      const categoryExists = await Category.findById(validatedData.category);
      if (!categoryExists) {
        return {
          success: false,
          error: "Invalid category selected",
        };
      }
    }

    // Check SKU uniqueness if provided and changed
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const existingSku = await Product.findOne({
        sku: validatedData.sku,
        _id: { $ne: id },
      });
      if (existingSku) {
        return {
          success: false,
          error: "SKU already exists",
        };
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    console.log("✅ Product updated successfully:", updatedProduct?.name);

    revalidatePath("/admin/products");

    return {
      success: true,
      product: updatedProduct?.toObject(),
    };
  } catch (error) {
    console.error("❌ Error updating product:", error);

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

// Delete Product
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🗑️ Deleting product:", id);

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    console.log("✅ Product deleted successfully:", deletedProduct.name);

    revalidatePath("/admin/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Product Status
export async function toggleProductStatus(
  id: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: !product.isActive },
      { new: true }
    );

    console.log(
      `✅ Product ${updatedProduct?.isActive ? "activated" : "deactivated"}:`,
      product.name
    );

    revalidatePath("/admin/products");

    return {
      success: true,
      isActive: updatedProduct?.isActive,
    };
  } catch (error) {
    console.error("❌ Error toggling product status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Featured Status
export async function toggleFeaturedStatus(
  id: string
): Promise<{ success: boolean; isFeatured?: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isFeatured: !product.isFeatured },
      { new: true }
    );

    console.log(
      `✅ Product ${updatedProduct?.isFeatured ? "featured" : "unfeatured"}:`,
      product.name
    );

    revalidatePath("/admin/products");

    return {
      success: true,
      isFeatured: updatedProduct?.isFeatured,
    };
  } catch (error) {
    console.error("❌ Error toggling featured status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Products with Filters
export async function getProducts(filters?: {
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<{
  products: IProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    await connectToDatabase();

    const query: any = {};
    const sortOptions: any = {};

    // Apply filters
    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${products.length} products from database`);

    return {
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      })),
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
}

// Get Single Product
export async function getProduct(id: string): Promise<IProduct | null> {
  try {
    await connectToDatabase();

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return null;
    }

    return {
      ...product,
      _id: product._id.toString(),
    };
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return null;
  }
}

// Get Product by Slug
export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  try {
    await connectToDatabase();

    const product = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return null;
    }

    return {
      ...product,
      _id: product._id.toString(),
    };
  } catch (error) {
    console.error("❌ Error fetching product by slug:", error);
    return null;
  }
}

// Get Categories
export async function getCategories(): Promise<ICategory[]> {
  try {
    await connectToDatabase();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return [];
  }
}

// Bulk Update Products
export async function bulkUpdateProducts(
  productIds: string[],
  updates: Partial<IProduct>
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updates
    );

    console.log(`✅ Bulk updated ${result.modifiedCount} products`);

    revalidatePath("/admin/products");

    return {
      success: true,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk updating products:", error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Product Stats
export async function getProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  featured: number;
  lowStock: number;
  outOfStock: number;
  categories: number;
}> {
  try {
    await connectToDatabase();

    const [
      total,
      active,
      inactive,
      featured,
      lowStock,
      outOfStock,
      categories,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ inventory: { $lte: 10, $gt: 0 } }),
      Product.countDocuments({ inventory: 0 }),
      Category.countDocuments({ isActive: true }),
    ]);

    return {
      total,
      active,
      inactive,
      featured,
      lowStock,
      outOfStock,
      categories,
    };
  } catch (error) {
    console.error("❌ Error fetching product stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      featured: 0,
      lowStock: 0,
      outOfStock: 0,
      categories: 0,
    };
  }
}
