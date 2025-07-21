import { saveScanLog } from "@/lib/actions/saveScanLog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  await saveScanLog(ip, userAgent);

  return NextResponse.redirect("https://nutraviveholistic.com", 302);
}
