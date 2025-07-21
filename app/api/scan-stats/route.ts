import { getScanStats } from "@/lib/actions/getScanStats";
import { NextResponse } from "next/server";

export async function GET() {
  const stats = await getScanStats();
  return NextResponse.json(stats);
}
