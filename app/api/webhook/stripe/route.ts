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
  
  if (!session.customer || !session.subscription || !session.metadata) {
    console.log("❌ Checkout session missing required data, skipping");
    return;
  }

  try {
    // Extract data from webhook instead of calling Stripe API again
    const { userId, membershipId, membershipTier } = session.metadata;
    
    if (!userId || !membershipId) {
      console.error("❌ Missing userId or membershipId in metadata");
      return;
    }

    console.log(`🔄 Processing subscription for user ${userId}`);
    
    // Find user by clerkId (from metadata)
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.error(`❌ User not found with clerkId: ${userId}`);
      return;
    }
    
    // Update user with Stripe customer ID if not set
    if (!user.stripeCustomerId) {
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: session.customer
      });
      console.log(`✅ Updated user ${userId} with stripeCustomerId: ${session.customer}`);
    }
    
    // Find membership
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      console.error(`❌ Membership not found: ${membershipId}`);
      return;
    }
    
    // Get subscription status from Stripe (we need the detailed status)
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log(`📊 Subscription status: ${subscription.status}`);
    
    // Check if membership already exists
    const existingMembership = await UserMembership.findOne({
      user: user._id,
      subscriptionId: subscription.id,
    });
    
    if (existingMembership) {
      // Update existing membership to active
      await UserMembership.findByIdAndUpdate(existingMembership._id, {
        status: "active",
        lastPaymentDate: new Date(),
        lastPaymentAmount: membership.price || 0,
      });
      console.log(`✅ Updated existing membership to active`);
    } else {
      // Create new membership with proper date parsing and categoryId validation
      const productUsage = membership.productAllocations?.map((allocation: any) => {
        // Ensure categoryId is properly set
        const categoryId = allocation.categoryId?.toString() || 
                          allocation.category?.toString() || 
                          allocation._id?.toString();
        
        if (!categoryId) {
          console.warn(`Missing categoryId for allocation:`, allocation);
          return null;
        }
        
        return {
          categoryId,
          categoryName: allocation.categoryName || allocation.name || 'Unknown Category',
          allocatedQuantity: allocation.quantity || 0,
          usedQuantity: 0,
          availableQuantity: allocation.quantity || 0,
        };
      }).filter(Boolean) || [];
      
      // Properly parse dates from Stripe timestamps
      const sub = subscription as any;
      const startDate = new Date(subscription.start_date * 1000);
      const currentPeriodStart = new Date(sub.current_period_start * 1000);
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime())) {
        console.error(`❌ Invalid dates from subscription:`, {
          start_date: subscription.start_date,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end
        });
        throw new Error('Invalid subscription dates from Stripe');
      }
      
      console.log(`📅 Creating membership with dates:`, {
        startDate: startDate.toISOString(),
        currentPeriodStart: currentPeriodStart.toISOString(),
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        productUsageCount: productUsage.length
      });
      
      await UserMembership.create({
        user: user._id,
        membership: membershipId,
        subscriptionId: subscription.id,
        status: "active",
        startDate,
        currentPeriodStart,
        currentPeriodEnd,
        usageResetDate: currentPeriodEnd,
        nextBillingDate: subscription.cancel_at_period_end 
          ? null 
          : currentPeriodEnd,
        autoRenewal: !subscription.cancel_at_period_end,
        lastPaymentDate: new Date(),
        lastPaymentAmount: membership.price || 0,
        productUsage,
      });
      
      // Update membership stats
      await Membership.findByIdAndUpdate(membershipId, {
        $inc: {
          totalSubscribers: 1,
          totalRevenue: membership.price || 0,
        },
      });
      
      console.log(`✅ Created new membership for user ${userId}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing checkout completion:`, error);
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