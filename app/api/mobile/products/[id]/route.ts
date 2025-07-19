import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProduct } from "@/lib/actions/productServerActions";

/**
 * Mobile API: Get single product by ID with full details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log("🔵 Mobile API: GET /api/mobile/products/[id] called");
  
  try {
    const { userId } = await auth();
    console.log("👤 User ID:", userId);
    
    if (!userId) {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const params = await context.params;
    const productId = params.id;
    console.log("🔍 Requested product ID:", productId);
    
    if (!productId) {
      console.log("❌ Missing product ID");
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Use existing server action
    console.log("📞 Calling getProduct server action...");
    const product = await getProduct(productId);
    
    if (!product) {
      console.log("❌ Product not found:", productId);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    console.log("✅ Product found:", product.name);

    // Mobile-optimized product response with full details
    const mobileProduct = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      category: product.category,
      tags: product.tags,
      features: product.features,
      ingredients: product.ingredients,
      nutritionFacts: product.nutritionFacts,
      inventory: product.inventory,
      trackQuantity: product.trackQuantity,
      allowBackorder: product.allowBackorder,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      isFeatured: product.isFeatured,
    };

    const response = {
      success: true,
      product: mobileProduct
    };
    
    console.log("✅ Mobile API: Product detail response sent successfully");
    console.log("📤 Response summary:", {
      productId: mobileProduct._id,
      productName: mobileProduct.name,
      price: mobileProduct.price,
      imagesCount: mobileProduct.images.length
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("Get product by ID error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}