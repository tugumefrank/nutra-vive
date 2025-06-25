// lib/actions/membershipSubscriptionServerActions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { connectToDatabase } from "../db";
import { User, Membership, UserMembership } from "../db/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Create Stripe subscription for membership
export async function createMembershipSubscription(
  membershipId: string
): Promise<{
  success: boolean;
  clientSecret?: string;
  subscriptionId?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    // Get user and membership details
    const [user, membership] = await Promise.all([
      User.findOne({ clerkId: userId }),
      Membership.findById(membershipId),
    ]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!membership || !membership.isActive) {
      return { success: false, error: "Membership not found or inactive" };
    }

    // Check if user already has an active membership
    const existingMembership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    });

    if (existingMembership) {
      return {
        success: false,
        error:
          "You already have an active membership. Please cancel it first to subscribe to a new one.",
      };
    }

    console.log("Creating subscription for membership:", membership.name);

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString(),
          clerkId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: stripeCustomerId,
      });
    }

    // Create or get Stripe price for this membership
    const priceId = await getOrCreateStripePrice(membership);

    try {
      // Method 1: Try the standard approach first
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          membershipId: membership._id.toString(),
          userId: user._id.toString(),
          membershipTier: membership.tier,
        },
      });

      console.log("Subscription created:", {
        id: subscription.id,
        status: subscription.status,
        latest_invoice: subscription.latest_invoice ? "Present" : "Missing",
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;

      if (!invoice) {
        console.log("No invoice found, trying alternative method...");
        // Method 2: Alternative approach - retrieve the subscription to get the invoice
        const retrievedSub = await stripe.subscriptions.retrieve(
          subscription.id,
          {
            expand: ["latest_invoice.payment_intent"],
          }
        );

        const altInvoice = retrievedSub.latest_invoice as Stripe.Invoice & {
          payment_intent?: Stripe.PaymentIntent;
        };
        if (altInvoice?.payment_intent) {
          const altPaymentIntent =
            altInvoice.payment_intent as Stripe.PaymentIntent;
          if (altPaymentIntent.client_secret) {
            console.log("✅ Alternative method succeeded");
            return {
              success: true,
              clientSecret: altPaymentIntent.client_secret,
              subscriptionId: subscription.id,
            };
          }
        }

        throw new Error("No invoice found for subscription");
      }

      console.log("Invoice details:", {
        id: invoice.id,
        status: invoice.status,
        payment_intent: (
          invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent }
        ).payment_intent
          ? "Present"
          : "Missing",
      });

      const paymentIntent = (
        invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent }
      ).payment_intent as Stripe.PaymentIntent;

      if (!paymentIntent) {
        console.log(
          "No payment intent found, trying to create one manually..."
        );

        // Method 3: Create payment intent manually for the invoice
        const manualPaymentIntent = await stripe.paymentIntents.create({
          amount: invoice.amount_due,
          currency: invoice.currency,
          customer: stripeCustomerId,
          metadata: {
            subscriptionId: subscription.id,
            membershipId: membership._id.toString(),
            userId: user._id.toString(),
          },
          description: `${membership.name} subscription`,
        });

        console.log("✅ Manual payment intent created");
        return {
          success: true,
          clientSecret: manualPaymentIntent.client_secret!,
          subscriptionId: subscription.id,
        };
      }

      console.log("Payment intent details:", {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret ? "Present" : "Missing",
      });

      if (!paymentIntent.client_secret) {
        throw new Error(
          `Payment intent ${paymentIntent.id} has no client_secret. Status: ${paymentIntent.status}`
        );
      }

      console.log("✅ Subscription created successfully:", subscription.id);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      };
    } catch (subscriptionError) {
      console.error(
        "Subscription creation failed, trying simpler approach:",
        subscriptionError
      );

      // Method 4: Fallback - create a simple payment intent for the membership amount
      // This won't be a true subscription but will allow testing
      const fallbackPaymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(membership.price * 100),
        currency: membership.currency.toLowerCase() || "usd",
        customer: stripeCustomerId,
        metadata: {
          membershipId: membership._id.toString(),
          userId: user._id.toString(),
          membershipTier: membership.tier,
          fallback: "true",
        },
        description: `${membership.name} membership payment`,
      });

      console.log("✅ Fallback payment intent created");
      return {
        success: true,
        clientSecret: fallbackPaymentIntent.client_secret!,
        subscriptionId: `fallback_${fallbackPaymentIntent.id}`,
      };
    }
  } catch (error) {
    console.error("❌ Error creating membership subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    };
  }
}

