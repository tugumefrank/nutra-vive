import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership, Membership, IUser, IUserMembership, IMembership } from "@/lib/db/models";

// Stripe webhook event handlers interface
interface WebhookHandlers {
  'customer.subscription.created': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'customer.subscription.updated': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'customer.subscription.deleted': (subscription: StripeSubscriptionWithPeriod) => Promise<void>;
  'invoice.payment_succeeded': (invoice: StripeInvoiceWithSubscription) => Promise<void>;
  'invoice.payment_failed': (invoice: StripeInvoiceWithSubscription) => Promise<void>;
  'charge.succeeded': (charge: Stripe.Charge) => Promise<void>;
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

      // Check for existing incomplete membership
      const incompleteMembership: IUserMembership | null = await UserMembership.findOne({
        user: user._id,
        membership: membershipId,
        status: "incomplete",
      });

      if (incompleteMembership) {
        // Activate existing incomplete membership
        incompleteMembership.status = "active";
        incompleteMembership.subscriptionId = subscription.id;
        incompleteMembership.nextBillingDate = new Date(subscription.current_period_end * 1000);
        incompleteMembership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        incompleteMembership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        incompleteMembership.lastPaymentDate = new Date();
        incompleteMembership.lastPaymentAmount = invoice.amount_paid / 100; // Convert from cents

        await incompleteMembership.save();
        console.log(`Activated incomplete membership ${incompleteMembership._id} for user ${user._id}`);
      } else {
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
      }
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

  // Check if this charge has subscription metadata
  const { membershipId, subscriptionId, userId } = charge.metadata;

  if (!membershipId || !subscriptionId || !userId) {
    console.log("Charge is missing subscription metadata, skipping");
    return;
  }

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

    // Check if membership already exists
    let userMembership: IUserMembership | null = await UserMembership.findOne({
      subscriptionId: subscriptionId,
    });

    if (!userMembership) {
      // Check for existing incomplete membership
      const incompleteMembership: IUserMembership | null = await UserMembership.findOne({
        user: user._id,
        membership: membershipId,
        status: "incomplete",
      });

      if (incompleteMembership) {
        // Activate existing incomplete membership
        incompleteMembership.status = "active";
        incompleteMembership.subscriptionId = subscriptionId;
        incompleteMembership.lastPaymentDate = new Date();
        incompleteMembership.lastPaymentAmount = charge.amount / 100; // Convert from cents

        // Get subscription details for period info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as StripeSubscriptionWithPeriod;
        
        incompleteMembership.nextBillingDate = new Date(subscription.current_period_end * 1000);
        incompleteMembership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        incompleteMembership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        await incompleteMembership.save();
        console.log(`✅ Activated incomplete membership ${incompleteMembership._id} for user ${user._id}`);
      } else {
        // Get subscription details for period info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as StripeSubscriptionWithPeriod;

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
          subscriptionId: subscriptionId,
          status: "active",
          startDate: new Date(),
          nextBillingDate: new Date(subscription.current_period_end * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          lastPaymentDate: new Date(),
          lastPaymentAmount: charge.amount / 100, // Convert from cents
          productUsage,
        });

        await userMembership.save();
        console.log(`✅ Created new membership ${userMembership._id} for user ${user._id}`);
      }
    } else {
      // Existing membership - update payment info
      userMembership.lastPaymentDate = new Date();
      userMembership.lastPaymentAmount = charge.amount / 100;
      userMembership.status = "active";

      await userMembership.save();
      console.log(`✅ Updated existing membership ${userMembership._id} payment info`);
    }

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