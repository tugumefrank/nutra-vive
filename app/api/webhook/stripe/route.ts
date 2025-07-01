import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership, Membership, Consultation, IUser, IUserMembership, IMembership, IConsultation } from "@/lib/db/models";

// Stripe webhook event handlers interface
interface WebhookHandlers {
  'customer.subscription.created': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'customer.subscription.updated': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'customer.subscription.deleted': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'invoice.payment_succeeded': (invoice: StripeInvoiceWithSubscription) => Promise<void>;
  'invoice.payment_failed': (invoice: StripeInvoiceWithSubscription) => Promise<void>;
  'charge.succeeded': (charge: Stripe.Charge) => Promise<void>;
  'payment_intent.succeeded': (paymentIntent: Stripe.PaymentIntent) => Promise<void>;
}

// Extended Stripe types for missing properties
interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | Stripe.Subscription;
  payment_intent?: Stripe.PaymentIntent;
  amount_paid: number;
}

interface ExpandedInvoice extends Stripe.Invoice {
  payment_intent?: Stripe.PaymentIntent;
}

interface ExpandedSubscription extends Stripe.Subscription {
  latest_invoice: ExpandedInvoice;
  current_period_start: number;
  current_period_end: number;
}

// Type for Stripe subscription with period data
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

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

    // Type-safe event handling
    const handlers: Partial<WebhookHandlers> = {
      'customer.subscription.created': handleSubscriptionCreated,
      'customer.subscription.updated': handleSubscriptionUpdated,
      'customer.subscription.deleted': handleSubscriptionDeleted,
      'invoice.payment_succeeded': handleInvoicePaymentSucceeded,
      'invoice.payment_failed': handleInvoicePaymentFailed,
      'charge.succeeded': handleChargeSucceeded,
      'payment_intent.succeeded': handlePaymentIntentSucceeded,
    };

    const handler = handlers[event.type as keyof WebhookHandlers];
    
    if (handler) {
      // Type-safe event object casting based on event type
      if (event.type.startsWith('customer.subscription.')) {
        await (handler as WebhookHandlers['customer.subscription.created'])(
          event.data.object as StripeSubscriptionWithPeriod
        );
      } else if (event.type.startsWith('invoice.')) {
        await (handler as WebhookHandlers['invoice.payment_succeeded'])(
          event.data.object as StripeInvoiceWithSubscription
        );
      } else if (event.type === 'charge.succeeded') {
        await (handler as WebhookHandlers['charge.succeeded'])(
          event.data.object as Stripe.Charge
        );
      } else if (event.type === 'payment_intent.succeeded') {
        await (handler as WebhookHandlers['payment_intent.succeeded'])(
          event.data.object as Stripe.PaymentIntent
        );
      }
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

async function handleSubscriptionCreated(subscription: StripeSubscriptionWithPeriod): Promise<void> {
  console.log("Processing subscription.created:", subscription.id);
  
  // Don't create membership here - wait for first payment to succeed
  // This prevents duplicate memberships when payment fails
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionWithPeriod): Promise<void> {
  console.log("Processing subscription.updated:", subscription.id);

  try {
    const userMembership: IUserMembership | null = await UserMembership.findOne({
      subscriptionId: subscription.id,
    });

    if (userMembership) {
      // Update membership status based on subscription status
      let newStatus: IUserMembership['status'] = "cancelled";
      
      if (subscription.status === "active") {
        newStatus = "active";
      } else if (subscription.status === "canceled") {
        newStatus = "cancelled";
      } else if (subscription.status === "past_due") {
        newStatus = "paused"; // Map past_due to paused
      } else if (subscription.status === "incomplete") {
        // Don't overwrite active membership back to incomplete if payment already succeeded
        if (userMembership.status === "active" && userMembership.lastPaymentDate) {
          console.log(`Skipping status change from active to incomplete for membership ${userMembership._id} - payment already processed`);
          return;
        }
        newStatus = "incomplete";
      }

      await UserMembership.findByIdAndUpdate(userMembership._id, {
        status: newStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      });

      console.log(`Updated membership ${userMembership._id} status to ${newStatus}`);
    }
  } catch (error) {
    const err = error as Error;
    console.error("Error handling subscription.updated:", err.message);
  }
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionWithPeriod): Promise<void> {
  console.log("Processing subscription.deleted:", subscription.id);

  try {
    const result = await UserMembership.findOneAndUpdate(
      { subscriptionId: subscription.id },
      { status: "cancelled", endDate: new Date() }
    );

    if (result) {
      console.log(`Cancelled membership for subscription ${subscription.id}`);
    } else {
      console.warn(`No membership found for subscription ${subscription.id}`);
    }
  } catch (error) {
    const err = error as Error;
    console.error("Error handling subscription.deleted:", err.message);
  }
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoiceWithSubscription): Promise<void> {
  console.log("Processing invoice.payment_succeeded:", invoice.id);

  if (!invoice.subscription) {
    console.log("Invoice is not for a subscription, skipping");
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    ) as unknown as StripeSubscriptionWithPeriod;

    const membershipId: string | undefined = subscription.metadata.membershipId;
    const userIdFromMetadata: string | undefined = subscription.metadata.userId;

    if (!membershipId || !userIdFromMetadata) {
      console.error("Missing metadata in subscription", subscription.id);
      return;
    }

    // Check if membership already exists
    let userMembership: IUserMembership | null = await UserMembership.findOne({
      subscriptionId: subscription.id,
    });

    if (!userMembership) {
      // First payment - create the membership or activate existing incomplete one
      const [user, membership]: [IUser | null, IMembership | null] = await Promise.all([
        User.findById(userIdFromMetadata),
        Membership.findById(membershipId),
      ]);

      if (!user || !membership) {
        console.error("User or membership not found", { userIdFromMetadata, membershipId });
        return;
      }

      // Create new membership directly - no incomplete memberships anymore
      // Initialize product usage tracking
      const productUsage = membership.productAllocations.map((allocation: any) => ({
        categoryId: allocation.categoryId,
        categoryName: allocation.categoryName,
        allocatedQuantity: allocation.quantity,
        usedQuantity: 0,
        availableQuantity: allocation.quantity,
      }));

      userMembership = new UserMembership({
        user: user._id,
        membership: membershipId,
        subscriptionId: subscription.id,
        status: "active",
        startDate: new Date(),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        lastPaymentDate: new Date(),
        lastPaymentAmount: invoice.amount_paid / 100, // Convert from cents
        productUsage,
      });

      await userMembership.save();
      console.log(`Created new membership for user ${user._id}`);
    } else {
      // Renewal payment - reset usage for new period
      if (userMembership.membership) {
        const membership: IMembership | null = await Membership.findById(userMembership.membership);
        
        if (membership) {
          const resetUsage = membership.productAllocations.map((allocation: any) => ({
            categoryId: allocation.categoryId,
            categoryName: allocation.categoryName,
            allocatedQuantity: allocation.quantity,
            usedQuantity: 0,
            availableQuantity: allocation.quantity,
          }));

          userMembership.productUsage = resetUsage;
          userMembership.status = "active";
          userMembership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
          userMembership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          userMembership.nextBillingDate = new Date(subscription.current_period_end * 1000);
          userMembership.lastPaymentDate = new Date();
          userMembership.lastPaymentAmount = invoice.amount_paid / 100; // Convert from cents

          await userMembership.save();
          console.log(`Reset usage for membership renewal ${userMembership._id}`);
        }
      }
    }
  } catch (error) {
    const err = error as Error;
    console.error("Error handling invoice.payment_succeeded:", err.message);
  }
}

