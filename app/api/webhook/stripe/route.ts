import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership, Membership, Consultation, IUser, IUserMembership, IMembership, IConsultation } from "@/lib/db/models";
import { syncStripeDataToDatabase } from "@/lib/stripe/sync";
import { sendEmail } from "@/lib/email";

// Stripe webhook event handlers interface
interface WebhookHandlers {
  'customer.subscription.created': (subscription: Stripe.Subscription) => Promise<void>;
  'customer.subscription.updated': (subscription: Stripe.Subscription) => Promise<void>;
  'customer.subscription.deleted': (subscription: Stripe.Subscription) => Promise<void>;
  'invoice.payment_succeeded': (invoice: Stripe.Invoice) => Promise<void>;
  'invoice.payment_failed': (invoice: Stripe.Invoice) => Promise<void>;
  'checkout.session.completed': (session: Stripe.Checkout.Session) => Promise<void>;
  'payment_intent.succeeded': (paymentIntent: Stripe.PaymentIntent) => Promise<void>;
  'charge.succeeded': (charge: Stripe.Charge) => Promise<void>;
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
      console.log(`🎯 Received Stripe webhook: ${event.type}`);
      
      // Enhanced logging for checkout sessions
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`🎉 CHECKOUT SESSION COMPLETED:`, {
          sessionId: session.id,
          customer: session.customer,
          subscription: session.subscription,
          status: session.status,
          payment_status: session.payment_status,
          metadata: session.metadata
        });
      }
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
      'charge.succeeded': handleChargeSucceeded,
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
    console.error("❌ Checkout session missing required data:", {
      customer: !!session.customer,
      subscription: !!session.subscription, 
      metadata: !!session.metadata,
      sessionData: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status
      }
    });
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
    
    // Find user by clerkId (handle both web and mobile formats)
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log(`🔍 User not found with exact clerkId: ${userId}, trying alternative lookups...`);
      
      // Try to find user by other methods
      // 1. Check if it's a Stripe customer ID accidentally stored
      user = await User.findOne({ stripeCustomerId: session.customer });
      if (user) {
        console.log(`✅ Found user by stripeCustomerId`);
      }
    }
    
    if (!user) {
      // 2. Try to find by email from Stripe customer
      try {
        const stripeCustomer = await stripe.customers.retrieve(session.customer as string);
        if (!stripeCustomer.deleted && 'email' in stripeCustomer && stripeCustomer.email) {
          user = await User.findOne({ email: stripeCustomer.email });
          if (user) {
            console.log(`✅ Found user by email from Stripe customer: ${stripeCustomer.email}`);
            // Update the user with correct clerkId if missing
            if (!user.clerkId) {
              await User.findByIdAndUpdate(user._id, { clerkId: userId });
              console.log(`✅ Updated user with clerkId: ${userId}`);
            }
          }
        }
      } catch (stripeError) {
        console.error(`❌ Error fetching Stripe customer:`, stripeError);
      }
    }
    
    if (!user) {
      console.error(`❌ User not found with any method for userId: ${userId}, customerId: ${session.customer}`);
      return;
    }
    
    console.log(`✅ Found user:`, { _id: user._id, email: user.email, clerkId: user.clerkId });
    
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
      
      // Handle missing period dates (for incomplete subscriptions)
      const currentPeriodStart = sub.current_period_start 
        ? new Date(sub.current_period_start * 1000)
        : startDate;
      const currentPeriodEnd = sub.current_period_end 
        ? new Date(sub.current_period_end * 1000)
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from start
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime())) {
        console.error(`❌ Invalid dates from subscription:`, {
          start_date: subscription.start_date,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
          subscription_status: subscription.status
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
      
      // Send email notifications
      try {
        // Send confirmation email to customer
        await sendEmail({
          to: user.email,
          subject: `Welcome to your ${membershipTier || membership.tier} membership!`,
          template: "membership-subscription-confirmation",
          data: {
            membershipTier: membershipTier || membership.tier,
            price: membership.price || 0,
            nextBillingDate: currentPeriodEnd.toLocaleDateString(),
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            productAllocations: productUsage.map((usage: any) => ({
              categoryName: usage.categoryName,
              quantity: usage.allocatedQuantity,
            })),
          },
        });
        
        // Send notification to admin
        await sendEmail({
          to: "orders@nutraviveholistic.com",
          subject: `New ${membershipTier || membership.tier} membership subscription`,
          template: "admin-new-membership",
          data: {
            membershipTier: membershipTier || membership.tier,
            price: membership.price || 0,
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            subscriptionId: subscription.id,
            startDate: startDate.toLocaleDateString(),
            nextBillingDate: currentPeriodEnd.toLocaleDateString(),
            productAllocations: productUsage.map((usage: any) => ({
              categoryName: usage.categoryName,
              quantity: usage.allocatedQuantity,
            })),
          },
        });
        
        console.log(`✅ Sent membership subscription emails for user ${userId}`);
      } catch (emailError) {
        console.error(`❌ Error sending membership subscription emails:`, emailError);
        // Don't fail the webhook if email sending fails
      }
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

/**
 * Handle charge succeeded events
 * This can trigger subscription sync for mobile payments
 */
async function handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
  console.log(`Processing charge.succeeded: ${charge.id}`);
  console.log(`🔍 Charge details:`, {
    customer: charge.customer,
    invoice: 'invoice' in charge ? charge.invoice : null,
    amount: charge.amount,
    description: charge.description,
    metadata: charge.metadata
  });
  
  if (!charge.customer) {
    console.log("Charge has no customer, skipping");
    return;
  }

  try {
    // Check if this charge is related to a subscription
    if ('invoice' in charge && charge.invoice) {
      console.log(`🔗 Charge is related to invoice ${charge.invoice}, syncing subscription data`);
      // Use centralized sync function to handle subscription changes
      await syncStripeDataToDatabase(charge.customer as string);
      console.log(`✅ Synced subscription data for customer ${charge.customer} from charge`);
    } else {
      console.log(`💰 Charge ${charge.id} appears to be one-time payment, checking for subscription anyway...`);
      
      // For mobile payments, sometimes checkout.session.completed might be missing
      // So let's try to sync subscription data anyway
      try {
        const syncResult = await syncStripeDataToDatabase(charge.customer as string);
        if (syncResult) {
          console.log(`✅ Found and synced subscription data for customer ${charge.customer} (backup sync from charge)`);
        } else {
          console.log(`ℹ️  No subscription data found for customer ${charge.customer}`);
        }
      } catch (syncError) {
        console.log(`⚠️  Backup sync failed, but this is normal for non-subscription charges:`, syncError instanceof Error ? syncError.message : syncError);
      }
    }
  } catch (error) {
    console.error(`❌ Error syncing data from charge.succeeded:`, error);
  }
}