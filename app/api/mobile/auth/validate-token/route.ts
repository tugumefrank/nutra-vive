import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Mobile API: Validate Clerk JWT token
 * Used by mobile app to verify authentication status
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/auth/validate-token called");
  
  try {
    const { userId } = await auth();
    console.log("👤 Token validation - User ID:", userId);
    
    if (!userId) {
      console.log("❌ Token validation failed - no user ID");
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized",
          authenticated: false 
        }, 
        { status: 401 }
      );
    }

    // Get current user details
    const user = await currentUser();
    
    const response = {
      success: true,
      authenticated: true,
      user: {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
      }
    };
    
    console.log("✅ Token validation successful");
    console.log("📤 User info:", {
      userId: userId,
      email: user?.emailAddresses[0]?.emailAddress,
      firstName: user?.firstName,
      lastName: user?.lastName
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Token validation failed",
        authenticated: false 
      },
      { status: 500 }
    );
  }
}