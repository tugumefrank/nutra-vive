// app/api/migrate/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product, Cart } from "@/lib/db/models";

export async function POST(request: NextRequest) {
  try {
    // Simple authentication - only allow in development or with specific header
    const authHeader = request.headers.get("x-migration-key");
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment && authHeader !== process.env.MIGRATION_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    console.log("🔧 Starting product migration...");

    // Find products missing promotion fields
    const productsToUpdate = await Product.find({
      $or: [
        { promotionEligible: { $exists: false } },
        { isDiscounted: { $exists: false } },
        { promotionTags: { $exists: false } },
      ],
    });

    console.log(`Found ${productsToUpdate.length} products to update`);

    let updatedProducts = 0;
    if (productsToUpdate.length > 0) {
      // Update products with default promotion values
      const result = await Product.updateMany(
        {
          $or: [
            { promotionEligible: { $exists: false } },
            { isDiscounted: { $exists: false } },
            { promotionTags: { $exists: false } },
          ],
        },
        {
          $set: {
            promotionEligible: true, // Default: eligible for promotions
            isDiscounted: false, // Default: not currently discounted
            promotionTags: [], // Default: empty array
          },
        }
      );

      updatedProducts = result.modifiedCount;
      console.log(
        `✅ Updated ${updatedProducts} products with promotion fields`
      );
    }

    // Also update any existing carts to ensure they have promotion fields
    const cartsResult = await Cart.updateMany(
      {
        promotionDiscount: { $exists: false },
      },
      {
        $set: {
          promotionDiscount: 0,
        },
      }
    );

    console.log(
      `✅ Updated ${cartsResult.modifiedCount} carts with promotion fields`
    );

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      stats: {
        productsUpdated: updatedProducts,
        cartsUpdated: cartsResult.modifiedCount,
        totalProductsChecked: productsToUpdate.length,
      },
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
