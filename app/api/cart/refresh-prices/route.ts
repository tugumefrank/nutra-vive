// app/api/cart/refresh-prices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshCartPrices } from "@/lib/actions/unifiedCartServerActions";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/cart/refresh-prices
 * Refresh cart prices to reflect updated product prices (e.g., after auto-discounts)
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

    console.log(`🔄 API: Refreshing cart prices for user ${userId}`);

    const result = await refreshCartPrices();

    if (result.success) {
      return NextResponse.json({
        success: true,
        cart: result.cart,
        message: "Cart prices refreshed successfully"
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ API Error refreshing cart prices:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to refresh cart prices" 
      },
      { status: 500 }
    );
  }
}