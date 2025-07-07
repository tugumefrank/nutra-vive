import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership, Membership, Consultation, IUser, IUserMembership, IMembership, IConsultation } from "@/lib/db/models";
import { syncStripeDataToDatabase } from "@/lib/stripe/sync";

// Stripe webhook event handlers interface
interface WebhookHandlers {
  'customer.subscription.created': (subscription: Stripe.Subscription) => Promise<void>;
  'customer.subscription.updated': (subscription: Stripe.Subscription) => Promise<void>;
  'customer.subscription.deleted': (subscription: Stripe.Subscription) => Promise<void>;
  'invoice.payment_succeeded': (invoice: Stripe.Invoice) => Promise<void>;
  'invoice.payment_failed': (invoice: Stripe.Invoice) => Promise<void>;
  'checkout.session.completed': (session: Stripe.Checkout.Session) => Promise<void>;
  'payment_intent.succeeded': (paymentIntent: Stripe.PaymentIntent) => Promise<void>;
}

// Following t3dotgg guide: Keep types simple and use centralized sync function

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      console.error("No stripe-signature header found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log(`Received Stripe webhook: ${event.type}`);
    } catch (err) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Following t3dotgg guide: Use centralized sync function for all events
    const handlers: Partial<WebhookHandlers> = {
      'customer.subscription.created': handleSubscriptionEvent,
      'customer.subscription.updated': handleSubscriptionEvent,
      'customer.subscription.deleted': handleSubscriptionEvent,
      'invoice.payment_succeeded': handleInvoiceEvent,
      'invoice.payment_failed': handleInvoiceEvent,
      'checkout.session.completed': handleCheckoutCompleted,
      'payment_intent.succeeded': handlePaymentIntentSucceeded,
    };

    const handler = handlers[event.type as keyof WebhookHandlers];
    
    if (handler) {
      await handler(event.data.object as any);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as Error;
    console.error("Webhook handler error:", err.message);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle all subscription events using centralized sync function
 * Following t3dotgg guide: Single source of truth for subscription state
 */
async function handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
  console.log(`Processing subscription event: ${subscription.id}`);
  
  try {
    // Use centralized sync function to handle all subscription changes
    await syncStripeDataToDatabase(subscription.customer as string);
    console.log(`✅ Synced subscription data for customer ${subscription.customer}`);
  } catch (error) {
    console.error(`❌ Error syncing subscription data:`, error);
  }
}

/**
 * Handle invoice events using centralized sync function
 * Following t3dotgg guide: Let sync function handle all subscription state changes
 */
async function handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
  console.log(`Processing invoice event: ${invoice.id}`);
  
  if (!invoice.customer) {
    console.log("Invoice has no customer, skipping");
    return;
  }

  try {
    // Use centralized sync function to handle invoice-related changes
    await syncStripeDataToDatabase(invoice.customer as string);
    console.log(`✅ Synced invoice data for customer ${invoice.customer}`);
  } catch (error) {
    console.error(`❌ Error syncing invoice data:`, error);
  }
}

/**
 * Handle checkout session completed events
 * Following t3dotgg guide: Use checkout.session.completed for reliable subscription creation
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`🎯 Processing checkout.session.completed: ${session.id}`);
  console.log(`📋 Session data:`, {
    customer: session.customer,
    subscription: session.subscription,
    status: session.status,
    payment_status: session.payment_status,
    metadata: session.metadata
  });
  
  if (!session.customer) {
    console.log("❌ Checkout session has no customer, skipping");
    return;
  }

  try {
    // Use centralized sync function to handle checkout completion
    console.log(`🔄 Calling syncStripeDataToDatabase for customer: ${session.customer}`);
    const result = await syncStripeDataToDatabase(session.customer as string);
    console.log(`✅ Sync result:`, result);
    console.log(`✅ Synced checkout data for customer ${session.customer}`);
  } catch (error) {
    console.error(`❌ Error syncing checkout data:`, error);
    console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
  }
}

/**
 * Handle payment intent succeeded events (primarily for consultations)
 * Membership payments are handled by the sync function via subscription events
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("Processing payment_intent.succeeded:", paymentIntent.id);

  try {
    // Check if this is a consultation payment by looking for submissionId in metadata
    const { submissionId, transactionType } = paymentIntent.metadata;

    if (!submissionId || transactionType !== 'consultation') {
      console.log("Payment intent is not for a consultation, skipping");
      return;
    }

    // Update the consultation payment status
    const consultation = await Consultation.findOneAndUpdate(
      { 
        $or: [
          { _id: submissionId },
          { paymentIntentId: paymentIntent.id }
        ]
      },
      { 
        paymentStatus: "paid",
        paymentIntentId: paymentIntent.id,
        status: "confirmed" // Also update consultation status to confirmed when payment succeeds
      },
      { new: true }
    );

    if (consultation) {
      console.log(`✅ Updated consultation ${consultation._id} payment status to paid`);
      console.log(`✅ Updated consultation status to confirmed`);
    } else {
      console.warn(`No consultation found for payment intent ${paymentIntent.id} with submissionId ${submissionId}`);
    }

  } catch (error) {
    const err = error as Error;
    console.error("❌ Error processing payment_intent.succeeded:", err.message);
  }
}