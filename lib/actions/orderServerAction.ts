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

// Validation Schemas
const checkoutSchema = z.object({
  // Shipping Address
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
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

type CheckoutData = z.infer<typeof checkoutSchema>;

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
      // Type assertion to help TypeScript understand product is populated
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
      order: {
        ...order.toObject(),
        _id: order._id.toString(),
      },
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

    // Try to find orders by user ID first
    let orders: any[] = [];

    try {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        orders = await Order.find({ user: user._id })
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (error) {
      console.log("User not found, trying email lookup");
    }

    // If no orders found by user ID, try by email (for guest orders)
    if (orders.length === 0) {
      // This would require knowing the user's email
      // For now, we'll just return empty orders
    }

    return {
      success: true,
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      })),
    };
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get single order
export async function getOrder(orderId: string): Promise<{
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
      order: {
        ...order,
        _id: order._id.toString(),
      },
    };
  } catch (error) {
    console.error("❌ Error getting order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