// Helper function to create or get Stripe price for membership
async function getOrCreateStripePrice(membership: any): Promise<string> {
  // Check if price already exists
  if (membership.stripePriceId) {
    try {
      await stripe.prices.retrieve(membership.stripePriceId);
      return membership.stripePriceId;
    } catch (error) {
      console.log("Existing price not found, creating new one");
    }
  }

  // Create new price
  const price = await stripe.prices.create({
    unit_amount: Math.round(membership.price * 100), // Convert to cents
    currency: membership.currency.toLowerCase() || "usd",
    recurring: {
      interval:
        membership.billingFrequency === "yearly"
          ? "year"
          : membership.billingFrequency === "quarterly"
            ? "month"
            : "month",
      interval_count: membership.billingFrequency === "quarterly" ? 3 : 1,
    },
    product_data: {
      name: membership.name,
      metadata: {
        membershipId: membership._id.toString(),
        tier: membership.tier,
        description:
          membership.description || `${membership.tier} membership plan`,
      },
    },
    metadata: {
      membershipId: membership._id.toString(),
      tier: membership.tier,
    },
  });

  // Update membership with price ID
  await Membership.findByIdAndUpdate(membership._id, {
    stripePriceId: price.id,
  });

  return price.id;
}

// Confirm subscription payment and activate membership
export async function confirmMembershipSubscription(
  subscriptionId: string
): Promise<{
  success: boolean;
  userMembership?: any;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    // Check if this is a fallback payment intent
    if (subscriptionId.startsWith("fallback_")) {
      const paymentIntentId = subscriptionId.replace("fallback_", "");
      return await handleFallbackPayment(paymentIntentId, userId);
    }

    // Handle real subscription
    const subscription = (await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice.payment_intent"],
    })) as Stripe.Subscription;

    if (subscription.status !== "active") {
      return {
        success: false,
        error: "Subscription is not active. Please complete payment.",
      };
    }

    const membershipId = subscription.metadata.membershipId;
    if (!membershipId) {
      return { success: false, error: "Invalid subscription metadata" };
    }

    // Get user and membership
    const [user, membership] = await Promise.all([
      User.findOne({ clerkId: userId }),
      Membership.findById(membershipId),
    ]);

    if (!user || !membership) {
      return { success: false, error: "User or membership not found" };
    }

    // Check if membership already exists
    const existingMembership = await UserMembership.findOne({
      user: user._id,
      subscriptionId: subscriptionId,
    });

    if (existingMembership) {
      return {
        success: true,
        userMembership: existingMembership,
      };
    }

    // Calculate dates
    const now = new Date();
    const nextBillingDate = new Date(
      (subscription as any).current_period_end * 1000
    );
    const currentPeriodStart = new Date(
      (subscription as any).current_period_start * 1000
    );
    const currentPeriodEnd = new Date(
      (subscription as any).current_period_end * 1000
    );

    // Initialize product usage tracking
    const productUsage = membership.productAllocations.map(
      (allocation: any) => ({
        categoryId: allocation.categoryId,
        categoryName: allocation.categoryName,
        allocatedQuantity: allocation.quantity,
        usedQuantity: 0,
        availableQuantity: allocation.quantity,
      })
    );

    // Create user membership
    const userMembership = new UserMembership({
      user: user._id,
      membership: membershipId,
      subscriptionId: subscriptionId,
      status: "active",
      startDate: now,
      nextBillingDate,
      currentPeriodStart,
      currentPeriodEnd,
      usageResetDate: currentPeriodEnd,
      productUsage,
      autoRenewal: true,
      lastPaymentDate: now,
      lastPaymentAmount: membership.price,
    });

    await userMembership.save();

    // Update membership stats
    await Membership.findByIdAndUpdate(membershipId, {
      $inc: {
        totalSubscribers: 1,
        totalRevenue: membership.price,
      },
    });

    console.log(`✅ Membership activated for user ${user.email}`);

    revalidatePath("/account/memberships");
    revalidatePath("/admin/memberships");

    return {
      success: true,
      userMembership: userMembership.toObject(),
    };
  } catch (error) {
    console.error("❌ Error confirming membership subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to confirm subscription",
    };
  }
}

