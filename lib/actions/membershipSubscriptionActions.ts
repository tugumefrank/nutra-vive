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
    console.log("🔍 completeMembershipCheckout: Starting for userId:", userId, "sessionId:", sessionId);
    
    if (!userId) {
      console.log("❌ completeMembershipCheckout: No userId found");
      return { success: false, error: "Authentication required" };
    }

    console.log("🔄 completeMembershipCheckout: Calling handleCheckoutSuccess");
    const result = await handleCheckoutSuccess(sessionId);
    console.log("🔍 completeMembershipCheckout: handleCheckoutSuccess result:", {
      success: result.success,
      error: result.error,
      hasMembership: !!result.membership
    });
    
    if (result.success) {
      // Revalidate pages
      revalidatePath("/account/memberships");
      revalidatePath("/admin/memberships");
      
      console.log(`✅ completeMembershipCheckout: Membership checkout completed for user ${userId}`);
    } else {
      console.log(`❌ completeMembershipCheckout: Failed for user ${userId}:`, result.error);
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
// Simple in-memory cache for getCurrentMembership
const membershipCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

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

    // Check cache first
    const cacheKey = `membership_${userId}`;
    const cached = membershipCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("🚀 Returning cached membership data");
      return cached.data;
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();
    
    if (!user) {
      return { success: false, error: "User not found. Please try refreshing the page." };
    }

    // Get current membership (skip Stripe sync for performance)
    const userMembership = await UserMembership.findOne({
      user: user._id,
      status: { $in: ["active", "trialing"] },
    })
      .populate("membership")
      .lean();

    if (!userMembership) {
      return { success: true, membership: null };
    }

    const result = {
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
              createdBy: (userMembership.membership as any).createdBy ? (userMembership.membership as any).createdBy.toString() : null,
              updatedBy: (userMembership.membership as any).updatedBy ? (userMembership.membership as any).updatedBy.toString() : null,
              productAllocations: (userMembership.membership as any).productAllocations?.map((allocation: any) => ({
                ...allocation,
                _id: allocation._id ? allocation._id.toString() : null,
                categoryId: allocation.categoryId ? allocation.categoryId.toString() : null,
                allowedProducts: allocation.allowedProducts?.map((productId: any) => productId.toString()) || [],
              })) || [],
              customBenefits: (userMembership.membership as any).customBenefits?.map((benefit: any) => ({
                ...benefit,
                _id: benefit._id ? benefit._id.toString() : null,
              })) || [],
              createdAt: (userMembership.membership as any).createdAt ? (userMembership.membership as any).createdAt.toISOString() : null,
              updatedAt: (userMembership.membership as any).updatedAt ? (userMembership.membership as any).updatedAt.toISOString() : null,
            },
        productUsage: userMembership.productUsage?.map((usage: any) => ({
          ...usage,
          _id: usage._id ? usage._id.toString() : null,
          categoryId: usage.categoryId ? usage.categoryId.toString() : null,
        })) || [],
        createdAt: userMembership.createdAt ? userMembership.createdAt.toISOString() : null,
        updatedAt: userMembership.updatedAt ? userMembership.updatedAt.toISOString() : null,
        currentPeriodStart: userMembership.currentPeriodStart ? userMembership.currentPeriodStart.toISOString() : null,
        currentPeriodEnd: userMembership.currentPeriodEnd ? userMembership.currentPeriodEnd.toISOString() : null,
        nextBillingDate: userMembership.nextBillingDate ? userMembership.nextBillingDate.toISOString() : null,
        startDate: userMembership.startDate ? userMembership.startDate.toISOString() : null,
        endDate: userMembership.endDate ? userMembership.endDate.toISOString() : null,
      },
    };

    // Cache the result
    membershipCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;

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