async function handleInvoicePaymentFailed(invoice: StripeInvoiceWithSubscription): Promise<void> {
  console.log("Processing invoice.payment_failed:", invoice.id);

  if (!invoice.subscription) {
    console.log("Invoice is not for a subscription, skipping");
    return;
  }

  try {
    const result: IUserMembership | null = await UserMembership.findOneAndUpdate(
      { subscriptionId: invoice.subscription as string },
      { status: "paused" }, // Map payment failed to paused status
      { new: true }
    );

    if (result) {
      console.log(`Marked membership ${result._id} as paused for subscription ${invoice.subscription}`);
    } else {
      console.warn(`No membership found for subscription ${invoice.subscription}`);
    }
  } catch (error) {
    const err = error as Error;
    console.error("Error handling invoice.payment_failed:", err.message);
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
  console.log("Processing charge.succeeded:", charge.id);

  // First check if this charge has subscription metadata (for memberships)
  const { membershipId, subscriptionId, userId } = charge.metadata;

  if (membershipId && subscriptionId && userId) {
    // This is a membership subscription charge - handle it
    await handleMembershipCharge(charge, { membershipId, subscriptionId, userId });
    return;
  }

  // If no subscription metadata, check if this is a consultation payment
  // Get payment intent to access its metadata
  if (charge.payment_intent) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      const { submissionId, transactionType } = paymentIntent.metadata;

      if (submissionId && transactionType === 'consultation') {
        console.log("Processing consultation payment charge:", {
          chargeId: charge.id,
          paymentIntentId: paymentIntent.id,
          submissionId,
          amount: charge.amount / 100
        });

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
        return;
      }
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
    }
  }

  console.log("Charge has no recognized metadata, skipping");
}

