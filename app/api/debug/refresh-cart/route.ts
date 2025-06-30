// app/api/debug/refresh-cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshCartPrices } from "@/lib/actions/unifiedCartServerActions";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/debug/refresh-cart
 * Debug endpoint to manually trigger cart price refresh
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`🔧 DEBUG: Manual cart refresh triggered for user ${userId}`);

    const result = await refreshCartPrices();

    console.log(`🔧 DEBUG: Cart refresh result:`, {
      success: result.success,
      error: result.error,
      cartItemCount: result.cart?.items?.length || 0,
      cartTotal: result.cart?.finalTotal || 0
    });

    return NextResponse.json({
      success: true,
      result,
      message: "Cart refresh triggered - check server logs for details"
    });
  } catch (error) {
    console.error("❌ DEBUG Error refreshing cart:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to refresh cart" 
      },
      { status: 500 }
    );
  }
}