import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPromotionAnalytics } from "@/lib/actions/promotionServerActions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const promotionId = searchParams.get("promotionId");

    const result = await getPromotionAnalytics(promotionId || undefined);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching promotion analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
