import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cleanupPendingOrders, getPendingOrdersToCleanupCount } from "@/lib/actions/orderCleanupServerActions";

/**
 * Admin API: Cleanup pending orders older than 24 hours
 * GET /api/admin/cleanup/pending-orders - Get count of orders to be cleaned
 * POST /api/admin/cleanup/pending-orders - Perform cleanup
 * 
 * This endpoint can be called by:
 * 1. Admin users manually
 * 2. Cron jobs or external schedulers
 * 3. Vercel Cron Jobs
 */

/**
 * Get count of pending orders that would be cleaned up
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Admin API: GET /api/admin/cleanup/pending-orders called");
  
  try {
    // Check for admin authentication or API key
    const apiKey = request.headers.get("x-api-key");
    const isValidApiKey = apiKey === process.env.CLEANUP_API_KEY;
    
    let isAdmin = false;
    if (!isValidApiKey) {
      // Check if user is admin
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 401 }
        );
      }
      
      // Add admin check here if you have admin role checking
      // For now, assume authenticated users can check counts
      isAdmin = true;
    }

    console.log("✅ Authentication verified");

    // Get count of orders to be cleaned
    const result = await getPendingOrdersToCleanupCount();
    
    if (!result.success) {
      console.log("❌ Failed to get pending orders count:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${result.count} pending orders older than 24 hours`);

    return NextResponse.json({
      success: true,
      pendingOrdersToCleanup: result.count,
      message: `${result.count} pending orders are older than 24 hours and eligible for cleanup`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Admin cleanup count API error:", error);
    return NextResponse.json(
      { error: "Failed to get cleanup count" },
      { status: 500 }
    );
  }
}

/**
 * Perform cleanup of pending orders older than 24 hours
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Admin API: POST /api/admin/cleanup/pending-orders called");
  
  try {
    // Check for admin authentication or API key
    const apiKey = request.headers.get("x-api-key");
    const isValidApiKey = apiKey === process.env.CLEANUP_API_KEY;
    
    let isAdmin = false;
    if (!isValidApiKey) {
      // Check if user is admin
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 401 }
        );
      }
      
      // Add admin check here if you have admin role checking
      // For now, assume authenticated users can perform cleanup
      isAdmin = true;
    }

    console.log("✅ Authentication verified for cleanup operation");

    // Perform the cleanup
    const result = await cleanupPendingOrders();
    
    if (!result.success) {
      console.log("❌ Cleanup operation failed:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ Cleanup completed: ${result.deletedCount} orders deleted`);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} pending orders older than 24 hours`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Admin cleanup API error:", error);
    return NextResponse.json(
      { error: "Failed to perform cleanup" },
      { status: 500 }
    );
  }
}