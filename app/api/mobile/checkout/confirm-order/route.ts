// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { z } from "zod";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// // Validation schema for order confirmation
// const confirmOrderSchema = z.object({
//   paymentIntentId: z.string().min(1),
//   expectedAmount: z.number().min(0),
// });

// /**
//  * Mobile API: Confirm order after successful payment
//  * POST /api/mobile/checkout/confirm-order
//  */
// export async function POST(request: NextRequest) {
//   console.log("🔵 Mobile API: POST /api/mobile/checkout/confirm-order called");

//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       console.log("❌ Unauthorized access attempt");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log("👤 User ID:", userId);

//     const body = await request.json();
//     console.log("📋 Order confirmation request:", body);

//     // Validate request data
//     const validatedData = confirmOrderSchema.parse(body);

//     // Retrieve the payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       validatedData.paymentIntentId
//     );

//     console.log("💳 Payment Intent status:", paymentIntent.status);

//     // Verify payment was successful
//     if (paymentIntent.status !== "succeeded") {
//       console.log("❌ Payment not successful:", paymentIntent.status);
//       return NextResponse.json(
//         {
//           error: "Payment not completed",
//           status: paymentIntent.status,
//         },
//         { status: 400 }
//       );
//     }

//     // Verify amount matches
//     const paidAmount = paymentIntent.amount / 100; // Convert from cents
//     if (Math.abs(paidAmount - validatedData.expectedAmount) > 0.01) {
//       console.log("❌ Amount mismatch:", {
//         paid: paidAmount,
//         expected: validatedData.expectedAmount,
//       });
//       return NextResponse.json(
//         { error: "Payment amount mismatch" },
//         { status: 400 }
//       );
//     }

//     // Verify the user matches
//     if (paymentIntent.metadata.clerkUserId !== userId) {
//       console.log("❌ User ID mismatch in payment");
//       return NextResponse.json(
//         { error: "Payment user mismatch" },
//         { status: 403 }
//       );
//     }

//     console.log("✅ Payment verification successful");

//     // Create order in database using existing server action
//     try {
//       const { createOrderFromPaymentIntent } = await import(
//         "@/lib/actions/orderServerActions"
//       );

//       const orderResult = await createOrderFromPaymentIntent({
//         paymentIntentId: paymentIntent.id,
//         userId: userId,
//         customerEmail:
//           paymentIntent.receipt_email || paymentIntent.customer?.email,
//         metadata: paymentIntent.metadata,
//         shippingDetails: paymentIntent.shipping,
//         amountPaid: paidAmount,
//       });

//       if (!orderResult.success) {
//         console.log("❌ Order creation failed:", orderResult.error);
//         return NextResponse.json(
//           { error: "Failed to create order" },
//           { status: 500 }
//         );
//       }

//       console.log(
//         "✅ Order created successfully:",
//         orderResult.order?.orderNumber
//       );

//       // Clear user's cart after successful order
//       try {
//         const { clearCart } = await import(
//           "@/lib/actions/unifiedCartServerActions"
//         );
//         await clearCart();
//         console.log("🛒 Cart cleared after successful order");
//       } catch (cartError) {
//         console.log("⚠️ Cart clearing failed (non-critical):", cartError);
//       }

//       // Prepare response
//       const response = {
//         success: true,
//         order: {
//           id: orderResult.order?._id,
//           orderNumber: orderResult.order?.orderNumber,
//           status: orderResult.order?.status,
//           totalAmount: orderResult.order?.totalAmount,
//           currency: orderResult.order?.currency,
//           items: orderResult.order?.items,
//           shippingAddress: orderResult.order?.shippingAddress,
//           trackingNumber: orderResult.order?.trackingNumber,
//           createdAt: orderResult.order?.createdAt,
//         },
//         payment: {
//           paymentIntentId: paymentIntent.id,
//           status: paymentIntent.status,
//           amountPaid: paidAmount,
//           currency: paymentIntent.currency,
//           paymentMethod: paymentIntent.payment_method,
//         },
//         nextSteps: {
//           orderConfirmationSent: true,
//           estimatedDelivery: null, // Calculate based on shipping method
//           trackingAvailable: false,
//         },
//       };

