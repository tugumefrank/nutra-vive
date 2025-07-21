// "use server";

// import { ScanLog } from "@/lib/db/models/ScanLog";
// import { connectToDatabase } from "../db";

// export async function saveScanLog(
//   ip: string,
//   userAgent: string
// ): Promise<boolean> {
//   try {
//     await connectToDatabase();

//     const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//     const alreadyScanned = await ScanLog.findOne({
//       ip,
//       timestamp: { $gte: oneDayAgo },
//     });

//     if (!alreadyScanned) {
//       await ScanLog.create({ ip, userAgent });
//     }

//     return true;
//   } catch (error) {
//     console.error("Failed to save scan log:", error);
//     return false;
//   }
// }
// === lib/actions/qr/save-scan-log.ts ===
"use server";

import { ScanLog } from "@/lib/db/models/ScanLog";
import { userAgent as parseUserAgent } from "next/server"; // Alias to avoid conflict
import { connectToDatabase } from "../db";

// Utility function to get geolocation (as defined above)
async function getGeolocation(
  ip: string
): Promise<{ country?: string; city?: string }> {
  try {
    if (ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168.")) {
      return {}; // Skip geolocation for local or unknown IPs
    }
    // Note: IP-API has rate limits for the free tier (45 requests/minute per IP)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
      };
    }
  } catch (error) {
    console.error("Error fetching geolocation:", error);
  }
  return {};
}

export async function saveScanLog(
  ip: string,
  userAgentString: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const alreadyScanned = await ScanLog.findOne({
      ip,
      timestamp: { $gte: oneDayAgo },
    });

    if (!alreadyScanned) {
      const geolocation = await getGeolocation(ip);

      // Create a dummy NextRequest object for userAgent parsing
      const dummyReq = new Request("http://localhost/", {
        headers: { "user-agent": userAgentString },
      });
      const { device, os, browser } = parseUserAgent(dummyReq);

      await ScanLog.create({
        ip,
        userAgent: userAgentString,
        country: geolocation.country,
        city: geolocation.city,
        deviceType: device.type || "unknown",
        os: os.name || "unknown",
        browser: browser.name || "unknown",
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to save scan log:", error);
    return false;
  }
}
