import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllCategories } from "@/lib/actions/categoryServerActions";

/**
 * Mobile API: Get all active categories
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Use existing server action
    const categories = await getAllCategories();

    // Mobile-optimized categories response
    const mobileCategories = categories.map(category => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
    }));

    return NextResponse.json({
      success: true,
      categories: mobileCategories
    });

  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}