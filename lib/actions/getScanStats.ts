"use server";

import { IScanLog, ScanLog } from "@/lib/db/models/ScanLog";
import { connectToDatabase } from "../db";

export async function getScanStats(): Promise<{
  total: number;
  today: number;
  recentScans: IScanLog[];
}> {
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const total = await ScanLog.countDocuments();
    const today = await ScanLog.countDocuments({
      timestamp: { $gte: startOfToday },
    });
    const recentScans = await ScanLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(); // Get last 10 scans

    return {
      total,
      today,
      recentScans: JSON.parse(JSON.stringify(recentScans)),
    }; // Important for passing Mongoose docs to client components
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    return { total: 0, today: 0, recentScans: [] };
  }
}
