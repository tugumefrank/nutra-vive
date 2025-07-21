import { NextRequest, NextResponse } from "next/server";
import { cleanupPendingOrders } from "@/lib/actions/orderCleanupServerActions";

/**
 * Cron Job: Cleanup pending orders older than 24 hours
 * GET /api/cron/cleanup-pending-orders
 *
 * This endpoint can be called by external cron services like cron-jobs.org
 * Requires Bearer token authentication for security
 */
export async function GET(request: NextRequest) {
  console.log("⏰ Cron Job: Cleanup pending orders started");

  try {
    // Verify authentication token from cron service
    const authHeader = request.headers.get("authorization");
    const cronToken = process.env.CRON_SECRET_TOKEN;
    
    // Debug logging
    console.log("🔍 Debug info:");
    console.log("- Auth header received:", authHeader ? "Present" : "Missing");
    console.log("- Auth header value:", authHeader ? `"${authHeader}"` : "null");
    console.log("- Expected token configured:", cronToken ? "Yes" : "No");
    console.log("- Expected format:", cronToken ? `"Bearer ${cronToken}"` : "No token set");
    
    if (!cronToken) {
      console.log("❌ CRON_SECRET_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${cronToken}`) {
      console.log("❌ Unauthorized cron request - invalid or missing token");
      console.log("- Comparison failed:", {
        received: authHeader,
        expected: `Bearer ${cronToken}`,
        match: authHeader === `Bearer ${cronToken}`
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("✅ Cron authentication verified");

    // Perform the cleanup
    const result = await cleanupPendingOrders();

    if (!result.success) {
      console.log("❌ Cron cleanup failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Cron cleanup completed: ${result.deletedCount} orders deleted`
    );

    // Log to console for Vercel function logs
    if (result.deletedCount > 0) {
      console.log(
        `🧹 CLEANUP REPORT: Deleted ${result.deletedCount} pending orders older than 24 hours`
      );
    } else {
      console.log("🧹 CLEANUP REPORT: No pending orders to clean up");
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Cron cleanup completed: ${result.deletedCount} orders deleted`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cron cleanup failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
