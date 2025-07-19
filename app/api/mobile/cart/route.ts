import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCart } from "@/lib/actions/unifiedCartServerActions";

/**
 * Mobile API: Get user's cart with unified pricing (membership + promotions)
 */
export async function GET() {
  console.log("🔵 Mobile API: GET /api/mobile/cart called");
  
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

    // Use existing unified cart server action
    console.log("📞 Calling getCart server action...");
    const result = await getCart();
    
    if (!result.success) {
      console.log("❌ Failed to fetch cart:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to fetch cart" },
        { status: 500 }
      );
    }
    
    console.log("🛒 Cart fetched successfully");

    // Mobile-optimized cart response
    const cart = result.cart;
    const mobileCart = {
      _id: cart._id,
      items: cart.items.map(item => ({
        _id: item._id,
        product: {
          _id: item.product._id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
          category: item.product.category,
        },
        quantity: item.quantity,
        
        // Pricing breakdown (critical for mobile)
        originalPrice: item.originalPrice,
        regularPrice: item.regularPrice,
        membershipPrice: item.membershipPrice,
        promotionPrice: item.promotionPrice,
        finalPrice: item.finalPrice,
        
        // Quantity breakdown
        freeFromMembership: item.freeFromMembership,
        paidQuantity: item.paidQuantity,
        
        // Savings breakdown
        membershipSavings: item.membershipSavings,
        promotionSavings: item.promotionSavings,
        totalSavings: item.totalSavings,
        
        // Membership metadata
        membershipEligible: item.membershipEligible,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        usesAllocation: item.usesAllocation,
      })),
      
      // Cart totals
      subtotal: cart.subtotal,
      membershipDiscount: cart.membershipDiscount,
      promotionDiscount: cart.promotionDiscount,
      afterDiscountsTotal: cart.afterDiscountsTotal,
      shippingAmount: cart.shippingAmount,
      taxAmount: cart.taxAmount,
      finalTotal: cart.finalTotal,
      
      // Promotion info
      promotionCode: cart.promotionCode,
      promotionName: cart.promotionName,
      promotionId: cart.promotionId,
      hasPromotionApplied: cart.hasPromotionApplied,
      
      // Membership info
      hasMembershipApplied: cart.hasMembershipApplied,
      membershipInfo: cart.membershipInfo,
      
      // Summary counts
      totalItems: cart.totalItems,
      freeItems: cart.freeItems,
      paidItems: cart.paidItems,
      
      // UI flags
      canApplyPromotion: cart.canApplyPromotion,
      hasEligibleItems: cart.hasEligibleItems,
    };

    const response = {
      success: true,
      cart: mobileCart
    };
    
    console.log("✅ Mobile API: Cart response sent successfully");
    console.log("📤 Cart summary:", {
      itemsCount: mobileCart.items.length,
      totalItems: mobileCart.totalItems,
      finalTotal: mobileCart.finalTotal,
      membershipDiscount: mobileCart.membershipDiscount,
      promotionDiscount: mobileCart.promotionDiscount
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}