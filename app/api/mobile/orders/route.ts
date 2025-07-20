import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";
import { getUserOrders } from "@/lib/actions/orderServerActions";

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Mobile API: Get user orders
 * GET /api/mobile/orders
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/orders called");
  
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    console.log("📋 Query parameters:", queryParams);

    const validatedParams = querySchema.parse(queryParams);
    console.log("✅ Validated parameters:", validatedParams);

    // Get user orders using existing server action with userId
    console.log("📞 Calling getUserOrders with userId:", userId);
    const result = await getUserOrders(userId, {
      page: validatedParams.page,
      limit: validatedParams.limit,
      status: validatedParams.status,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
    });

    if (!result.success) {
      console.log("❌ Failed to get user orders:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to fetch orders" },
        { status: 500 }
      );
    }

    console.log("📊 Orders fetched:", result.orders?.length || 0);

    // Mobile-optimized response
    const mobileOrders = result.orders?.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      deliveryMethod: order.deliveryMethod,
      trackingNumber: order.trackingNumber,
      items: order.items?.map((item: any) => ({
        _id: item._id,
        productId: item.product,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      })) || [],
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      discountAmount: order.discountAmount,
    })) || [];

    const response = {
      success: true,
      orders: mobileOrders,
      pagination: {
        currentPage: validatedParams.page,
        totalItems: result.total || mobileOrders.length,
        totalPages: Math.ceil((result.total || mobileOrders.length) / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < (result.total || mobileOrders.length),
        hasPrevious: validatedParams.page > 1,
        limit: validatedParams.limit,
      },
      filters: {
        status: validatedParams.status,
        sortBy: validatedParams.sortBy,
        sortOrder: validatedParams.sortOrder,
      },
    };
    
    console.log("✅ Mobile API: Orders response sent successfully");
    console.log("📤 Response summary:", {
      ordersCount: mobileOrders.length,
      currentPage: validatedParams.page,
      totalItems: result.total || mobileOrders.length,
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Mobile orders API error:", error);
    
    // Handle specific Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}