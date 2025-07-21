import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";
import { sendCustomerSupportEmail } from "@/lib/actions/supportServerActions";

// Validation schema for support request
const supportRequestSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(100, "Name too long"),
  customerEmail: z.string().email("Valid email address is required"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
  orderNumber: z.string().optional(),
  deviceInfo: z.object({
    platform: z.string().optional(),
    version: z.string().optional(),
    model: z.string().optional(),
  }).optional(),
});

type SupportRequest = z.infer<typeof supportRequestSchema>;

/**
 * Mobile API: Send customer support email
 * POST /api/mobile/support/contact
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/support/contact called");
  
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

    // Parse and validate request body
    const body = await request.json();
    console.log("📋 Support request received:", {
      subject: body.subject,
      orderNumber: body.orderNumber,
      hasMessage: !!body.message,
      customerEmail: body.customerEmail,
    });

    const validatedData = supportRequestSchema.parse(body);
    console.log("✅ Support request data validated");

    // Send support email using existing server action
    console.log("📧 Sending customer support email...");
    const result = await sendCustomerSupportEmail({
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      subject: validatedData.subject,
      message: validatedData.message,
      orderNumber: validatedData.orderNumber,
      // Add mobile-specific context to the message
      mobileContext: {
        userId: userId,
        deviceInfo: validatedData.deviceInfo,
        timestamp: new Date().toISOString(),
        source: "mobile_app",
      },
    });

    if (!result.success) {
      console.log("❌ Failed to send support email:", result.error);
      return NextResponse.json(
        { 
          success: false,
          error: result.error || "Failed to send support message" 
        },
        { status: 500 }
      );
    }

    console.log("✅ Support email sent successfully");

    // Success response
    const response = {
      success: true,
      message: "Your support request has been sent successfully",
      supportTicket: {
        subject: validatedData.subject,
        orderNumber: validatedData.orderNumber,
        customerEmail: validatedData.customerEmail,
        submittedAt: new Date().toISOString(),
        estimatedResponseTime: "24 hours",
      },
      nextSteps: [
        "Our support team will review your request",
        "You'll receive a response via email within 24 hours",
        "Check your email (including spam folder) for our reply",
        "Reference your order number for faster assistance"
      ],
    };

    console.log("📤 Support request response sent successfully");
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Mobile support API error:", error);
    
    // Handle specific Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid or expired token" 
        },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid request data",
          fieldErrors: fieldErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process support request" 
      },
      { status: 500 }
    );
  }
}

/**
 * Mobile API: Get support request template data
 * GET /api/mobile/support/contact
 * Returns pre-filled form data for the current user
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/support/contact called");
  
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

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    // Get query parameters for order-specific support
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    console.log("✅ Providing support form template data for user:", userId);

    // Return template data for mobile app to pre-fill form
    const templateData = {
      success: true,
      formDefaults: {
        customerName: "", // Mobile app should fill from user profile
        customerEmail: "", // Mobile app should fill from user profile
        subject: orderNumber ? `Support Request for Order ${orderNumber}` : "",
        message: "",
        orderNumber: orderNumber || "",
      },
      supportTypes: [
        {
          id: "order_status",
          title: "Order Status",
          description: "Questions about your order status or delivery",
          suggestedSubject: "Order Status Inquiry"
        },
        {
          id: "product_issue",
          title: "Product Issue",
          description: "Problems with a product you received",
          suggestedSubject: "Product Quality Concern"
        },
        {
          id: "billing",
          title: "Billing",
          description: "Questions about charges or refunds",
          suggestedSubject: "Billing Inquiry"
        },
        {
          id: "general",
          title: "General Support",
          description: "Other questions or feedback",
          suggestedSubject: "General Support Request"
        }
      ],
      guidelines: {
        messageMinLength: 10,
        messageMaxLength: 2000,
        expectedResponseTime: "24 hours",
        supportEmail: "support@nutraviveholistic.com",
      },
    };

    return NextResponse.json(templateData);

  } catch (error) {
    console.error("❌ Mobile support template API error:", error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to get support template" },
      { status: 500 }
    );
  }
}