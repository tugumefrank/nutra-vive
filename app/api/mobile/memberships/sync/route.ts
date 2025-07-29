import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { connectToDatabase } from "@/lib/db";
import { syncStripeDataToDatabase } from "@/lib/stripe/sync";
import { User } from "@/lib/db/models";

/**
 * Manual sync endpoint for mobile app
 * POST /api/mobile/memberships/sync
 * 
 * Use this if the webhook fails to sync the subscription
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/memberships/sync called");
  
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Authorization header" }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer ID found. Please complete a purchase first." },
        { status: 404 }
      );
    }

    console.log(`🔄 Manual sync for user ${userId} with customer ${user.stripeCustomerId}`);

    // Use the centralized sync function
    const syncResult = await syncStripeDataToDatabase(user.stripeCustomerId);
    
    if (syncResult) {
      console.log("✅ Manual sync completed successfully");
      return NextResponse.json({
        success: true,
        message: "Subscription data synced successfully",
        syncResult,
      });
    } else {
      console.log("⚠️ Sync returned null - no data to sync");
      return NextResponse.json({
        success: true,
        message: "No subscription data found to sync",
      });
    }

  } catch (error) {
    console.error("❌ Manual sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription data" },
      { status: 500 }
    );
  }
}