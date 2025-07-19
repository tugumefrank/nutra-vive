import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Mobile API Test Endpoint
 * Test basic connectivity and authentication
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/test called");
  
  try {
    // Test authentication (but don't require it)
    const { userId } = await auth();
    console.log("👤 User ID:", userId || "Not authenticated");
    
    // Get authorization header for debugging
    const authHeader = request.headers.get("authorization");
    let tokenInfo = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      // Decode JWT header to inspect it (without verifying signature)
      try {
        const headerPart = token.split('.')[0];
        const decodedHeader = JSON.parse(atob(headerPart));
        
        const payloadPart = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadPart));
        
        tokenInfo = {
          header: decodedHeader,
          payload: {
            sub: decodedPayload.sub,
            iss: decodedPayload.iss,
            exp: decodedPayload.exp,
            iat: decodedPayload.iat,
          },
          isExpired: decodedPayload.exp < Date.now() / 1000,
        };
        
        console.log("🔍 Token info:", tokenInfo);
      } catch (decodeError) {
        console.log("❌ Token decode error:", decodeError);
        tokenInfo = { error: "Failed to decode token" };
      }
    }
    
    // Test database connectivity
    const { connectToDatabase } = await import("@/lib/db");
    await connectToDatabase();
    console.log("✅ Database connected");
    
    const response = {
      success: true,
      message: "Mobile API is working!",
      timestamp: new Date().toISOString(),
      authentication: {
        isAuthenticated: !!userId,
        userId: userId || null,
      },
      database: {
        connected: true,
      },
      headers: {
        host: request.headers.get("host"),
        origin: request.headers.get("origin"),
        "x-forwarded-host": request.headers.get("x-forwarded-host"),
        authorization: request.headers.get("authorization") ? "Present" : "Not present",
      },
      tokenInfo: tokenInfo,
      environment: {
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      }
    };
    
    console.log("✅ Mobile API test response:", response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("❌ Mobile API test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Test POST endpoint
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/test called");
  
  try {
    const body = await request.json();
    console.log("📋 Request body:", body);
    
    const { userId } = await auth();
    console.log("👤 User ID:", userId || "Not authenticated");
    
    return NextResponse.json({
      success: true,
      message: "POST test successful",
      receivedData: body,
      userId: userId || null,
    });
    
  } catch (error) {
    console.error("❌ POST test error:", error);
    return NextResponse.json(
      { success: false, error: "POST test failed" },
      { status: 500 }
    );
  }
}