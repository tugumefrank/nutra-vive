import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";
import { getCurrentUserMemberships } from "@/lib/actions/membershipServerActions";

// Validation schema for query parameters
const querySchema = z.object({
  status: z.enum(["active", "cancelled", "expired", "paused", "trial", "incomplete"]).optional(),
  includeExpired: z.coerce.boolean().default(false),
  includeHistory: z.coerce.boolean().default(false),
});

/**
 * Mobile API: Get user's memberships
 * GET /api/mobile/memberships
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/memberships called");
  
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    console.log("📋 Query parameters:", queryParams);

    const validatedParams = querySchema.parse(queryParams);
    console.log("✅ Validated parameters:", validatedParams);

    // Get user memberships using existing server action with userId
    console.log("📞 Calling getCurrentUserMemberships with userId:", userId);
    const result = await getCurrentUserMemberships(userId);

    if (!result.success) {
      console.log("❌ Failed to get user memberships:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to fetch memberships" },
        { status: 500 }
      );
    }

    console.log("📊 Memberships fetched:", result.userMemberships?.length || 0);

    // Filter memberships based on query parameters
    let filteredMemberships = result.userMemberships || [];

    if (validatedParams.status) {
      filteredMemberships = filteredMemberships.filter(
        (membership) => membership.status === validatedParams.status
      );
    }

    if (!validatedParams.includeExpired) {
      filteredMemberships = filteredMemberships.filter(
        (membership) => membership.status !== "expired"
      );
    }

    // Mobile-optimized response structure
    const mobileMemberships = filteredMemberships.map((membership) => ({
      _id: membership._id,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      nextBillingDate: membership.nextBillingDate,
      currentPeriodStart: membership.currentPeriodStart,
      currentPeriodEnd: membership.currentPeriodEnd,
      usageResetDate: membership.usageResetDate,
      autoRenewal: membership.autoRenewal,
      lastPaymentDate: membership.lastPaymentDate,
      lastPaymentAmount: membership.lastPaymentAmount,
      subscriptionId: membership.subscriptionId,
      
      // Membership details
      membership: {
        _id: membership.membership._id,
        name: membership.membership.name,
        description: membership.membership.description,
        tier: membership.membership.tier,
        price: membership.membership.price,
        billingFrequency: membership.membership.billingFrequency,
        currency: membership.membership.currency,
        deliveryFrequency: membership.membership.deliveryFrequency,
        freeDelivery: membership.membership.freeDelivery,
        prioritySupport: membership.membership.prioritySupport,
        maxProductsPerMonth: membership.membership.maxProductsPerMonth,
        features: membership.membership.features,
        color: membership.membership.color,
        icon: membership.membership.icon,
        isPopular: membership.membership.isPopular,
      },

      // Product usage tracking
      productUsage: membership.productUsage?.map((usage: any) => ({
        categoryId: usage.categoryId,
        categoryName: usage.categoryName,
        allocatedQuantity: usage.allocatedQuantity,
        usedQuantity: usage.usedQuantity,
        availableQuantity: usage.availableQuantity,
        lastUsed: usage.lastUsed,
        usagePercentage: usage.allocatedQuantity > 0 
          ? Math.round((usage.usedQuantity / usage.allocatedQuantity) * 100)
          : 0,
      })) || [],

      // Custom benefits used
      customBenefitsUsed: membership.customBenefitsUsed || [],

      // Calculate overall usage stats
      usageStats: {
        totalCategories: membership.productUsage?.length || 0,
        categoriesWithUsage: membership.productUsage?.filter((u: any) => u.usedQuantity > 0).length || 0,
        totalAllocated: membership.productUsage?.reduce((sum: number, u: any) => sum + u.allocatedQuantity, 0) || 0,
        totalUsed: membership.productUsage?.reduce((sum: number, u: any) => sum + u.usedQuantity, 0) || 0,
        overallUsagePercentage: (() => {
          const totalAllocated = membership.productUsage?.reduce((sum: number, u: any) => sum + u.allocatedQuantity, 0) || 0;
          const totalUsed = membership.productUsage?.reduce((sum: number, u: any) => sum + u.usedQuantity, 0) || 0;
          return totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;
        })(),
      },

      // Include history if requested
      ...(validatedParams.includeHistory && {
        previousMemberships: membership.previousMemberships || [],
      }),

      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));

    const response = {
      success: true,
      memberships: mobileMemberships,
      summary: {
        totalMemberships: mobileMemberships.length,
        activeMemberships: mobileMemberships.filter(m => m.status === "active").length,
        trialMemberships: mobileMemberships.filter(m => m.status === "trial").length,
        expiredMemberships: filteredMemberships.filter(m => m.status === "expired").length,
        nextBilling: mobileMemberships
          .filter(m => m.status === "active" && m.nextBillingDate)
          .sort((a, b) => new Date(a.nextBillingDate!).getTime() - new Date(b.nextBillingDate!).getTime())[0]?.nextBillingDate,
      },
      filters: {
        status: validatedParams.status,
        includeExpired: validatedParams.includeExpired,
        includeHistory: validatedParams.includeHistory,
      },
    };
    
    console.log("✅ Mobile API: Memberships response sent successfully");
    console.log("📤 Response summary:", {
      membershipsCount: mobileMemberships.length,
      activeMemberships: response.summary.activeMemberships,
      totalCategories: mobileMemberships.reduce((sum, m) => sum + m.usageStats.totalCategories, 0),
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Mobile memberships API error:", error);
    
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
          error: "Invalid query parameters",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}