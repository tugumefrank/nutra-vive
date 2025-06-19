"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase } from "../db";
import { Category, ICategory } from "../db/models";
import mongoose from "mongoose";

// Validation Schema for Category
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Check if user is admin
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await mongoose.model("User").findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
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

    const existingCategory = await Category.findOne(query);
    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Create Category
export async function createCategory(
  data: CategoryFormData
): Promise<{ success: boolean; category?: ICategory; error?: string }> {
  try {
    // await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Validating category data...");

    // Validate form data
    const validatedData = categorySchema.parse(data);

    // Generate unique slug if not provided or not unique
    if (!validatedData.slug || validatedData.slug === "") {
      validatedData.slug = await generateUniqueSlug(validatedData.name);
    } else {
      validatedData.slug = await generateUniqueSlug(validatedData.slug);
    }

    // Check name uniqueness
    const existingName = await Category.findOne({ name: validatedData.name });
    if (existingName) {
      return {
        success: false,
        error: "Category name already exists",
      };
    }

    // Create category
    const category = new Category(validatedData);
    await category.save();

    console.log("✅ Category created successfully:", category.name);

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      category: category.toObject(),
    };
  } catch (error) {
    console.error("❌ Error creating category:", error);

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

// Update Category
export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<{ success: boolean; category?: ICategory; error?: string }> {
  try {
    // await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Updating category:", id);

    // Validate form data
    const validatedData = categorySchema.parse(data);

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Generate unique slug if changed
    if (validatedData.slug !== existingCategory.slug) {
      validatedData.slug = await generateUniqueSlug(validatedData.slug, id);
    }

    // Check name uniqueness if changed
    if (validatedData.name !== existingCategory.name) {
      const existingName = await Category.findOne({
        name: validatedData.name,
        _id: { $ne: id },
      });
      if (existingName) {
        return {
          success: false,
          error: "Category name already exists",
        };
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      validatedData,
      {
        new: true,
      }
    );

    console.log("✅ Category updated successfully:", updatedCategory?.name);

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      category: updatedCategory?.toObject(),
    };
  } catch (error) {
    console.error("❌ Error updating category:", error);

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

// Delete Category
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🗑️ Deleting category:", id);

    // Check if category has products
    const productCount = await mongoose
      .model("Product")
      .countDocuments({ category: id });
    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category. It has ${productCount} product(s) assigned to it.`,
      };
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    console.log("✅ Category deleted successfully:", deletedCategory.name);

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Category Status
export async function toggleCategoryStatus(
  id: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive: !category.isActive },
      { new: true }
    );

    console.log(
      `✅ Category ${updatedCategory?.isActive ? "activated" : "deactivated"}:`,
      category.name
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      isActive: updatedCategory?.isActive,
    };
  } catch (error) {
    console.error("❌ Error toggling category status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get All Categories (including inactive for admin)
export async function getAllCategories(): Promise<ICategory[]> {
  try {
    await connectToDatabase();

    const categories = await Category.find({}).sort({ name: 1 }).lean();

    return categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching all categories:", error);
    return [];
  }
}

// Get Category Stats
export async function getCategoryStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
  withoutProducts: number;
}> {
  try {
    await connectToDatabase();

    const [total, active, inactive, categoriesWithProducts] = await Promise.all(
      [
        Category.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Category.countDocuments({ isActive: false }),
        Category.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "category",
              as: "products",
            },
          },
          {
            $match: {
              "products.0": { $exists: true },
            },
          },
          {
            $count: "count",
          },
        ]),
      ]
    );

    const withProducts = categoriesWithProducts[0]?.count || 0;
    const withoutProducts = total - withProducts;

    return {
      total,
      active,
      inactive,
      withProducts,
      withoutProducts,
    };
  } catch (error) {
    console.error("❌ Error fetching category stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      withProducts: 0,
      withoutProducts: 0,
    };
  }
}
