import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { getUserProfile } from "@/lib/actions/userProfileServerActions";

/**
 * Mobile API: Get current user data including profile
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/auth/user called");
  
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Missing Authorization header" }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🔑 Token extracted, verifying...");

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    console.log("✅ Token verified, userId:", userId);

    if (!userId) {
      console.log("❌ No userId found in verified token");
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    // Get user profile data using existing server action with userId
    console.log("📞 Calling getUserProfile with userId:", userId);
    const userProfile = await getUserProfile(userId);
    
    console.log("✅ User profile retrieved successfully");
    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error("❌ Get user error:", error);
    
    // Handle specific Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

/**
 * Mobile API: Update user profile data
 */
export async function PUT(request: NextRequest) {
  console.log("🔵 Mobile API: PUT /api/mobile/auth/user called");
  
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Missing Authorization header" }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🔑 Token extracted, verifying...");

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    console.log("✅ Token verified, userId:", userId);

    if (!userId) {
      console.log("❌ No userId found in verified token");
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    const updateData = await request.json();
    console.log("📋 Update data received:", updateData);
    
    // Use existing server action for profile updates with userId
    const { updateUserInfo } = await import("@/lib/actions/userProfileServerActions");
    
    console.log("📞 Calling updateUserInfo with userId:", userId);
    const result = await updateUserInfo(updateData, userId);
    
    if (result.success) {
      console.log("✅ User profile updated successfully");
      return NextResponse.json({
        success: true,
        user: result.user
      });
    } else {
      console.log("❌ User profile update failed:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ Update user error:", error);
    
    // Handle specific Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}