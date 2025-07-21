import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User, UserMembership, Order } from "@/lib/db/models";

// Validation schema for usage tracking
const usageTrackingSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    categoryId: z.string(),
    categoryName: z.string(),
    quantity: z.number().min(1),
  })),
});

// Validation schema for usage queries
const usageQuerySchema = z.object({
  period: z.enum(["current", "all"]).default("current"),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Mobile API: Track product usage against membership
 * POST /api/mobile/memberships/usage
 */
export async function POST(request: NextRequest) {
  console.log("🔵 Mobile API: POST /api/mobile/memberships/usage called");
  
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

    // Parse and validate request body
    const body = await request.json();
    console.log("📋 Usage tracking request:", {
      orderNumber: body.orderNumber,
      itemCount: body.items?.length,
    });

    const validatedData = usageTrackingSchema.parse(body);

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find user's active membership
    const activeMembership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership");

    if (!activeMembership) {
      return NextResponse.json(
        { error: "No active membership found" },
        { status: 404 }
      );
    }

    console.log("👤 Active membership found:", activeMembership.membership.name);

    // Verify the order exists and belongs to the user
    const order = await Order.findOne({
      orderNumber: validatedData.orderNumber,
      $or: [
        { user: user._id },
        { email: user.email }
      ]
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not authorized" },
        { status: 404 }
      );
    }

    // Track usage for each item
    const usageUpdates = [];
    for (const item of validatedData.items) {
      // Find the matching product allocation in the membership
      const productUsageIndex = activeMembership.productUsage.findIndex(
        (usage: any) => usage.categoryId === item.categoryId
      );

      if (productUsageIndex >= 0) {
        const currentUsage = activeMembership.productUsage[productUsageIndex];
        
        // Update usage
        activeMembership.productUsage[productUsageIndex].usedQuantity += item.quantity;
        activeMembership.productUsage[productUsageIndex].availableQuantity = 
          Math.max(0, currentUsage.allocatedQuantity - activeMembership.productUsage[productUsageIndex].usedQuantity);
        activeMembership.productUsage[productUsageIndex].lastUsed = new Date();

        usageUpdates.push({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          productName: item.productName,
          quantityUsed: item.quantity,
          previousUsed: currentUsage.usedQuantity,
          newUsed: activeMembership.productUsage[productUsageIndex].usedQuantity,
          remainingAllocation: activeMembership.productUsage[productUsageIndex].availableQuantity,
        });

        console.log(`📊 Updated usage for ${item.categoryName}: +${item.quantity} (total: ${activeMembership.productUsage[productUsageIndex].usedQuantity})`);
      } else {
        console.log(`⚠️ No allocation found for category: ${item.categoryName}`);
      }
    }

    // Save the updated membership
    await activeMembership.save();

    // Calculate overall usage statistics
    const overallStats = {
      totalCategories: activeMembership.productUsage.length,
      categoriesWithUsage: activeMembership.productUsage.filter((u: any) => u.usedQuantity > 0).length,
      totalAllocated: activeMembership.productUsage.reduce((sum: number, u: any) => sum + u.allocatedQuantity, 0),
      totalUsed: activeMembership.productUsage.reduce((sum: number, u: any) => sum + u.usedQuantity, 0),
      totalRemaining: activeMembership.productUsage.reduce((sum: number, u: any) => sum + u.availableQuantity, 0),
    };

    overallStats.usagePercentage = overallStats.totalAllocated > 0 
      ? Math.round((overallStats.totalUsed / overallStats.totalAllocated) * 100)
      : 0;

    console.log("✅ Usage tracking completed successfully");

    return NextResponse.json({
      success: true,
      message: "Product usage tracked successfully",
      orderNumber: validatedData.orderNumber,
      usageUpdates,
      membershipStats: overallStats,
      currentPeriod: {
        start: activeMembership.currentPeriodStart,
        end: activeMembership.currentPeriodEnd,
        resetDate: activeMembership.usageResetDate,
      },
    });

  } catch (error) {
    console.error("❌ Mobile usage tracking API error:", error);
    
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
    
    return NextResponse.json(
      { error: "Failed to track product usage" },
      { status: 500 }
    );
  }
}

/**
 * Mobile API: Get membership usage analytics
 * GET /api/mobile/memberships/usage
 */
export async function GET(request: NextRequest) {
  console.log("🔵 Mobile API: GET /api/mobile/memberships/usage called");
  
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    const validatedParams = usageQuerySchema.parse(queryParams);

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find user's memberships
    let membershipQuery: any = { user: user._id };
    
    if (validatedParams.period === "current") {
      membershipQuery.status = "active";
    }

    const memberships = await UserMembership.find(membershipQuery)
      .populate("membership", "name tier productAllocations")
      .sort({ createdAt: -1 });

    if (memberships.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No memberships found",
        usage: [],
      });
    }

    // Get usage analytics for each membership
    const usageAnalytics = memberships.map((membership) => {
      const productUsage = membership.productUsage || [];
      
      // Filter by category if specified
      const filteredUsage = validatedParams.categoryId
        ? productUsage.filter((usage: any) => usage.categoryId === validatedParams.categoryId)
        : productUsage;

      // Calculate detailed analytics
      const analytics = {
        membershipId: membership._id,
        membershipName: membership.membership.name,
        membershipTier: membership.membership.tier,
        status: membership.status,
        currentPeriod: {
          start: membership.currentPeriodStart,
          end: membership.currentPeriodEnd,
          resetDate: membership.usageResetDate,
          daysRemaining: membership.currentPeriodEnd 
            ? Math.ceil((new Date(membership.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null,
        },
        
        categoryUsage: filteredUsage.map((usage: any) => ({
          categoryId: usage.categoryId,
          categoryName: usage.categoryName,
          allocated: usage.allocatedQuantity,
          used: usage.usedQuantity,
          available: usage.availableQuantity,
          usagePercentage: usage.allocatedQuantity > 0 
            ? Math.round((usage.usedQuantity / usage.allocatedQuantity) * 100)
            : 0,
          lastUsed: usage.lastUsed,
          status: usage.usedQuantity >= usage.allocatedQuantity ? "exhausted" : 
                  usage.usedQuantity > usage.allocatedQuantity * 0.8 ? "high" :
                  usage.usedQuantity > usage.allocatedQuantity * 0.5 ? "medium" : "low",
        })),

        overallStats: {
          totalCategories: filteredUsage.length,
          categoriesWithUsage: filteredUsage.filter((u: any) => u.usedQuantity > 0).length,
          totalAllocated: filteredUsage.reduce((sum: number, u: any) => sum + u.allocatedQuantity, 0),
          totalUsed: filteredUsage.reduce((sum: number, u: any) => sum + u.usedQuantity, 0),
          totalRemaining: filteredUsage.reduce((sum: number, u: any) => sum + u.availableQuantity, 0),
          averageUsagePercentage: filteredUsage.length > 0 
            ? Math.round(filteredUsage.reduce((sum: number, u: any) => 
                sum + (u.allocatedQuantity > 0 ? (u.usedQuantity / u.allocatedQuantity) : 0), 0) / filteredUsage.length * 100)
            : 0,
        },

        trends: {
          highUsageCategories: filteredUsage.filter((u: any) => 
            u.allocatedQuantity > 0 && (u.usedQuantity / u.allocatedQuantity) > 0.8
          ).map((u: any) => u.categoryName),
          unutilizedCategories: filteredUsage.filter((u: any) => u.usedQuantity === 0)
            .map((u: any) => u.categoryName),
          mostUsedCategory: filteredUsage.length > 0 
            ? filteredUsage.reduce((max: any, u: any) => u.usedQuantity > max.usedQuantity ? u : max)?.categoryName
            : null,
        },
      };

      return analytics;
    });

    console.log("✅ Usage analytics fetched for", usageAnalytics.length, "memberships");

    return NextResponse.json({
      success: true,
      usage: usageAnalytics,
      summary: {
        totalMemberships: usageAnalytics.length,
        activeMemberships: usageAnalytics.filter(u => u.status === "active").length,
        totalCategoriesTracked: usageAnalytics.reduce((sum, u) => sum + u.overallStats.totalCategories, 0),
        overallUsagePercentage: usageAnalytics.length > 0 
          ? Math.round(usageAnalytics.reduce((sum, u) => sum + u.overallStats.averageUsagePercentage, 0) / usageAnalytics.length)
          : 0,
      },
      filters: validatedParams,
    });

  } catch (error) {
    console.error("❌ Mobile usage analytics API error:", error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
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
      { error: "Failed to fetch usage analytics" },
      { status: 500 }
    );
  }
}