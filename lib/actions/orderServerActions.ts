"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import Stripe from "stripe";
import { connectToDatabase } from "../db";
import { Order, Cart, Product, User, IOrder } from "../db/models";
import { sendEmail } from "../email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Serialization helper for orders
function serializeOrder(order: any) {
  if (!order) return null;

  return {
    ...order,
    _id: order._id?.toString() || order._id,
    user: order.user?.toString() || order.user,
    items:
      order.items?.map((item: any) => ({
        ...item,
        _id: item._id?.toString() || item._id,
        product: item.product
          ? {
              ...item.product,
              _id: item.product._id?.toString() || item.product._id,
              category: item.product.category
                ? {
                    ...item.product.category,
                    _id:
                      item.product.category._id?.toString() ||
                      item.product.category._id,
                  }
                : item.product.category,
            }
          : item.product,
      })) || [],
    createdAt: order.createdAt?.toISOString() || order.createdAt,
    updatedAt: order.updatedAt?.toISOString() || order.updatedAt,
    shippedAt: order.shippedAt?.toISOString() || order.shippedAt,
    deliveredAt: order.deliveredAt?.toISOString() || order.deliveredAt,
    cancelledAt: order.cancelledAt?.toISOString() || order.cancelledAt,
  };
}

// Validation Schemas
const checkoutSchema = z.object({
  // Shipping Address
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zip: z.string().min(1, "ZIP code is required"),
    phone: z.string().optional(),
  }),

  // Billing Address (optional, can be same as shipping)
  billingAddress: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      company: z.string().optional(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      province: z.string(),
      country: z.string(),
      zip: z.string(),
      phone: z.string().optional(),
    })
    .optional(),

  // Contact Information
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),

  // Delivery Options
  deliveryMethod: z.enum(["standard", "express", "pickup"]),

  // Additional Options
  notes: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

const updatePaymentStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentStatus: z.enum([
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
  ]),
});

const orderFiltersSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "totalAmount", "orderNumber"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

type CheckoutData = z.infer<typeof checkoutSchema>;
type OrderFilters = z.infer<typeof orderFiltersSchema>;

// Check if user is admin
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Helper function to generate unique order number
async function generateOrderNumber(): Promise<string> {
  const count = await Order.countDocuments();
  const orderNumber = `NV-${(count + 1).toString().padStart(6, "0")}`;

  // Check if order number already exists (just in case)
  const existingOrder = await Order.findOne({ orderNumber });
  if (existingOrder) {
    return `NV-${Date.now().toString().slice(-6)}`;
  }

  return orderNumber;
}

// Calculate shipping cost based on delivery method and cart total
function calculateShipping(deliveryMethod: string, subtotal: number): number {
  if (deliveryMethod === "pickup") return 0;
  if (subtotal >= 25) return 0; // Free shipping over $25
  if (deliveryMethod === "express") return 9.99;
  return 5.99; // Standard shipping
}

// Calculate tax (simplified - 8% tax rate)
function calculateTax(subtotal: number, shippingAmount: number): number {
  return Math.round((subtotal + shippingAmount) * 0.08 * 100) / 100;
}

// ============================================================================
// CUSTOMER ORDER FUNCTIONS
// ============================================================================