async function handleMembershipCharge(charge: Stripe.Charge, metadata: { membershipId: string; subscriptionId: string; userId: string }): Promise<void> {
  const { membershipId, subscriptionId, userId } = metadata;

  console.log("Processing subscription charge with metadata:", {
    membershipId,
    subscriptionId,
    userId,
    amount: charge.amount / 100 // Convert from cents
  });

  try {
    // Get user and membership
    const [user, membership]: [IUser | null, IMembership | null] = await Promise.all([
      User.findById(userId),
      Membership.findById(membershipId),
    ]);

    if (!user || !membership) {
      console.error("User or membership not found", { userId, membershipId });
      return;
    }

    // Check if membership already exists with this subscriptionId
    let userMembership: IUserMembership | null = await UserMembership.findOne({
      subscriptionId: subscriptionId,
    });

    if (userMembership) {
      // Membership already exists - just update payment info
      userMembership.lastPaymentDate = new Date();
      userMembership.lastPaymentAmount = charge.amount / 100;
      userMembership.status = "active";

      await userMembership.save();
      console.log(`✅ Updated existing membership ${userMembership._id} payment info`);
      return;
    }

    // Get subscription details for period info
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as StripeSubscriptionWithPeriod;
    
    console.log("Subscription details:", {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    });

    // Create new membership directly - no incomplete memberships anymore
    const productUsage = membership.productAllocations.map((allocation: any) => ({
      categoryId: allocation.categoryId,
      categoryName: allocation.categoryName,
      allocatedQuantity: allocation.quantity,
      usedQuantity: 0,
      availableQuantity: allocation.quantity,
    }));

    userMembership = new UserMembership({
      user: user._id,
      membership: membershipId,
      subscriptionId: subscriptionId,
      status: "active",
      startDate: new Date(),
      lastPaymentDate: new Date(),
      lastPaymentAmount: charge.amount / 100,
      autoRenewal: true,
      productUsage,
    });

    if (subscription.current_period_end && subscription.current_period_start) {
        userMembership.nextBillingDate = new Date(subscription.current_period_end * 1000);
        userMembership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        userMembership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        userMembership.usageResetDate = new Date(subscription.current_period_end * 1000);
      } else {
        console.warn("Subscription period data missing, using fallback dates");
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        
        userMembership.nextBillingDate = nextMonth;
        userMembership.currentPeriodStart = now;
        userMembership.currentPeriodEnd = nextMonth;
        userMembership.usageResetDate = nextMonth;
      }

      await userMembership.save();
      console.log(`✅ Created new active membership ${userMembership._id} for user ${user._id}`);
      
      // Update membership stats
      await Membership.findByIdAndUpdate(membershipId, {
        $inc: {
          totalSubscribers: 1,
          totalRevenue: membership.price,
        },
      });

    console.log("🎉 Successfully processed subscription charge:", {
      chargeId: charge.id,
      membershipId,
      userId,
      amount: charge.amount / 100
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Error processing charge.succeeded:", err.message);
  }
}

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