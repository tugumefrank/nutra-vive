// lib/stripe/sync.ts
"use server";

import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, Membership, UserMembership } from "@/lib/db/models";
import { 
  StripeCustomerData, 
  CheckoutSessionResult, 
  MembershipCheckoutData,
  mapStripeStatusToMembershipStatus,
  type MembershipStatus
} from "@/types/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});


/**
 * Central sync function that maintains single source of truth
 * between Stripe and our database
 */
export async function syncStripeDataToDatabase(
  customerId: string
): Promise<StripeCustomerData | null> {
  try {
    console.log(`🔄 Starting sync for Stripe customer: ${customerId}`);
    await connectToDatabase();

    // Fetch customer data from Stripe
    const [customer, subscriptions, paymentMethods] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        expand: ["data.default_payment_method"],
      }),
      stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      }),
    ]);

    if (customer.deleted) {
      console.warn(`Customer ${customerId} has been deleted`);
      return null;
    }

    // Find our user by Stripe customer ID
    console.log(`🔍 Looking for user with stripeCustomerId: ${customerId}`);
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn(`❌ No user found for Stripe customer ${customerId}`);
      
      // Let's see if we can find the user by Clerk metadata
      const customerData = customer as Stripe.Customer;
      if (customerData.metadata?.clerkId) {
        console.log(`🔍 Trying to find user by clerkId from customer metadata: ${customerData.metadata.clerkId}`);
        const userByClerkId = await User.findOne({ clerkId: customerData.metadata.clerkId });
        if (userByClerkId) {
          console.log(`✅ Found user by clerkId, updating stripeCustomerId`);
          await User.findByIdAndUpdate(userByClerkId._id, { stripeCustomerId: customerId });
          return await syncStripeDataToDatabase(customerId); // Retry the sync
        }
      }
      
      return null;
    }
    
    console.log(`✅ Found user:`, { id: user._id, email: user.email, clerkId: user.clerkId });

    // Process active subscription
    console.log(`📋 Found ${subscriptions.data.length} subscriptions for customer`);
    subscriptions.data.forEach((sub, index) => {
      console.log(`  Subscription ${index + 1}: ${sub.id} (status: ${sub.status})`);
    });
    
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
    
    console.log(`🎯 Active subscription:`, activeSubscription ? {
      id: activeSubscription.id,
      status: activeSubscription.status,
      priceId: activeSubscription.items.data[0]?.price.id
    } : 'None found');

    let subscriptionData: StripeCustomerData["subscription"] | undefined;
    
    if (activeSubscription) {
      const priceId = activeSubscription.items.data[0]?.price.id;
      
      // Find membership by price ID
      const membership = await Membership.findOne({ stripePriceId: priceId });
      
      // Type assertion for runtime properties
      const sub = activeSubscription as any;
      
      subscriptionData = {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
        priceId,
        membershipId: membership?._id.toString(),
      };

      // Sync user membership in database
      await syncUserMembership(user._id.toString(), activeSubscription, membership);
    } else {
      // No active subscription - mark existing memberships as cancelled
      await UserMembership.updateMany(
        { user: user._id, status: { $in: ["active", "trialing"] } },
        { status: "cancelled" }
      );
    }

    // Process payment method
    let paymentMethodData: StripeCustomerData["paymentMethod"] | undefined;
    
    if (paymentMethods.data.length > 0) {
      const pm = paymentMethods.data[0];
      paymentMethodData = {
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
      };
    }

    const customerData: StripeCustomerData = {
      customerId,
      subscription: subscriptionData,
      paymentMethod: paymentMethodData,
    };

    console.log(`✅ Synced Stripe data for customer ${customerId}`);
    return customerData;

  } catch (error) {
    console.error(`❌ Error syncing Stripe data for customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Sync user membership with Stripe subscription data
 */
async function syncUserMembership(
  userId: string,
  subscription: Stripe.Subscription,
  membership: any
) {
  try {
    const existingMembership = await UserMembership.findOne({
      user: userId,
      subscriptionId: subscription.id,
    });

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
    
    const membershipData = {
      user: userId,
      membership: membership?._id,
      subscriptionId: subscription.id,
      status: mapStripeStatusToMembershipStatus(subscription.status),
      startDate,
      currentPeriodStart,
      currentPeriodEnd,
      usageResetDate: currentPeriodEnd,
      nextBillingDate: subscription.cancel_at_period_end 
        ? null 
        : currentPeriodEnd,
      autoRenewal: !subscription.cancel_at_period_end,
      lastPaymentDate: new Date(),
      lastPaymentAmount: membership?.price || 0,
    };

    if (existingMembership) {
      // Update existing membership
      await UserMembership.findByIdAndUpdate(
        existingMembership._id,
        membershipData
      );
    } else if (membership && subscription.status === "active") {
      // Create new membership only if subscription is active
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

      await UserMembership.create({
        ...membershipData,
        productUsage,
      });

      // Update membership stats
      await Membership.findByIdAndUpdate(membership._id, {
        $inc: {
          totalSubscribers: 1,
          totalRevenue: membership.price || 0,
        },
      });
    }
  } catch (error) {
    console.error("Error syncing user membership:", error);
    throw error;
  }
}


/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<string> {
  try {
    await connectToDatabase();

    // Check if user already has a Stripe customer
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // Verify existing customer ID is still valid
    if (user.stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!existingCustomer.deleted) {
          return user.stripeCustomerId;
        }
      } catch (error) {
        console.warn(`Invalid Stripe customer ID ${user.stripeCustomerId}, creating new one`);
      }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        userId: user._id.toString(),
        clerkId: userId,
      },
    });

    // Update user with new customer ID
    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: customer.id,
    });

    console.log(`✅ Created Stripe customer ${customer.id} for user ${userId}`);
    return customer.id;

  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Create checkout session for membership subscription
 */
export async function createMembershipCheckoutSession(
  userId: string,
  userEmail: string,
  userName: string,
  membershipId: string,
  origin?: string
): Promise<CheckoutSessionResult> {
  try {
    await connectToDatabase();

    // Get membership details
    const membership = await Membership.findById(membershipId);
    if (!membership || !membership.isActive) {
      throw new Error("Membership not found or inactive");
    }

    // Ensure membership has a Stripe price
    if (!membership.stripePriceId) {
      throw new Error("Membership does not have a Stripe price configured");
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, userEmail, userName);

    // Create checkout session
    console.log("🚀 Creating checkout session with data:", {
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      membershipId,
      userId
    });
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"], // Only allow cards (excludes Cash App Pay as per t3dotgg guide)
      line_items: [
        {
          price: membership.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin || process.env.NEXTAUTH_URL || 'http://localhost:3001'}/account/memberships?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin || process.env.NEXTAUTH_URL || 'http://localhost:3001'}/account/memberships?cancelled=true`,
      metadata: {
        userId,
        membershipId: membershipId,
        membershipTier: membership.tier,
      },
      subscription_data: {
        metadata: {
          userId,
          membershipId: membershipId,
          membershipTier: membership.tier,
        },
      },
    });

    console.log(`✅ Created checkout session ${session.id} for membership ${membershipId}`);
    
    return {
      sessionId: session.id,
      url: session.url!,
    };

  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Handle successful checkout session
 */
export async function handleCheckoutSuccess(sessionId: string): Promise<{
  success: boolean;
  membership?: any;
  error?: string;
}> {
  try {
    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session.customer) {
      throw new Error("No customer found in checkout session");
    }

    // Sync the customer data to ensure everything is up to date
    const customerData = await syncStripeDataToDatabase(session.customer as string);
    
    if (!customerData?.subscription) {
      throw new Error("No active subscription found after checkout");
    }

    // Get user membership
    const user = await User.findOne({ stripeCustomerId: session.customer });
    if (!user) {
      throw new Error("User not found");
    }

    const userMembership = await UserMembership.findOne({
      user: user._id,
      subscriptionId: customerData.subscription.id,
    }).populate("membership");

    return {
      success: true,
      membership: userMembership,
    };

  } catch (error) {
    console.error("Error handling checkout success:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process checkout",
    };
  }
}