// Create checkout session
export async function createCheckoutSession(
  checkoutData: CheckoutData
): Promise<{
  success: boolean;
  clientSecret?: string;
  orderId?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Validate checkout data
    const validatedData = checkoutSchema.parse(checkoutData);

    await connectToDatabase();

    // Get user's cart
    const cart = await Cart.findOne({ clerkUserId: userId }).populate({
      path: "items.product",
      select: "name slug price images",
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
      };
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    const shippingAmount = calculateShipping(
      validatedData.deliveryMethod,
      subtotal
    );
    const taxAmount = calculateTax(subtotal, shippingAmount);
    const totalAmount = subtotal + shippingAmount + taxAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order in database
    const order = new Order({
      orderNumber,
      email: validatedData.email,
      status: "pending",
      paymentStatus: "pending",
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      discountAmount: 0,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency: "USD",
      shippingAddress: validatedData.shippingAddress,
      billingAddress:
        validatedData.billingAddress || validatedData.shippingAddress,
      items: cart.items.map((item: any) => ({
        product: item.product._id,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images[0] || "/api/placeholder/300/300",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
      })),
      notes: validatedData.notes,
    });

    // Try to link to user if they exist in our system
    try {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        order.user = user._id;
      }
    } catch (error) {
      console.log("User not found in database, continuing as guest order");
    }

    await order.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe expects cents
      currency: "usd",
      metadata: {
        orderId: order._id.toString(),
        orderNumber,
        userId: userId || "",
      },
      description: `Nutra-Vive Order ${orderNumber}`,
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    console.log("✅ Checkout session created:", orderNumber);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      orderId: order._id.toString(),
    };
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Confirm payment and complete order
export async function confirmPayment(paymentIntentId: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId }).populate({
      path: "items.product",
      select: "name slug price images inventory trackQuantity",
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return {
        success: false,
        error: "Payment not completed",
      };
    }

    // Update order status
    order.paymentStatus = "paid";
    order.status = "processing";
    await order.save();

    // Update product inventory
    for (const item of order.items) {
      const product = item.product as typeof Product.prototype & {
        trackQuantity?: boolean;
        _id?: any;
      };
      if (product && product.trackQuantity) {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { inventory: -item.quantity },
        });
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: { items: [] } }
    );

    // Send confirmation email
    try {
      await sendEmail({
        to: order.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        template: "order-confirmation",
        data: {
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shippingAmount,
          tax: order.taxAmount,
          total: order.totalAmount,
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the order if email fails
    }

    console.log("✅ Payment confirmed for order:", order.orderNumber);

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      order: serializeOrder(order.toObject()),
    };
  } catch (error) {
    console.error("❌ Error confirming payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get user's orders
export async function getUserOrders(): Promise<{
  success: boolean;
  orders?: any[];
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    let orders: any[] = [];

    try {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        orders = await Order.find({ user: user._id })
          .populate({
            path: "items.product",
            select: "name slug images",
          })
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (error) {
      console.log("User not found, returning empty orders");
    }

    return {
      success: true,
      orders: orders.map((order) => serializeOrder(order)),
    };
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get single order (customer view)
export async function getUserOrder(orderId: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "name slug price images",
      })
      .lean();

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Verify user has access to this order
    const user = await User.findOne({ clerkId: userId });
    if (order.user && user && order.user.toString() !== user._id.toString()) {
      return {
        success: false,
        error: "Unauthorized access to order",
      };
    }

    return {
      success: true,
      order: serializeOrder(order),
    };
  } catch (error) {
    console.error("❌ Error getting order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// ============================================================================
// ADMIN ORDER FUNCTIONS
// ============================================================================

// Get Orders with Filtering and Pagination (Admin)
export async function getOrders(filters?: Partial<OrderFilters>): Promise<{
  orders: any[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const validatedFilters = orderFiltersSchema.parse(filters || {});

    // Build query
    const query: any = {};

    if (validatedFilters.status) {
      query.status = validatedFilters.status;
    }

    if (validatedFilters.paymentStatus) {
      query.paymentStatus = validatedFilters.paymentStatus;
    }

    if (validatedFilters.search) {
      query.$or = [
        { orderNumber: { $regex: validatedFilters.search, $options: "i" } },
        { email: { $regex: validatedFilters.search, $options: "i" } },
        {
          "shippingAddress.firstName": {
            $regex: validatedFilters.search,
            $options: "i",
          },
        },
        {
          "shippingAddress.lastName": {
            $regex: validatedFilters.search,
            $options: "i",
          },
        },
      ];
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      query.createdAt = {};
      if (validatedFilters.dateFrom) {
        query.createdAt.$gte = new Date(validatedFilters.dateFrom);
      }
      if (validatedFilters.dateTo) {
        query.createdAt.$lte = new Date(validatedFilters.dateTo);
      }
    }

    // Build sort
    const sort: any = {};
    sort[validatedFilters.sortBy] =
      validatedFilters.sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const page = validatedFilters.page;
    const limit = validatedFilters.limit;
    const skip = (page - 1) * limit;

    // Execute queries
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "firstName lastName email imageUrl")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${orders.length} orders from database`);

    return {
      orders: orders.map((order) => serializeOrder(order)),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return {
      orders: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}

// Get Single Order (Admin)
export async function getOrder(id: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("user", "firstName lastName email imageUrl")
      .populate("items.product", "name slug images")
      .lean();

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      order: serializeOrder(order),
    };
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order",
    };
  }
}

// Update Order Status (Admin)
export async function updateOrderStatus(
  data: z.infer<typeof updateOrderStatusSchema>
): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const validatedData = updateOrderStatusSchema.parse(data);

    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Update order status
    const updates: any = {
      status: validatedData.status,
      updatedAt: new Date(),
    };

    // Set status-specific timestamps
    if (validatedData.status === "shipped") {
      updates.shippedAt = new Date();
      if (validatedData.trackingNumber) {
        updates.trackingNumber = validatedData.trackingNumber;
      }
    } else if (validatedData.status === "delivered") {
      updates.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      validatedData.orderId,
      updates,
      { new: true }
    ).populate("user", "firstName lastName email");

    console.log(
      `✅ Order ${order.orderNumber} status updated to ${validatedData.status}`
    );

    // Send status update email to customer
    try {
      await sendEmail({
        to: order.email,
        subject: `Order Update - ${order.orderNumber}`,
        template: "order-status-update",
        data: {
          orderNumber: order.orderNumber,
          status: validatedData.status,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          trackingNumber: validatedData.trackingNumber,
          estimatedDelivery:
            validatedData.status === "shipped"
              ? "3-5 business days"
              : undefined,
        },
      });
    } catch (emailError) {
      console.error("📧 Failed to send status update email:", emailError);
    }

    revalidatePath("/admin/orders");

    return {
      success: true,
      order: serializeOrder(updatedOrder!.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating order status:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
}

// Update Payment Status (Admin)
export async function updatePaymentStatus(
  data: z.infer<typeof updatePaymentStatusSchema>
): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const validatedData = updatePaymentStatusSchema.parse(data);

    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      validatedData.orderId,
      {
        paymentStatus: validatedData.paymentStatus,
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log(
      `✅ Order ${order.orderNumber} payment status updated to ${validatedData.paymentStatus}`
    );

    revalidatePath("/admin/orders");

    return {
      success: true,
      order: serializeOrder(updatedOrder!.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating payment status:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update payment status",
    };
  }
}

// Cancel Order (Admin)
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return {
        success: false,
        error: "Cannot cancel this order",
      };
    }

    // Update order status
    await Order.findByIdAndUpdate(
      orderId,
      {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    // If order was paid, initiate refund
    if (order.paymentStatus === "paid" && order.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
          reason: "requested_by_customer",
        });

        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "refunded",
        });

        console.log(`💰 Refund initiated for order ${order.orderNumber}`);
      } catch (stripeError) {
        console.error("💳 Stripe refund failed:", stripeError);
        // Continue with cancellation even if refund fails
      }
    }

    // Send cancellation email
    try {
      await sendEmail({
        to: order.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        template: "order-cancelled",
        data: {
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          reason,
          refundInfo:
            order.paymentStatus === "paid"
              ? "Your refund will be processed within 3-5 business days."
              : undefined,
        },
      });
    } catch (emailError) {
      console.error("📧 Failed to send cancellation email:", emailError);
    }

    console.log(`✅ Order ${order.orderNumber} cancelled successfully`);

    revalidatePath("/admin/orders");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

// Process Refund (Admin)
export async function processRefund(
  orderId: string,
  amount?: number,
  reason?: string
): Promise<{
  success: boolean;
  refund?: any;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (!order.paymentIntentId) {
      return {
        success: false,
        error: "No payment to refund",
      };
    }

    // Create refund in Stripe
    const refundData: any = {
      payment_intent: order.paymentIntentId,
      reason: reason || "requested_by_customer",
    };

    if (amount && amount < order.totalAmount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    // Update order payment status
    const newPaymentStatus =
      amount && amount < order.totalAmount ? "partially_refunded" : "refunded";

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: newPaymentStatus,
      updatedAt: new Date(),
    });

    // Send refund email
    try {
      await sendEmail({
        to: order.email,
        subject: `Refund Processed - ${order.orderNumber}`,
        template: "refund-processed",
        data: {
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          refundAmount: amount || order.totalAmount,
          refundId: refund.id,
        },
      });
    } catch (emailError) {
      console.error("📧 Failed to send refund email:", emailError);
    }

    console.log(
      `💰 Refund processed for order ${order.orderNumber}: $${amount || order.totalAmount}`
    );

    revalidatePath("/admin/orders");

    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error("❌ Error processing refund:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process refund",
    };
  }
}

// Get Order Statistics (Admin)
export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: any[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]).then((result) => result[0]?.total || 0),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ paymentStatus: "refunded" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "firstName lastName")
        .lean(),
    ]);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          productName: "$_id",
          totalSold: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          revenue: 1,
          orders: 1,
          _id: 0,
        },
      },
    ]);

    console.log("✅ Order statistics calculated successfully");

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      averageOrderValue,
      topProducts,
      recentOrders: recentOrders.map((order) => serializeOrder(order)),
      monthlyRevenue,
    };
  } catch (error) {
    console.error("❌ Error fetching order statistics:", error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      refundedOrders: 0,
      averageOrderValue: 0,
      topProducts: [],
      recentOrders: [],
      monthlyRevenue: [],
    };
  }
}

// Export Orders to CSV (Admin)
export async function exportOrders(filters?: Partial<OrderFilters>): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const { orders } = await getOrders({ ...filters, limit: 10000 });

    // Convert orders to CSV format
    const csvHeaders = [
      "Order Number",
      "Customer Name",
      "Email",
      "Status",
      "Payment Status",
      "Total Amount",
      "Items",
      "Order Date",
      "Shipped Date",
      "Tracking Number",
    ];

    const csvData = orders.map((order) => [
      order.orderNumber,
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      order.email,
      order.status,
      order.paymentStatus,
      `$${order.totalAmount.toFixed(2)}`,
      order.items
        .map((item: any) => `${item.productName} (${item.quantity})`)
        .join("; "),
      new Date(order.createdAt).toLocaleDateString(),
      order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : "",
      order.trackingNumber || "",
    ]);

    const csv = [csvHeaders, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    console.log(`✅ Exported ${orders.length} orders to CSV`);

    return {
      success: true,
      data: csv,
    };
  } catch (error) {
    console.error("❌ Error exporting orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export orders",
    };
  }
}

// Bulk Update Orders (Admin)
export async function bulkUpdateOrders(
  orderIds: string[],
  updates: {
    status?: string;
    paymentStatus?: string;
    trackingNumber?: string;
  }
): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === "shipped") {
        updateData.shippedAt = new Date();
      } else if (updates.status === "delivered") {
        updateData.deliveredAt = new Date();
      }
    }

    if (updates.paymentStatus) {
      updateData.paymentStatus = updates.paymentStatus;
    }

    if (updates.trackingNumber) {
      updateData.trackingNumber = updates.trackingNumber;
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    console.log(`✅ Bulk updated ${result.modifiedCount} orders`);

    revalidatePath("/admin/orders");

    return {
      success: true,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk updating orders:", error);
    return {
      success: false,
      updated: 0,
      error:
        error instanceof Error ? error.message : "Failed to bulk update orders",
    };
  }
}
