"use server";

import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/db/models";

/**
 * Clean up pending orders older than specified time
 * TEMP: Currently set to 5 minutes for testing (normally 24 hours)
 * This function removes orders that have paymentStatus 'pending' and were created more than the specified time ago
 */
export async function cleanupPendingOrders(): Promise<{
  success: boolean;
  deletedCount?: number;
  error?: string;
}> {
  try {
    console.log("🧹 TESTING MODE: Starting cleanup of pending orders older than 5 minutes...");
    
    await connectToDatabase();

    // TEMP: Calculate 5 minutes ago (normally 24 hours)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - 5);

    console.log("📅 TESTING: Cleaning up orders created before:", cutoffTime.toISOString());

    // Find and delete orders that are:
    // 1. paymentStatus is 'pending'
    // 2. createdAt is older than 5 minutes (TEMP - normally 24 hours)
    const deleteResult = await Order.deleteMany({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime }
    });

    console.log("✅ Cleanup completed successfully");
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} pending orders`);

    return {
      success: true,
      deletedCount: deleteResult.deletedCount,
    };

  } catch (error) {
    console.error("❌ Error during order cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during cleanup",
    };
  }
}

/**
 * Get count of pending orders that would be cleaned up
 * TEMP: Currently set to 5 minutes for testing (normally 24 hours)
 * Useful for monitoring and reporting
 */
export async function getPendingOrdersToCleanupCount(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    await connectToDatabase();

    // TEMP: Calculate 5 minutes ago (normally 24 hours)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - 5);

    // Count orders that would be deleted
    const count = await Order.countDocuments({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime }
    });

    return {
      success: true,
      count,
    };

  } catch (error) {
    console.error("❌ Error counting pending orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get detailed info about pending orders older than specified minutes
 * TEMP: Default changed to 5 minutes for testing (normally 24 hours = 1440 minutes)
 * Useful for debugging and monitoring
 */
export async function getPendingOrdersInfo(minutesOld: number = 5): Promise<{
  success: boolean;
  orders?: Array<{
    _id: string;
    orderNumber: string;
    email: string;
    totalAmount: number;
    createdAt: string;
    hoursOld: number;
  }>;
  error?: string;
}> {
  try {
    await connectToDatabase();

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutesOld);

    const orders = await Order.find({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime }
    })
    .select("orderNumber email totalAmount createdAt")
    .lean();

    const now = new Date();
    const ordersWithAge = orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      email: order.email,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      hoursOld: Math.floor((now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60)) // Keep hours for readability
    }));

    return {
      success: true,
      orders: ordersWithAge,
    };

  } catch (error) {
    console.error("❌ Error getting pending orders info:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}