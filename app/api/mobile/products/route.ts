import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

// Import existing server action
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
 * Mobile API: Get products with pagination, filtering, and search
 * Optimized for mobile with essential data only
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/products called");
  
  try {
    // For mobile API, we need to handle both cookie-based and header-based auth
    // Clerk's auth() function automatically handles both cases
    const { userId } = await auth();
    console.log("👤 User ID from auth():", userId);
    
    // If no userId from auth(), check Authorization header manually
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      console.log("🔐 Auth header:", authHeader ? "Present" : "Missing");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No valid authentication found");
        return NextResponse.json({ 
          error: "Unauthorized", 
          message: "Please provide a valid authentication token" 
        }, { status: 401 });
      }
      
      // Log the token issue for debugging
      const token = authHeader.split(" ")[1];
      console.log("🎫 Token present but not verified by Clerk auth()");
      console.log("🔍 Token preview:", token.substring(0, 20) + "...");
      
      return NextResponse.json({ 
        error: "Unauthorized", 
        message: "Token verification failed" 
      }, { status: 401 });
    }
    
    console.log("✅ User authenticated successfully");

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

    // Mobile-optimized response
    const mobileOptimizedProducts = result.products.map((product) => ({
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
      // isDiscounted: product.isDiscounted, // Removed because it does not exist on IProduct
      isFeatured: product.isFeatured,
      inventory: product.inventory,
      tags: product.tags,
    }));

    const response = {
      success: true,
      products: mobileOptimizedProducts,
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
    };
    
    console.log("✅ Mobile API: Products response sent successfully");
    console.log("📤 Response summary:", {
      productsCount: mobileOptimizedProducts.length,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.total
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Get products error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.errors,
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