//       console.log("📤 Order confirmation response sent successfully");
//       return NextResponse.json(response);
//     } catch (orderError) {
//       console.error("❌ Order creation error:", orderError);
//       return NextResponse.json(
//         { error: "Failed to create order record" },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("❌ Order confirmation error:", error);

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           error: "Invalid confirmation data",
//           details: error.errors,
//         },
//         { status: 400 }
//       );
//     }

//     if (error instanceof Stripe.errors.StripeError) {
//       return NextResponse.json(
//         {
//           error: "Payment verification error",
//           message: error.message,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Failed to confirm order" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Validation schema for order confirmation
const confirmOrderSchema = z.object({
  paymentIntentId: z.string().min(1),
  expectedAmount: z.number().min(0),
});

/**
 * Mobile API: Confirm order after successful payment
 * POST /api/mobile/checkout/confirm-order
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/checkout/confirm-order called");

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 User ID:", userId);

    const body = await request.json();
    console.log("📋 Order confirmation request:", body);

    // Validate request data
    const validatedData = confirmOrderSchema.parse(body);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      validatedData.paymentIntentId
    );

    console.log("💳 Payment Intent status:", paymentIntent.status);

    // Verify payment was successful
    if (paymentIntent.status !== "succeeded") {
      console.log("❌ Payment not successful:", paymentIntent.status);
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: paymentIntent.status,
        },
        { status: 400 }
      );
    }

    // Verify amount matches
    const paidAmount = paymentIntent.amount / 100; // Convert from cents
    if (Math.abs(paidAmount - validatedData.expectedAmount) > 0.01) {
      console.log("❌ Amount mismatch:", {
        paid: paidAmount,
        expected: validatedData.expectedAmount,
      });
      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // Verify the user matches (assuming Clerk ID is stored in metadata)
    // NOTE: Ensure paymentIntent.metadata.clerkUserId is being set during checkout session creation
    if (paymentIntent.metadata.clerkUserId !== userId) {
      console.log("❌ User ID mismatch in payment metadata:", {
        paymentIntentUserId: paymentIntent.metadata.clerkUserId,
        authenticatedUserId: userId,
      });
      return NextResponse.json(
        { error: "Payment user mismatch or unauthorized access" },
        { status: 403 }
      );
    }

    console.log("✅ Payment verification successful");

    // **IMPORTANT CHANGE HERE:** Call `confirmPayment` instead of `createCheckoutSession`
    try {
      const { confirmPayment } = await import(
        "@/lib/actions/orderServerActions"
      );

      const orderResult = await confirmPayment(validatedData.paymentIntentId);

      if (!orderResult.success) {
        console.log("❌ Order confirmation failed:", orderResult.error);
        return NextResponse.json(
          { error: "Failed to confirm order" },
          { status: 500 }
        );
      }

      console.log(
        "✅ Order confirmed successfully:",
        orderResult.order?.orderNumber
      );

      // Clear user's cart after successful order
      try {
        const { clearCart } = await import(
          "@/lib/actions/unifiedCartServerActions"
        );
        await clearCart();
        console.log("🛒 Cart cleared after successful order");
      } catch (cartError) {
        console.log("⚠️ Cart clearing failed (non-critical):", cartError);
      }

      // Prepare response
      const response = {
        success: true,
        order: {
          id: orderResult.order?._id,
          orderNumber: orderResult.order?.orderNumber,
          status: orderResult.order?.status,
          totalAmount: orderResult.order?.totalAmount,
          currency: orderResult.order?.currency,
          items: orderResult.order?.items,
          shippingAddress: orderResult.order?.shippingAddress,
          trackingNumber: orderResult.order?.trackingNumber,
          createdAt: orderResult.order?.createdAt,
        },
        payment: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amountPaid: paidAmount,
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method, // Note: This might be the PaymentMethod ID, not the type (e.g., 'card')
        },
        nextSteps: {
          orderConfirmationSent: true,
          estimatedDelivery: null, // This would need logic to calculate based on order.shippingMethod
          trackingAvailable: false, // This would be true if a tracking number exists
        },
      };

      console.log("📤 Order confirmation response sent successfully");
      return NextResponse.json(response);
    } catch (orderError) {
      console.error("❌ Error confirming order via server action:", orderError);
      return NextResponse.json(
        { error: "Failed to finalize order record" }, // More accurate error message
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Order confirmation API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid confirmation data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Payment verification error from Stripe",
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during order confirmation" },
      { status: 500 }
    );
  }
}
