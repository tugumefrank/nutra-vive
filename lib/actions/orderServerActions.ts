"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import Stripe from "stripe";
import { connectToDatabase } from "../db";
import { Order, Cart, Product, User, IOrder } from "../db/models";
import {
  getCart as getUnifiedCart,
  clearCart,
} from "./unifiedCartServerActions";

// Updated email imports - using our new React Email system
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOrderCancellation,
  sendRefundNotification,
  sendAdminNewOrder,
} from "../email";
import {
  deductMembershipUsageOnOrderConfirmation,
  restoreMembershipUsageOnOrderCancellation,
} from "./membershipUsageServerActions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Order filter schema for admin filtering/pagination
const orderFiltersSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
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
        product:
          typeof item.product === "string"
            ? item.product
            : item.product?._id?.toString() ||
              item.product?.toString() ||
              item.product,
        productData:
          item.product && typeof item.product === "object"
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
            : null,
      })) || [],
    createdAt: order.createdAt?.toISOString() || order.createdAt,
    updatedAt: order.updatedAt?.toISOString() || order.updatedAt,
    shippedAt: order.shippedAt?.toISOString() || order.shippedAt,
    deliveredAt: order.deliveredAt?.toISOString() || order.deliveredAt,
    cancelledAt: order.cancelledAt?.toISOString() || order.cancelledAt,
  };
}

// Create conditional validation schema based on delivery method
const createCheckoutSchema = (deliveryMethod?: string) => {
  const isPickup = deliveryMethod === "pickup";

  return z.object({
    // Shipping Address - conditional validation based on delivery method
    shippingAddress: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      address1: isPickup
        ? z.string().optional()
        : z.string().min(1, "Address is required"),
      address2: z.string().optional(),
      city: isPickup
        ? z.string().optional()
        : z.string().min(1, "City is required"),
      province: isPickup
        ? z.string().optional()
        : z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      zip: isPickup
        ? z.string().optional()
        : z.string().min(1, "ZIP code is required"),
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
    deliveryMethod: z.enum(["standard", "pickup"]),

    // Additional Options
    notes: z.string().optional(),
    marketingOptIn: z.boolean().default(false),
  });
};

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
function calculateShipping(
  deliveryMethod: string,
  subtotal: number,
  isFreeOrder: boolean = false
): number {
  // Always return 0 - shipping is now free for all orders
  return 0;
}

// Calculate tax (simplified - 8% tax rate)
function calculateTax(
  subtotal: number,
  shippingAmount: number,
  isFreeOrder: boolean = false
): number {
  if (isFreeOrder) return 0; // No tax for free membership orders
  return 0; // Math.round((subtotal + shippingAmount) * 0.08 * 100) / 100;
}

