import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveCheckoutPreferences } from "@/lib/actions/userProfileServerActions";

/**
 * Mobile API: Save user checkout preferences
 * POST /api/mobile/auth/user/save-checkout-preferences
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/auth/user/save-checkout-preferences called");
  
  try {
    const { userId } = await auth();
    console.log("👤 User ID:", userId);
    
    if (!userId) {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log("📋 Save checkout preferences request:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.address && !data.deliveryMethod) {
      console.log("❌ Missing required data");
      return NextResponse.json(
        { error: "Either address or deliveryMethod is required" },
        { status: 400 }
      );
    }
    
    // Use existing server action to save checkout preferences
    console.log("📞 Calling saveCheckoutPreferences server action...");
    const result = await saveCheckoutPreferences(data);
    
    if (result.success) {
      console.log("✅ Checkout preferences saved successfully");
      return NextResponse.json({
        success: true,
        message: "Checkout preferences saved successfully"
      });
    } else {
      console.log("❌ Failed to save checkout preferences:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ Save checkout preferences error:", error);
    return NextResponse.json(
      { error: "Failed to save checkout preferences" },
      { status: 500 }
    );
  }
}