// app/api/debug/check-discounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product, ProductDiscount } from "@/lib/db/models";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/debug/check-discounts
 * Debug endpoint to check if discounts are properly applied to products
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get all active discount campaigns
    const activeDiscounts = await ProductDiscount.find({ isActive: true });
    
    // Get some sample products to check their current pricing
    const products = await Product.find({ isActive: true })
      .limit(10)
      .select('name price compareAtPrice isDiscounted');

    // Get total product count
    const totalProducts = await Product.countDocuments({ isActive: true });
    const discountedProducts = await Product.countDocuments({ 
      isActive: true, 
      isDiscounted: true 
    });

    return NextResponse.json({
      success: true,
      data: {
        activeDiscounts: activeDiscounts.map(d => ({
          _id: d._id,
          name: d.name,
          discountValue: d.discountValue,
          discountType: d.discountType,
          isActive: d.isActive,
          affectedProductCount: d.affectedProductCount,
          scope: d.scope
        })),
        sampleProducts: products.map(p => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          isDiscounted: p.isDiscounted,
          actualDiscount: p.compareAtPrice && p.price ? 
            Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) + '%' : 
            'No discount'
        })),
        summary: {
          totalProducts,
          discountedProducts,
          percentageDiscounted: Math.round((discountedProducts / totalProducts) * 100) + '%'
        }
      }
    });
  } catch (error) {
    console.error("❌ Debug Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Debug check failed" 
      },
      { status: 500 }
    );
  }
}