// Create checkout session (updated to handle pickup orders and free orders)
export async function createCheckoutSession(
  checkoutData: any & { skipPayment?: boolean } // Use any for initial data, we'll validate it below
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

    // Create schema based on delivery method
    const checkoutSchema = createCheckoutSchema(checkoutData.deliveryMethod);

    // Validate checkout data with conditional schema
    const validatedData = checkoutSchema.parse(checkoutData);

    await connectToDatabase();

    // Get user's unified cart
    console.log("📦 Fetching unified cart for user:", userId);
    const cartResult = await getUnifiedCart();
    console.log("📦 Cart fetch result:", {
      success: cartResult.success,
      hasCart: !!cartResult.cart,
      error: cartResult.error,
    });

    if (!cartResult.success || !cartResult.cart) {
      console.error("❌ Failed to get cart:", cartResult.error);
      return {
        success: false,
        error: cartResult.error || "Cart is empty",
      };
    }

    const cart = cartResult.cart;
    console.log("📦 Cart details:", {
      itemCount: cart.items?.length || 0,
      subtotal: cart.subtotal,
      membershipDiscount: cart.membershipDiscount,
      promotionDiscount: cart.promotionDiscount,
      afterDiscountsTotal: cart.afterDiscountsTotal,
      hasMembershipApplied: cart.hasMembershipApplied,
      hasPromotionApplied: cart.hasPromotionApplied,
    });

    if (!cart.items || cart.items.length === 0) {
      console.error("❌ Cart is empty");
      return {
        success: false,
        error: "Cart is empty",
      };
    }

    // Use unified cart totals
    const subtotal = cart.afterDiscountsTotal; // This is after membership + promotion discounts
    const membershipDiscount = cart.membershipDiscount || 0;
    const promotionDiscount = cart.promotionDiscount || 0;
    const totalDiscountAmount = membershipDiscount + promotionDiscount;

    // Check if this is a free order FIRST (before calculating shipping/tax)
    const isFreeOrder = subtotal <= 0 || checkoutData.skipPayment === true;

    const shippingAmount = calculateShipping(
      validatedData.deliveryMethod,
      subtotal,
      isFreeOrder
    );
    const taxAmount = calculateTax(subtotal, shippingAmount, isFreeOrder);
    const totalAmount = subtotal + shippingAmount + taxAmount;

    console.log("💰 Order totals calculated:");
    console.log("  - Subtotal (after discounts):", subtotal);
    console.log("  - Membership discount:", membershipDiscount);
    console.log("  - Promotion discount:", promotionDiscount);
    console.log("  - Total discount amount:", totalDiscountAmount);
    console.log("  - Shipping:", shippingAmount);
    console.log("  - Tax:", taxAmount);
    console.log("  - Final total:", totalAmount);
    console.log("  - Is free order?", isFreeOrder);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order in database with proper address handling for pickup
    const order = new Order({
      orderNumber,
      email: validatedData.email,
      status: isFreeOrder ? "processing" : "pending", // Free orders skip to processing
      paymentStatus: isFreeOrder ? "paid" : "pending", // Free orders are automatically "paid"
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      discountAmount: Math.round(totalDiscountAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency: "USD",

      // Handle shipping address based on delivery method
      shippingAddress:
        validatedData.deliveryMethod === "pickup"
          ? {
              firstName: validatedData.shippingAddress.firstName,
              lastName: validatedData.shippingAddress.lastName,
              company: "Store Pickup",
              address1: "Store Pickup Location",
              address2: "",
              city: "Store Location",
              province: "N/A",
              country: validatedData.shippingAddress.country,
              zip: "00000",
              phone: validatedData.shippingAddress.phone,
            }
          : validatedData.shippingAddress,

      billingAddress:
        validatedData.billingAddress || validatedData.shippingAddress,

      // Include promotion information if applied
      appliedPromotion:
        cart.hasPromotionApplied && cart.promotionCode
          ? {
              promotionId: cart.promotionId,
              code: cart.promotionCode,
              name: cart.promotionName || cart.promotionCode,
              discountAmount: promotionDiscount,
              discountType: "percentage", // You might want to get this from the promotion
            }
          : undefined,

      items: cart.items.map((item: any) => ({
        product: item.product._id,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images[0] || "/api/placeholder/300/300",
        quantity: item.quantity,
        price: item.finalPrice, // Use final price (after all discounts)
        originalPrice: item.originalPrice,
        totalPrice: item.quantity * item.finalPrice,
        appliedDiscount: item.totalSavings || 0,
      })),
      notes: validatedData.notes,
    });

    // Try to link to user if they exist in our system
    console.log("👤 Looking up user in database for clerkId:", userId);
    try {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        console.log("✅ User found:", {
          id: user._id,
          email: user.email,
          role: user.role,
        });
        order.user =
          typeof user._id === "string"
            ? new (require("mongoose").Types.ObjectId)(user._id)
            : user._id;
      } else {
        console.log("⚠️ User not found in database, continuing as guest order");
      }
    } catch (error) {
      console.error("❌ Error looking up user:", error);
      console.log("Continuing as guest order");
    }

    console.log("💾 Saving order to database...");
    console.log("📋 Order details before save:", {
      orderNumber: order.orderNumber,
      userId: order.user,
      email: order.email,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      isFreeOrder,
      itemCount: order.items?.length,
    });

    try {
      await order.save();
      console.log(
        "✅ Order saved successfully with ID:",
        order._id,
        "orderNumber:",
        order.orderNumber
      );
    } catch (saveError) {
      console.error("❌ Failed to save order:", saveError);
      return {
        success: false,
        error: `Failed to save order: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
      };
    }

    // Handle free orders vs paid orders
    if (isFreeOrder) {
      // For free orders, skip Stripe payment processing
      console.log(
        "✅ Processing free order:",
        orderNumber,
        "Total:",
        totalAmount
      );

      // Update product inventory for free orders
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.trackQuantity) {
          await Product.findByIdAndUpdate(product._id, {
            $inc: { inventory: -item.quantity },
          });
        }
      }

      // Deduct membership usage for free orders
      try {
        const membershipDeductionResult =
          await deductMembershipUsageOnOrderConfirmation(
            order._id.toString(),
            true // Skip auth since we're calling internally
          );

        if (membershipDeductionResult.success) {
          console.log(
            "✅ Membership usage deducted for free order:",
            membershipDeductionResult.deductedItems
          );
        } else {
          console.error(
            "❌ Failed to deduct membership usage for free order:",
            membershipDeductionResult.error
          );
        }
      } catch (membershipError) {
        console.error(
          "❌ Error deducting membership usage for free order:",
          membershipError
        );
        // Don't fail the order if membership deduction fails
      }

      // Clear user's unified cart
      const clearResult = await clearCart();
      if (!clearResult.success) {
        console.error(
          "❌ Failed to clear cart after free order:",
          clearResult.error
        );
      }

      // Send order confirmation email for free orders
      try {
        await sendOrderConfirmation(order.email, {
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          customerEmail: order.email,
          items: order.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            productImage: item.productImage,
          })),
          subtotal: order.subtotal,
          shipping: order.shippingAmount,
          tax: order.taxAmount,
          total: order.totalAmount,
          // Membership-specific data for free orders
          isMembershipOrder: cart.hasMembershipApplied,
          membershipTier: cart.membershipInfo?.tier || "Premium",
          membershipDiscount: membershipDiscount,
          promotionDiscount: promotionDiscount,
          totalSavings: membershipDiscount + promotionDiscount,
        });

        console.log("✅ Free order confirmation email sent successfully");
      } catch (emailError) {
        console.error("📧 Free order confirmation email failed:", emailError);
        // Don't fail the order if email fails
      }

      // Send admin notification for free orders
      try {
        await sendAdminNewOrder(
          "orders@nutraviveholistic.com",
          {
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            total: order.totalAmount,
            itemCount: order.items.length,
          }
        );

        console.log("✅ Free order admin notification sent successfully");
      } catch (emailError) {
        console.error("📧 Free order admin notification failed:", emailError);
        // Don't fail the order if email fails
      }

      return {
        success: true,
        orderId: order._id.toString(),
        // No clientSecret for free orders
      };
    } else {
      // For paid orders, create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Stripe expects cents
        currency: "usd",
        metadata: {
          orderId: order._id.toString(),
          orderNumber,
          userId: userId || "",
          deliveryMethod: validatedData.deliveryMethod,
          promotionCode: cart.promotionCode || "",
        },
        description: `Nutra-Vive Order ${orderNumber}`,
      });

      // Update order with payment intent ID
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      console.log("✅ Paid order checkout session created:", orderNumber);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret!,
        orderId: order._id.toString(),
      };
    }
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

// Confirm payment and complete order (UPDATED with new email system)
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

    let order;

    // Handle free orders vs paid orders
    if (paymentIntentId === "free_order") {
      // For free orders, find the most recent order for this user
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        console.error("❌ User not found for clerkId:", userId);
        return {
          success: false,
          error: "User not found",
        };
      }

      console.log("🔍 Looking for free order for user:", user._id);

      // Find the most recent order that is free (total = $0.00)
      order = await Order.findOne({
        user: user._id,
        totalAmount: 0, // Exactly $0.00 for membership free orders
        paymentStatus: "paid",
      })
        .sort({ createdAt: -1 }) // Get the most recent one
        .populate({
          path: "items.product",
          select: "name slug price images inventory trackQuantity",
        });

      if (!order) {
        console.error("❌ No free order found for user:", user._id);
        // Let's check what orders exist for debugging
        const allUserOrders = await Order.find({ user: user._id })
          .select(
            "orderNumber totalAmount paymentStatus paymentIntentId createdAt"
          )
          .sort({ createdAt: -1 })
          .limit(5);
        console.log("📋 Recent orders for user:", allUserOrders);

        return {
          success: false,
          error: "Free order not found",
        };
      }

      // Free orders are already processed in createCheckoutSession, just return success
      console.log(
        "✅ Free order confirmed:",
        order.orderNumber,
        "- Total:",
        order.totalAmount
      );

      return {
        success: true,
        order: serializeOrder(order.toObject()),
      };
    } else {
      // Find order by payment intent ID for paid orders
      order = await Order.findOne({ paymentIntentId }).populate({
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
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return {
          success: false,
          error: "Payment not completed",
        };
      }
    }

    // Update order status (skip for free orders that are already processed)
    if (paymentIntentId !== "free_order") {
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

      // Clear user's unified cart
      const clearResult = await clearCart();
      if (!clearResult.success) {
        console.error(
          "❌ Failed to clear cart after paid order:",
          clearResult.error
        );
      }

      // Deduct membership usage for paid orders (handles mixed free/paid items)
      try {
        const membershipDeductionResult =
          await deductMembershipUsageOnOrderConfirmation(
            order._id.toString(),
            true // Skip auth since we're calling internally
          );

        if (membershipDeductionResult.success) {
          console.log(
            "✅ Membership usage deducted for paid order:",
            membershipDeductionResult.deductedItems
          );
        } else {
          console.error(
            "❌ Failed to deduct membership usage for paid order:",
            membershipDeductionResult.error
          );
        }
      } catch (membershipError) {
        console.error(
          "❌ Error deducting membership usage for paid order:",
          membershipError
        );
        // Don't fail the order if membership deduction fails
      }
    }

    // 📧 SEND BEAUTIFUL ORDER CONFIRMATION EMAIL (skip for free orders - already sent)
    if (paymentIntentId !== "free_order") {
      try {
        // Try to get membership info from the order's appliedPromotion or discountAmount
        const isMembershipOrder = order.discountAmount > 0;
        const membershipDiscount = order.discountAmount || 0;
        const promotionDiscount = order.appliedPromotion?.discountAmount || 0;

        await sendOrderConfirmation(order.email, {
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          customerEmail: order.email,
          items: order.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            productImage: item.productImage,
          })),
          subtotal: order.subtotal,
          shipping: order.shippingAmount,
          tax: order.taxAmount,
          total: order.totalAmount,
          // Membership-specific data for paid orders
          isMembershipOrder: isMembershipOrder,
          membershipTier: "Premium", // Default since we don't have this stored in order
          membershipDiscount: membershipDiscount,
          promotionDiscount: promotionDiscount,
          totalSavings: membershipDiscount + promotionDiscount,
        });

        console.log("✅ Order confirmation email sent successfully");
      } catch (emailError) {
        console.error("📧 Order confirmation email failed:", emailError);
        // Don't fail the order if email fails
      }

      // 📧 SEND ADMIN NEW ORDER NOTIFICATION
      try {
        await sendAdminNewOrder(
          "orders@nutraviveholistic.com",
          {
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            total: order.totalAmount,
            itemCount: order.items.length,
          }
        );

        console.log("✅ Admin notification email sent successfully");
      } catch (emailError) {
        console.error("📧 Admin notification email failed:", emailError);
        // Don't fail the order if email fails
      }
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

// Get user's orders (keep existing, just updated serialization)
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

// Get single order (updated with proper serialization)
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
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Admin users can access any order, regular users can only access their own orders
    const isAdmin = user.role === "admin";
    if (!isAdmin && order.user && order.user.toString() !== user._id.toString()) {
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

// ADD NEW ADMIN FUNCTIONS FOR EMAIL INTEGRATION

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

// Update Order Status (NEW - with email notifications)
export async function updateOrderStatus(
  orderId: string,
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded",
  trackingNumber?: string,
  notes?: string
): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    // await checkAdminAuth();
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Update order status
    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    // Set status-specific timestamps
    if (status === "shipped") {
      updates.shippedAt = new Date();
      if (trackingNumber) {
        updates.trackingNumber = trackingNumber;
      }
    } else if (status === "delivered") {
      updates.deliveredAt = new Date();
    } else if (status === "cancelled") {
      updates.cancelledAt = new Date();
    }

    if (notes) {
      updates.notes = notes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });

    console.log(`✅ Order ${order.orderNumber} status updated to ${status}`);

    // 📧 SEND ORDER STATUS UPDATE EMAIL
    try {
      await sendOrderStatusUpdate(order.email, {
        orderNumber: order.orderNumber,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        status,
        trackingNumber,
        estimatedDelivery:
          status === "shipped" ? "3-5 business days" : undefined,
      });

      console.log("✅ Order status update email sent successfully");
    } catch (emailError) {
      console.error("📧 Order status update email failed:", emailError);
    }

    revalidatePath("/admin/orders");

    return {
      success: true,
      order: serializeOrder(updatedOrder!.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
}

// Cancel Order (NEW - with email notifications)
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // await checkAdminAuth();
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
    await Order.findByIdAndUpdate(orderId, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
    });

    // If order was paid, initiate refund
    let refundInfo = undefined;
    if (order.paymentStatus === "paid" && order.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
          reason: "requested_by_customer",
        });

        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "refunded",
        });

        refundInfo = "Your refund will be processed within 3-5 business days.";
        console.log(`💰 Refund initiated for order ${order.orderNumber}`);
      } catch (stripeError) {
        console.error("💳 Stripe refund failed:", stripeError);
        // Continue with cancellation even if refund fails
      }
    }

    // 📧 SEND ORDER CANCELLATION EMAIL
    try {
      await sendOrderCancellation(order.email, {
        orderNumber: order.orderNumber,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        reason,
        refundInfo,
      });

      console.log("✅ Order cancellation email sent successfully");
    } catch (emailError) {
      console.error("📧 Order cancellation email failed:", emailError);
    }

    // Restore membership usage for cancelled orders
    try {
      const membershipRestorationResult =
        await restoreMembershipUsageOnOrderCancellation(orderId);

      if (membershipRestorationResult.success) {
        console.log(
          "✅ Membership usage restored for cancelled order:",
          membershipRestorationResult.restoredItems
        );
      } else {
        console.error(
          "❌ Failed to restore membership usage for cancelled order:",
          membershipRestorationResult.error
        );
      }
    } catch (membershipError) {
      console.error(
        "❌ Error restoring membership usage for cancelled order:",
        membershipError
      );
      // Don't fail the cancellation if membership restoration fails
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

// Process Refund (NEW - with email notifications)
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
    // await checkAdminAuth();
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

    // 📧 SEND REFUND NOTIFICATION EMAIL
    try {
      await sendRefundNotification(order.email, {
        orderNumber: order.orderNumber,
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        refundAmount: amount || order.totalAmount,
        refundId: refund.id,
      });

      console.log("✅ Refund notification email sent successfully");
    } catch (emailError) {
      console.error("📧 Refund notification email failed:", emailError);
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
export async function getOrders(filters?: Partial<NodeFilter>): Promise<{
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
    // await checkAdminAuth();
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
    // await checkAdminAuth();
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
export async function exportOrders(filters?: Partial<NodeFilter>): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    // await checkAdminAuth();
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
    // await checkAdminAuth();
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
