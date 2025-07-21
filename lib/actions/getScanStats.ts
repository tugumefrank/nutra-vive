"use server";

import { ScanLog } from "@/lib/db/models/ScanLog";
import { connectToDatabase } from "../db";

export async function getScanStats(): Promise<{
  total: number;
  today: number;
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

    return { total, today };
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    return { total: 0, today: 0 };
  }
}
