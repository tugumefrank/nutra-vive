// lib/actions/membershipSubscriptionActions.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, Membership, UserMembership } from "@/lib/db/models";
import {
  syncStripeDataToDatabase,
  getOrCreateStripeCustomer,
  createMembershipCheckoutSession,
  handleCheckoutSuccess,
} from "@/lib/stripe/sync";
import { createUser } from "@/lib/actions/userServerActions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Create checkout session for membership subscription
 * Following t3dotgg guide: customer creation happens before checkout
 */
export async function createMembershipSubscriptionCheckout(
  membershipId: string
): Promise<{
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    // Get user details
    console.log("🔍 Looking for user with clerkId:", userId);
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Try to find user by email and update clerkId
      const clerkUser = await currentUser();
      if (clerkUser?.emailAddresses[0]?.emailAddress) {
        const userByEmail = await User.findOne({ 
          email: clerkUser.emailAddresses[0].emailAddress 
        });
        
        if (userByEmail) {
          console.log("🔄 Found user by email, updating clerkId:", {
            oldClerkId: userByEmail.clerkId,
            newClerkId: userId,
            email: userByEmail.email
          });
          
          // Update the clerkId
          await User.findByIdAndUpdate(userByEmail._id, { clerkId: userId });
          user = await User.findOne({ clerkId: userId });
        }
      }
      
      if (!user) {
        console.error("❌ User not found in database for clerkId:", userId);
        return { success: false, error: "User not found. Please try refreshing the page or contact support." };
      }
    }
    
    console.log("✅ Found user:", { id: user._id, email: user.email, clerkId: user.clerkId });

    // Check if user already has an active subscription
    const existingMembership = await UserMembership.findOne({
      user: user._id,
      status: { $in: ["active", "trialing"] },
    });

    if (existingMembership) {
      return {
        success: false,
        error: "You already have an active membership. Please cancel it first to subscribe to a new one.",
      };
    }

    // Get origin from headers for dynamic URL generation
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const origin = host ? `${protocol}://${host}` : undefined;

    // Create checkout session using centralized function
    const { sessionId, url } = await createMembershipCheckoutSession(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`,
      membershipId,
      origin
    );

    console.log(`✅ Created checkout session for user ${userId}`);

    return {
      success: true,
      checkoutUrl: url,
    };

  } catch (error) {
    console.error("❌ Error creating membership checkout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

/**
 * Handle successful checkout completion
 */
export async function completeMembershipCheckout(
  sessionId: string
): Promise<{
  success: boolean;
  membership?: any;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const result = await handleCheckoutSuccess(sessionId);
    
    if (result.success) {
      // Revalidate pages
      revalidatePath("/account/memberships");
      revalidatePath("/admin/memberships");
      
      console.log(`✅ Membership checkout completed for user ${userId}`);
    }

    return result;

  } catch (error) {
    console.error("❌ Error completing membership checkout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete checkout",
    };
  }
}

/**
 * Cancel membership subscription
 */
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
    if (populatedUser?.clerkId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (userMembership.subscriptionId) {
      // Cancel subscription in Stripe (at period end)
      await stripe.subscriptions.update(userMembership.subscriptionId, {
        cancel_at_period_end: true,
      });

      // Sync the updated subscription data
      const user = await User.findOne({ clerkId: userId });
      if (user?.stripeCustomerId) {
        await syncStripeDataToDatabase(user.stripeCustomerId);
      }
    } else {
      // For non-subscription memberships, cancel immediately
      await UserMembership.findByIdAndUpdate(userMembershipId, {
        status: "cancelled",
        autoRenewal: false,
      });
    }

    console.log(`✅ Membership cancelled for user ${userId}`);

    // Revalidate pages
    revalidatePath("/account/memberships");
    revalidatePath("/admin/memberships");

    return { success: true };

  } catch (error) {
    console.error("❌ Error cancelling membership subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel subscription",
    };
  }
}

/**
 * Get user's current membership with fresh Stripe data
 */
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
      console.error("User not found in database for clerkId:", userId);
      return { success: false, error: "User not found. Please try refreshing the page." };
    }

    // Sync latest data from Stripe if customer exists
    if (user.stripeCustomerId) {
      await syncStripeDataToDatabase(user.stripeCustomerId);
    }

    // Get current membership
    const userMembership = await UserMembership.findOne({
      user: user._id,
      status: { $in: ["active", "trialing"] },
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
      error: error instanceof Error ? error.message : "Failed to get membership",
    };
  }
}

/**
 * Sync user's Stripe data manually
 */
export async function syncUserStripeData(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user?.stripeCustomerId) {
      // It's okay to not have a Stripe customer if user hasn't subscribed yet
      return { success: true };
    }

    await syncStripeDataToDatabase(user.stripeCustomerId);

    // Revalidate pages
    revalidatePath("/account/memberships");
    
    return { success: true };

  } catch (error) {
    console.error("❌ Error syncing Stripe data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync data",
    };
  }
}

/**
 * Get user's billing portal URL
 */
export async function createBillingPortalSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user?.stripeCustomerId) {
      return { success: false, error: "No Stripe customer found" };
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/account/memberships`,
    });

    return {
      success: true,
      url: session.url,
    };

  } catch (error) {
    console.error("❌ Error creating billing portal session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create billing portal",
    };
  }
}