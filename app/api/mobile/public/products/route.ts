import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/actions/productServerActions";

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Public Mobile API: Get products without authentication
 * For testing and public product browsing
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Public Mobile API: GET /api/mobile/public/products called");
  
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    console.log("📋 Query parameters:", queryParams);

    // Validate query parameters
    const validatedParams = querySchema.parse(queryParams);
    console.log("✅ Validated parameters:", validatedParams);

    // Use existing server action with validated parameters
    console.log("📞 Calling getProducts server action...");
    const result = await getProducts({
      category: validatedParams.category,
      search: validatedParams.search,
      isFeatured: validatedParams.featured,
      isActive: true, // Always filter for active products
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
      page: validatedParams.page,
      limit: validatedParams.limit,
    });
    console.log("📊 Products fetched:", result.products.length, "total:", result.total);

    // Mobile-optimized response (basic product info only)
    const publicProducts = result.products.map((product) => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      category: product.category,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      isFeatured: product.isFeatured,
      inventory: product.inventory,
      tags: product.tags,
    }));

    const response = {
      success: true,
      products: publicProducts,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.total,
        hasNext: result.currentPage < result.totalPages,
        hasPrevious: result.currentPage > 1,
        limit: validatedParams.limit,
      },
      filters: {
        category: validatedParams.category,
        search: validatedParams.search,
        featured: validatedParams.featured,
      },
      note: "Public API - basic product info only, no personalized pricing"
    };
    
    console.log("✅ Public Mobile API: Products response sent successfully");
    console.log("📤 Response summary:", {
      productsCount: publicProducts.length,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.total
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Public products API error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}