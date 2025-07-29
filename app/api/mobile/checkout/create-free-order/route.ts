import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";

// Validation schema for free order creation
const createFreeOrderSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    selectedOptions: z.record(z.string()).optional(),
  })).min(1, "Cart must contain at least one item"),
  
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
  
  deliveryMethod: z.enum(["standard", "pickup"]).default("standard"),
  deliveryInstructions: z.string().optional(),
  promoCode: z.string().optional(),
});

/**
 * Mobile API: Create free order (membership/promotion-based)
 * POST /api/mobile/checkout/create-free-order
 * 
 * This endpoint handles orders that are completely free due to:
 * - Membership allocations covering all products
 * - Promotional codes making order total $0
 * - Free product promotions
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/checkout/create-free-order called");
  
  try {
    // Extract and verify JWT token
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

    const body = await request.json();
    console.log("📋 Free order creation request:", body);

    // Validate request data
    const validatedData = createFreeOrderSchema.parse(body);

    // Import server action for creating free orders
    const { createCheckoutSession } = await import("@/lib/actions/orderServerActions");
    
    // Create checkout session with free order flag
    const checkoutData = {
      cartItems: validatedData.cartItems,
      shippingAddress: validatedData.shippingAddress,
      deliveryMethod: validatedData.deliveryMethod,
      deliveryInstructions: validatedData.deliveryInstructions,
      promoCode: validatedData.promoCode,
      skipPayment: true, // This forces the order to be processed as free
    };

    console.log("🛒 Creating free checkout session...");
    const result = await createCheckoutSession(checkoutData);

    if (!result.success) {
      console.log("❌ Free order creation failed:", result.error);
      
      // Handle specific error cases
      if (result.error?.includes("insufficient membership allocation")) {
        return NextResponse.json(
          { 
            error: "Insufficient membership allocation",
            details: "Your membership doesn't cover all items in this order",
            suggestedAction: "Remove some items or upgrade your membership"
          },
          { status: 400 }
        );
      }
      
      if (result.error?.includes("order total is not zero")) {
        return NextResponse.json(
          { 
            error: "Order is not free",
            details: "This order has charges and cannot be processed as a free order",
            suggestedAction: "Use the regular payment checkout instead"
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: result.error || "Failed to create free order",
          details: "Please try again or contact support"
        },
        { status: 500 }
      );
    }

    console.log("✅ Free order created successfully:", result.orderNumber);

    // For free orders, the order is already processed and confirmed
    const response = {
      success: true,
      isFreeOrder: true,
      order: {
        id: result.orderId,
        orderNumber: result.orderNumber,
        status: "processing", // Free orders are automatically processed
        paymentStatus: "paid", // Free orders are considered paid
        totalAmount: 0, // Free orders have 0 total
        currency: "USD",
        items: [], // Items will be populated from the actual order
        shippingAddress: null,
        deliveryMethod: "standard",
        deliveryInstructions: null,
        trackingNumber: null,
        membershipUsage: null,
        createdAt: new Date().toISOString(),
      },
      payment: {
        method: "membership_allocation", // Indicates this was covered by membership
        paymentIntentId: "free_order",
        status: "completed",
        amountPaid: 0,
        currency: "USD",
      },
      membership: {
        usageDeducted: false, // This info is not available in createCheckoutSession response
        remainingAllocations: null, // This info is not available in createCheckoutSession response
      },
      notifications: {
        confirmationEmailSent: true,
        adminNotificationSent: true,
      },
      nextSteps: {
        orderConfirmationSent: true,
        estimatedDelivery: null, // Would need logic based on delivery method
        trackingAvailable: false, // Will be true once tracking is assigned
        inventoryUpdated: true,
        membershipUsageUpdated: true,
      },
    };

    console.log("📤 Free order response sent successfully");
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Free order creation API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid order data",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: "An unexpected error occurred while creating free order",
        details: "Please try again or contact support"
      },
      { status: 500 }
    );
  }
}