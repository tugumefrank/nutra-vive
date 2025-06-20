// lib/actions/paymentServerActions.ts
"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function createPaymentIntent(amount: number): Promise<{
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}> {
  try {
    console.log("Creating payment intent for amount:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        source: "e-commerce-checkout",
      },
      description: "Nutra-Vive Product Purchase",
      // Enable payment methods
    });

    console.log("Payment intent created:", paymentIntent.id);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment intent",
    };
  }
}

export async function updatePaymentIntent(
  paymentIntentId: string,
  amount: number
): Promise<{
  success: boolean;
  clientSecret?: string;
  error?: string;
}> {
  try {
    console.log(
      "Updating payment intent:",
      paymentIntentId,
      "with amount:",
      amount
    );

    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(amount * 100), // Convert to cents
    });

    console.log("Payment intent updated:", paymentIntent.id);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
    };
  } catch (error) {
    console.error("Error updating payment intent:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update payment intent",
    };
  }
}

export async function confirmPaymentIntent(paymentIntentId: string): Promise<{
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  error?: string;
}> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve payment intent",
    };
  }
}
