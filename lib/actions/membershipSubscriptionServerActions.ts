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

// Helper function to create incomplete UserMembership
async function createIncompleteUserMembership(
  userId: string,
  membership: any,
  subscriptionId: string
) {
  try {
    // Check if already exists with this subscriptionId
    const existingBySubscription = await UserMembership.findOne({
      subscriptionId: subscriptionId,
    });

    if (existingBySubscription) {
      return existingBySubscription;
    }

    // Check if user already has incomplete membership for same membership plan
    const existingIncomplete = await UserMembership.findOne({
      user: userId,
      membership: membership._id,
      status: "incomplete",
      subscriptionId: { $exists: false } // No subscriptionId set yet
    });

    if (existingIncomplete) {
      // Update existing incomplete membership with subscriptionId
      existingIncomplete.subscriptionId = subscriptionId;
      await existingIncomplete.save();
      return existingIncomplete;
    }

    // Initialize product usage tracking
    console.log("Membership productAllocations:", membership.productAllocations);
    const productUsage = membership.productAllocations
      .filter((allocation: any) => allocation.categoryId || allocation.category)
      .map((allocation: any) => ({
        categoryId: allocation.categoryId?.toString() || allocation.category?.toString(),
        categoryName: allocation.categoryName || 'Unknown Category',
        allocatedQuantity: allocation.quantity || 0,
        usedQuantity: 0,
        availableQuantity: allocation.quantity || 0,
      }));
    console.log("Generated productUsage:", productUsage);
    
    if (productUsage.length === 0) {
      throw new Error("No valid product allocations found for membership");
    }

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const userMembership = new UserMembership({
      user: userId,
      membership: membership._id,
      subscriptionId: subscriptionId,
      status: "incomplete", // Will be updated to "active" by webhook
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      usageResetDate: nextMonth,
      productUsage,
    });

    await userMembership.save();
    console.log(`Created incomplete membership for user ${userId}`);
    return userMembership;
  } catch (error) {
    console.error("Error creating incomplete membership:", error);
    throw error;
  }
}

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
      status: { $in: ["active", "incomplete"] },
    });

    if (existingMembership) {
      // If there's an incomplete membership, check if the subscription is still valid
      if (
        existingMembership.status === "incomplete" &&
        existingMembership.subscriptionId
      ) {
        try {
          const existingSubscription = await stripe.subscriptions.retrieve(
            existingMembership.subscriptionId
          );

          // If subscription exists and is incomplete, return its client secret
          if (existingSubscription.status === "incomplete") {
            const latestInvoice = await stripe.invoices.retrieve(
              existingSubscription.latest_invoice as string,
              { expand: ["payment_intent"] }
            );

            const paymentIntent = (latestInvoice as any).payment_intent as Stripe.PaymentIntent;

            if (paymentIntent?.client_secret) {
              return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                subscriptionId: existingSubscription.id,
              };
            }
          }
        } catch (error) {
          console.warn("Existing subscription not found, creating new one");
          // Continue to create new subscription
        }
      } else {
        return {
          success: false,
          error:
            "You already have an active membership. Please cancel it first to subscribe to a new one.",
        };
      }
    }

    console.log("Creating subscription for membership:", membership.name);

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    // Check if existing customer ID is valid in Stripe
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        console.warn(
          `Stripe customer ${stripeCustomerId} not found, creating new customer`
        );
        stripeCustomerId = undefined; // Reset to create new customer

        // Clear invalid customer ID from database
        await User.findByIdAndUpdate(user._id, {
          $unset: { stripeCustomerId: "" },
        });
      }
    }

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

    // Final validation before subscription creation
    if (!stripeCustomerId) {
      throw new Error("No valid Stripe customer ID available");
    }

    try {
      // Create the subscription with incomplete payment behavior
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
      });

      // Note: UserMembership will be created by webhook when payment succeeds

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      
      if (!invoice) {
        // Retrieve subscription again to ensure we have the latest data
        const retrievedSub = await stripe.subscriptions.retrieve(
          subscription.id,
          { expand: ["latest_invoice.payment_intent"] }
        );
        
        const retrievedInvoice = retrievedSub.latest_invoice as Stripe.Invoice;
        if (!retrievedInvoice) {
          throw new Error("No invoice found for subscription after retrieval");
        }
        
        const retrievedPaymentIntent = (retrievedInvoice as any).payment_intent as Stripe.PaymentIntent;
        if (!retrievedPaymentIntent || !retrievedPaymentIntent.client_secret) {
          throw new Error("No payment intent or client secret found after retrieval");
        }
        
        return {
          success: true,
          clientSecret: retrievedPaymentIntent.client_secret,
          subscriptionId: subscription.id,
        };
      }

      const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent;

      if (!paymentIntent || !paymentIntent.client_secret) {
        // Create a payment intent manually for the invoice if it doesn't exist
        console.log("Creating manual payment intent for invoice", invoice.id);
        
        const manualPaymentIntent = await stripe.paymentIntents.create({
          amount: invoice.amount_due,
          currency: invoice.currency,
          customer: stripeCustomerId,
          metadata: {
            subscriptionId: subscription.id,
            membershipId: membership._id.toString(),
            userId: user._id.toString(),
            invoiceId: invoice.id,
          },
          description: `${membership.name} subscription`,
          automatic_payment_methods: { enabled: true },
        });
        
        console.log("✅ Manual payment intent created:", manualPaymentIntent.id);
        
        return {
          success: true,
          clientSecret: manualPaymentIntent.client_secret!,
          subscriptionId: subscription.id,
        };
      }

      console.log("✅ Subscription created successfully:", subscription.id);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      };
    } catch (subscriptionError) {
      throw subscriptionError;
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

    // First check if membership already exists and is active (webhook may have processed it)
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const existingMembership = await UserMembership.findOne({
      user: user._id,
      subscriptionId: subscriptionId,
    });

    if (existingMembership) {
      console.log("Found existing membership:", {
        id: existingMembership._id,
        status: existingMembership.status,
        subscriptionId: existingMembership.subscriptionId
      });

      if (existingMembership.status === "active") {
        return {
          success: true,
          userMembership: existingMembership,
        };
      }
    }

    // Handle real subscription
    const subscription = (await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice.payment_intent"],
    })) as Stripe.Subscription;

    // Check subscription status and payment intent
    const latestInvoice = subscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;

    // Check if payment was successful regardless of subscription status
    const paymentSuccessful = paymentIntent?.status === "succeeded" || 
                              paymentIntent?.status === "processing" ||
                              latestInvoice?.status === "paid";

    const isSubscriptionValid =
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      (subscription.status === "incomplete" && paymentSuccessful) ||
      paymentSuccessful; // Allow if payment was successful even if status is unexpected

    console.log("Subscription validation check:", {
      subscriptionStatus: subscription.status,
      paymentIntentStatus: paymentIntent?.status,
      invoiceStatus: latestInvoice?.status,
      paymentSuccessful,
      isSubscriptionValid,
      subscriptionId,
    });

    if (!isSubscriptionValid) {
      return {
        success: false,
        error: `Subscription is not active. Please complete payment.`,
      };
    }

    console.log("Subscription validation passed:", {
      subscriptionStatus: subscription.status,
      paymentIntentStatus: paymentIntent?.status,
      subscriptionId,
    });

    const membershipId = subscription.metadata.membershipId;
    if (!membershipId) {
      return { success: false, error: "Invalid subscription metadata" };
    }

    // Get membership details
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return { success: false, error: "Membership not found" };
    }

    // If we have an existing incomplete membership, activate it
    if (existingMembership && existingMembership.status === "incomplete") {
      const now = new Date();
      const currentPeriodStart = new Date(
        (subscription as any).current_period_start * 1000
      );
      const currentPeriodEnd = new Date(
        (subscription as any).current_period_end * 1000
      );

      await UserMembership.findByIdAndUpdate(existingMembership._id, {
        status: "active",
        currentPeriodStart,
        currentPeriodEnd,
        usageResetDate: currentPeriodEnd,
        nextBillingDate: currentPeriodEnd,
        lastPaymentDate: now,
        lastPaymentAmount: membership.price,
        autoRenewal: true,
      });

      console.log("✅ Activated existing incomplete membership");
      
      // Update membership stats
      await Membership.findByIdAndUpdate(membershipId, {
        $inc: {
          totalSubscribers: 1,
          totalRevenue: membership.price,
        },
      });

      return {
        success: true,
        userMembership: existingMembership,
      };
    }

    // Should not create new membership here as webhook handles this
    return {
      success: false,
      error: "Membership processing in progress. Please wait a moment and try again.",
    };

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
    console.log("Membership productAllocations:", membership.productAllocations);
    const productUsage = membership.productAllocations
      .filter((allocation: any) => allocation.categoryId || allocation.category)
      .map((allocation: any) => ({
        categoryId: allocation.categoryId?.toString() || allocation.category?.toString(),
        categoryName: allocation.categoryName || 'Unknown Category',
        allocatedQuantity: allocation.quantity || 0,
        usedQuantity: 0,
        availableQuantity: allocation.quantity || 0,
      }));
    console.log("Generated productUsage:", productUsage);
    
    if (productUsage.length === 0) {
      throw new Error("No valid product allocations found for membership");
    }

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
    console.log("Membership productAllocations:", membership.productAllocations);
    const productUsage = membership.productAllocations
      .filter((allocation: any) => allocation.categoryId || allocation.category)
      .map((allocation: any) => ({
        categoryId: allocation.categoryId?.toString() || allocation.category?.toString(),
        categoryName: allocation.categoryName || 'Unknown Category',
        allocatedQuantity: allocation.quantity || 0,
        usedQuantity: 0,
        availableQuantity: allocation.quantity || 0,
      }));
    console.log("Generated productUsage:", productUsage);
    
    if (productUsage.length === 0) {
      throw new Error("No valid product allocations found for membership");
    }

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
    const populatedUser = userMembership.user as any;
    if (
      populatedUser &&
      typeof populatedUser === "object" &&
      populatedUser !== null &&
      "clerkId" in populatedUser &&
      populatedUser.clerkId === userId
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
    await Membership.findByIdAndUpdate(userMembership.membership, {
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
        membership: typeof userMembership.membership === 'string' 
          ? userMembership.membership 
          : {
              ...(userMembership.membership as any),
              _id: (userMembership.membership as any)._id.toString(),
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
