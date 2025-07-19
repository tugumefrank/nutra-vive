import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteSavedAddress } from "@/lib/actions/userProfileServerActions";

/**
 * Mobile API: Delete a saved address
 * DELETE /api/mobile/auth/user/delete-address
 */
export async function DELETE(request: NextRequest) {
  console.log("🔵 Mobile API: DELETE /api/mobile/auth/user/delete-address called");
  
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

    const { addressId } = await request.json();
    console.log("🗑️ Delete address request for ID:", addressId);
    
    if (!addressId) {
      console.log("❌ Missing address ID");
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }
    
    // Use existing server action to delete the address
    console.log("📞 Calling deleteSavedAddress server action...");
    const result = await deleteSavedAddress(addressId);
    
    if (result.success) {
      console.log("✅ Address deleted successfully");
      return NextResponse.json({
        success: true,
        message: "Address deleted successfully"
      });
    } else {
      console.log("❌ Failed to delete address:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}