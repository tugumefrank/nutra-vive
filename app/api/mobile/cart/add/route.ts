import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { addToCart } from "@/lib/actions/unifiedCartServerActions";

// Validation schema for add to cart request
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

/**
 * Mobile API: Add item to cart with unified pricing
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/cart/add called");
  
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

    const body = await request.json();
    console.log("📋 Request body:", body);
    
    // Validate request body
    const validatedData = addToCartSchema.parse(body);
    console.log("✅ Validated data:", validatedData);
    
    // Use existing unified cart server action
    console.log(`📞 Calling addToCart server action for product ${validatedData.productId}, quantity ${validatedData.quantity}...`);
    const result = await addToCart(
      validatedData.productId, 
      validatedData.quantity
    );
    
    if (!result.success) {
      console.log("❌ Failed to add item to cart:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to add item to cart" },
        { status: 400 }
      );
    }
    
    console.log("✅ Item added to cart successfully");

    const response = {
      success: true,
      message: "Item added to cart successfully",
      cart: result.cart,
      itemAdded: {
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        membershipSavings: result.membershipInfo?.savings || 0,
        promotionSavings: result.promotionInfo?.savings || 0,
      }
    };
    
    console.log("✅ Mobile API: Add to cart response sent successfully");
    console.log("📤 Item added:", {
      productId: validatedData.productId,
      quantity: validatedData.quantity,
      membershipSavings: result.membershipInfo?.savings || 0,
      promotionSavings: result.promotionInfo?.savings || 0
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("Add to cart error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}