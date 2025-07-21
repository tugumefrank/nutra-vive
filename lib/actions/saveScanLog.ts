"use server";

import { ScanLog } from "@/lib/db/models/ScanLog";
import { connectToDatabase } from "../db";

export async function saveScanLog(
  ip: string,
  userAgent: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const alreadyScanned = await ScanLog.findOne({
      ip,
      timestamp: { $gte: oneDayAgo },
    });

    if (!alreadyScanned) {
      await ScanLog.create({ ip, userAgent });
    }

    return true;
  } catch (error) {
    console.error("Failed to save scan log:", error);
    return false;
  }
}