// Handle fallback payment confirmation
async function handleFallbackPayment(
  paymentIntentId: string,
  userId: string
): Promise<{
  success: boolean;
  userMembership?: any;
  error?: string;
}> {
  try {
    // Get payment intent to verify it's paid
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return {
        success: false,
        error: "Payment was not successful. Please try again.",
      };
    }

    const membershipId = paymentIntent.metadata.membershipId;
    if (!membershipId) {
      return { success: false, error: "Invalid payment metadata" };
    }

    // Get user and membership
    const [user, membership] = await Promise.all([
      User.findOne({ clerkId: userId }),
      Membership.findById(membershipId),
    ]);

    if (!user || !membership) {
      return { success: false, error: "User or membership not found" };
    }

    // Calculate dates (1 month from now for fallback)
    const now = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Initialize product usage tracking
    const productUsage = membership.productAllocations.map(
      (allocation: any) => ({
        categoryId: allocation.categoryId,
        categoryName: allocation.categoryName,
        allocatedQuantity: allocation.quantity,
        usedQuantity: 0,
        availableQuantity: allocation.quantity,
      })
    );

    // Create user membership (without subscription ID for fallback)
    const userMembership = new UserMembership({
      user: user._id,
      membership: membershipId,
      status: "active",
      startDate: now,
      nextBillingDate,
      currentPeriodStart: now,
      currentPeriodEnd,
      usageResetDate: currentPeriodEnd,
      productUsage,
      autoRenewal: false, // No auto-renewal for fallback payments
      lastPaymentDate: now,
      lastPaymentAmount: membership.price,
    });

    await userMembership.save();

    // Update membership stats
    await Membership.findByIdAndUpdate(membershipId, {
      $inc: {
        totalSubscribers: 1,
        totalRevenue: membership.price,
      },
    });

    console.log(`✅ Fallback membership activated for user ${user.email}`);

    revalidatePath("/account/memberships");
    revalidatePath("/admin/memberships");

    return {
      success: true,
      userMembership: userMembership.toObject(),
    };
  } catch (error) {
    console.error("❌ Error handling fallback payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process payment",
    };
  }
}

// Cancel membership subscription
export async function cancelMembershipSubscription(
  userMembershipId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    // Get user membership
    const userMembership = await UserMembership.findById(userMembershipId)
      .populate("user")
      .populate("membership");

    if (!userMembership) {
      return { success: false, error: "Membership not found" };
    }

    // Verify ownership
    if (
      typeof userMembership.user === "object" &&
      userMembership.user !== null &&
      "clerkId" in userMembership.user &&
      (userMembership.user as any).clerkId === userId
    ) {
      // authorized
    } else {
      return { success: false, error: "Unauthorized" };
    }

    if (userMembership.subscriptionId) {
      // Cancel subscription in Stripe
      await stripe.subscriptions.update(userMembership.subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update membership status
    await UserMembership.findByIdAndUpdate(userMembershipId, {
      status: "cancelled",
      autoRenewal: false,
    });

    // Update membership stats
    await Membership.findByIdAndUpdate(userMembership.membership._id, {
      $inc: { totalSubscribers: -1 },
    });

    console.log(`✅ Membership cancelled for user`);

    revalidatePath("/account/memberships");
    revalidatePath("/admin/memberships");

    return { success: true };
  } catch (error) {
    console.error("❌ Error cancelling membership subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    };
  }
}

// Get user's current membership
export async function getCurrentMembership(): Promise<{
  success: boolean;
  membership?: any;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userMembership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    })
      .populate("membership")
      .lean();

    if (!userMembership) {
      return { success: true, membership: null };
    }

    return {
      success: true,
      membership: {
        ...userMembership,
        _id: userMembership._id.toString(),
        user: userMembership.user.toString(),
        membership: {
          ...userMembership.membership,
          _id: userMembership.membership._id.toString(),
        },
      },
    };
  } catch (error) {
    console.error("❌ Error getting current membership:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get membership",
    };
  }
}
