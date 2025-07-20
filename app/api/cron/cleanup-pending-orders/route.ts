import { NextRequest, NextResponse } from "next/server";
import { cleanupPendingOrders } from "@/lib/actions/orderCleanupServerActions";

/**
 * Vercel Cron Job: Cleanup pending orders older than 24 hours
 * GET /api/cron/cleanup-pending-orders
 * 
 * This endpoint is designed to be called by Vercel Cron Jobs
 * Configure in vercel.json with cron schedule to run every 6 hours
 */
export async function GET(request: NextRequest) {
  console.log("⏰ Cron Job: Cleanup pending orders started");
  
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("❌ Unauthorized cron request");
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

    console.log(`✅ Cron cleanup completed: ${result.deletedCount} orders deleted`);

    // Log to console for Vercel function logs
    if (result.deletedCount > 0) {
      console.log(`🧹 CLEANUP REPORT: Deleted ${result.deletedCount} pending orders older than 24 hours`);
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