import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";
import { createMembershipSubscriptionCheckout } from "@/lib/actions/membershipSubscriptionActions";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership } from "@/lib/db/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Validation schema for subscription actions
const subscriptionActionSchema = z.object({
  action: z.enum(["cancel", "pause", "resume", "update_payment"]),
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  reason: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().default(true),
});

const createSubscriptionSchema = z.object({
  membershipId: z.string().min(1, "Membership ID is required"),
  paymentMethodId: z.string().optional(),
});

/**
 * Mobile API: Manage user subscriptions
 * POST /api/mobile/memberships/subscriptions
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/memberships/subscriptions called");
  
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Missing Authorization header" }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🔑 Token extracted, verifying...");

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    console.log("✅ Token verified, userId:", userId);

    if (!userId) {
      console.log("❌ No userId found in verified token");
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("📋 Subscription request:", { action: body.action, membershipId: body.membershipId });

    // Check if this is a new subscription creation
    if (body.membershipId && !body.action) {
      const validatedData = createSubscriptionSchema.parse(body);
      
      // Create checkout session for new subscription
      console.log("🆕 Creating new subscription checkout for membership:", validatedData.membershipId);
      const result = await createMembershipSubscriptionCheckout(validatedData.membershipId);
      
      if (!result.success) {
        console.log("❌ Failed to create subscription checkout:", result.error);
        return NextResponse.json(
          { error: result.error || "Failed to create subscription" },
          { status: 500 }
        );
      }

      console.log("✅ Subscription checkout created successfully");
      return NextResponse.json({
        success: true,
        checkoutUrl: result.checkoutUrl,
        message: "Subscription checkout session created",
      });
    }

    // Handle subscription management actions
    const validatedData = subscriptionActionSchema.parse(body);
    
    await connectToDatabase();

    // Find user and their membership
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userMembership = await UserMembership.findOne({
      user: user._id,
      subscriptionId: validatedData.subscriptionId,
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    console.log(`🔧 Processing ${validatedData.action} for subscription:`, validatedData.subscriptionId);

    let result;
    
    switch (validatedData.action) {
      case "cancel":
        // Cancel subscription in Stripe
        const subscription = await stripe.subscriptions.update(validatedData.subscriptionId, {
          cancel_at_period_end: validatedData.cancelAtPeriodEnd,
          metadata: {
            cancellation_reason: validatedData.reason || "user_requested",
            cancelled_via: "mobile_app",
            cancelled_by: userId,
          },
        });

        // Update local database
        userMembership.status = validatedData.cancelAtPeriodEnd ? "active" : "cancelled";
        if (validatedData.reason) {
          userMembership.notes = (userMembership.notes || "") + 
            `\nCancelled via mobile app: ${validatedData.reason} (${new Date().toISOString()})`;
        }
        await userMembership.save();

        result = {
          success: true,
          message: validatedData.cancelAtPeriodEnd 
            ? "Subscription will be cancelled at the end of the current period"
            : "Subscription cancelled immediately",
          subscription: {
            id: subscription.id,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: (subscription as any).current_period_end,
          },
        };
        break;

      case "pause":
        // Pause subscription (Stripe doesn't have native pause, so we cancel with resume ability)
        await stripe.subscriptions.update(validatedData.subscriptionId, {
          pause_collection: {
            behavior: "keep_as_draft",
          },
          metadata: {
            pause_reason: validatedData.reason || "user_requested",
            paused_via: "mobile_app",
            paused_by: userId,
          },
        });

        userMembership.status = "paused";
        if (validatedData.reason) {
          userMembership.notes = (userMembership.notes || "") + 
            `\nPaused via mobile app: ${validatedData.reason} (${new Date().toISOString()})`;
        }
        await userMembership.save();

        result = {
          success: true,
          message: "Subscription paused successfully",
        };
        break;

      case "resume":
        // Resume paused subscription
        await stripe.subscriptions.update(validatedData.subscriptionId, {
          pause_collection: undefined,
          metadata: {
            resumed_via: "mobile_app",
            resumed_by: userId,
          },
        });

        userMembership.status = "active";
        userMembership.notes = (userMembership.notes || "") + 
          `\nResumed via mobile app (${new Date().toISOString()})`;
        await userMembership.save();

        result = {
          success: true,
          message: "Subscription resumed successfully",
        };
        break;

      case "update_payment":
        // This would typically redirect to a customer portal
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId!,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/memberships`,
        });

        result = {
          success: true,
          message: "Payment update portal created",
          portalUrl: portalSession.url,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    console.log(`✅ ${validatedData.action} completed successfully`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Mobile subscriptions API error:", error);
    
    // Handle specific Clerk token errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Payment processing error",
          message: error.message,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process subscription request" },
      { status: 500 }
    );
  }
}

/**
 * Mobile API: Get available membership plans
 * GET /api/mobile/memberships/subscriptions
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/memberships/subscriptions called");
  
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Missing Authorization header" }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = verifiedToken.sub;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    // Import and use the existing function
    const { getAvailableMemberships } = await import("@/lib/actions/membershipServerActions");
    const result = await getAvailableMemberships();

    if (!result || !result.memberships) {
      return NextResponse.json(
        { error: "Failed to fetch membership plans" },
        { status: 500 }
      );
    }

    // Mobile-optimized membership plans
    const mobilePlans = result.memberships?.map((membership) => ({
      _id: membership._id,
      name: membership.name,
      description: membership.description,
      tier: membership.tier,
      price: membership.price,
      billingFrequency: membership.billingFrequency,
      currency: membership.currency,
      deliveryFrequency: membership.deliveryFrequency,
      freeDelivery: membership.freeDelivery,
      prioritySupport: membership.prioritySupport,
      maxProductsPerMonth: membership.maxProductsPerMonth,
      features: membership.features,
      productAllocations: membership.productAllocations,
      customBenefits: membership.customBenefits,
      color: membership.color,
      icon: membership.icon,
      isPopular: membership.isPopular,
      stripePriceId: membership.stripePriceId,
      
      // Calculate value metrics for mobile display
      valueMetrics: {
        totalProductValue: membership.productAllocations?.reduce((sum: number, alloc: any) => 
          sum + (alloc.quantity * 25), 0) || 0, // Assume $25 average product value
        monthlySavings: membership.price < 100 ? 50 : 100, // Example savings calculation
        deliverySavings: membership.freeDelivery ? 15 : 0, // $15 per delivery
      },
    })) || [];

    console.log("✅ Membership plans fetched:", mobilePlans.length);

    return NextResponse.json({
      success: true,
      plans: mobilePlans,
      summary: {
        totalPlans: mobilePlans.length,
        tiers: Array.from(new Set(mobilePlans.map(p => p.tier))),
        priceRange: {
          min: Math.min(...mobilePlans.map(p => p.price)),
          max: Math.max(...mobilePlans.map(p => p.price)),
        },
      },
    });

  } catch (error) {
    console.error("❌ Mobile membership plans API error:", error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch membership plans" },
      { status: 500 }
    );
  }
}