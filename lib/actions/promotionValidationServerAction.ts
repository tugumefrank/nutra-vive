"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../db";
import {
  Promotion,
  CustomerPromotionUsage,
  Cart,
  Product,
  User,
  IPromotion,
} from "../db/models";
import mongoose from "mongoose";

export interface PromotionValidationResult {
  isValid: boolean;
  promotion?: IPromotion;
  discountAmount?: number;
  error?: string;
  applicableItems?: string[]; // Product IDs that the promotion applies to
}

export interface CartWithPromotion {
  items: any[];
  subtotal: number;
  promotionDiscount: number;
  promotionCode?: string;
  promotionName?: string;
  finalTotal: number;
}

// Validate promotion code for current cart
export async function validatePromotionCode(
  code: string
): Promise<PromotionValidationResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isValid: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Find promotion by code
    const promotion = await Promotion.findOne({
      "codes.code": code.toUpperCase(),
      isActive: true,
    }).populate([
      { path: "targetCategories", select: "_id name" },
      { path: "targetProducts", select: "_id name" },
      { path: "excludedCategories", select: "_id name" },
      { path: "excludedProducts", select: "_id name" },
    ]);

    if (!promotion) {
      return {
        isValid: false,
        error: "Invalid promotion code",
      };
    }

    // Check if code exists and is active
    const codeObj = promotion.codes.find((c) => c.code === code.toUpperCase());
    if (!codeObj || !codeObj.isActive) {
      return {
        isValid: false,
        error: "Promotion code is not active",
      };
    }

    // Check timing
    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      return {
        isValid: false,
        error: "Promotion has not started yet",
      };
    }

    if (promotion.endsAt && promotion.endsAt < now) {
      return {
        isValid: false,
        error: "Promotion has expired",
      };
    }

    // Check global usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return {
        isValid: false,
        error: "Promotion usage limit exceeded",
      };
    }

    // Check code-specific usage limit
    if (codeObj.usageLimit && codeObj.usedCount >= codeObj.usageLimit) {
      return {
        isValid: false,
        error: "Promotion code usage limit exceeded",
      };
    }

    // Check customer eligibility and usage limits
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      // Check customer segment eligibility
      if (promotion.customerSegments !== "all") {
        const isEligible = await checkCustomerSegmentEligibility(
          new mongoose.Types.ObjectId(user._id),
          promotion.customerSegments
        );
        if (!isEligible) {
          return {
            isValid: false,
            error: "You are not eligible for this promotion",
          };
        }
      }

      // Check customer-specific assignment
      if (promotion.assignedCustomers.length > 0) {
        const assignment = promotion.assignedCustomers.find(
          (customer) => customer.userId === userId && customer.isActive
        );
        if (!assignment) {
          return {
            isValid: false,
            error: "This promotion is not available to you",
          };
        }

        // Check temporary assignment expiry
        if (
          assignment.type === "temporary" &&
          assignment.expiresAt &&
          assignment.expiresAt < now
        ) {
          return {
            isValid: false,
            error: "Your access to this promotion has expired",
          };
        }
      }

      // Check per-customer usage limit
      if (promotion.usageLimitPerCustomer) {
        const customerUsage = await CustomerPromotionUsage.countDocuments({
          user: user._id,
          promotion: promotion._id,
        });
        if (customerUsage >= promotion.usageLimitPerCustomer) {
          return {
            isValid: false,
            error: "You have reached the usage limit for this promotion",
          };
        }
      }
    }

    // Get cart and validate against cart contents
    const cart = await Cart.findOne({ clerkUserId: userId }).populate({
      path: "items.product",
      select: "name price category compareAtPrice",
      populate: {
        path: "category",
        select: "_id name",
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        isValid: false,
        error: "Your cart is empty",
      };
    }

    // Calculate cart totals
    const cartSubtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    // Check minimum purchase requirements
    if (
      promotion.minimumPurchaseAmount &&
      cartSubtotal < promotion.minimumPurchaseAmount
    ) {
      return {
        isValid: false,
        error: `Minimum purchase amount of $${promotion.minimumPurchaseAmount} required`,
      };
    }

    if (promotion.minimumQuantity) {
      const totalQuantity = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      if (totalQuantity < promotion.minimumQuantity) {
        return {
          isValid: false,
          error: `Minimum ${promotion.minimumQuantity} items required`,
        };
      }
    }

    // Calculate discount and applicable items
    const discountCalculation = calculatePromotionDiscount(
      promotion,
      cart.items
    );

    if (discountCalculation.discountAmount === 0) {
      return {
        isValid: false,
        error: "This promotion does not apply to any items in your cart",
      };
    }

    return {
      isValid: true,
      promotion: promotion.toObject(),
      discountAmount: discountCalculation.discountAmount,
      applicableItems: discountCalculation.applicableItems,
    };
  } catch (error) {
    console.error("❌ Error validating promotion code:", error);
    return {
      isValid: false,
      error: "Failed to validate promotion code",
    };
  }
}

// Apply promotion to cart
export async function applyPromotionToCart(code: string): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Validate promotion first
    const validation = await validatePromotionCode(code);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    await connectToDatabase();

    // Update cart with promotion
    const cart = await Cart.findOneAndUpdate(
      { clerkUserId: userId },
      {
        promotionCode: code.toUpperCase(),
        promotionDiscount: validation.discountAmount,
        promotionName: validation.promotion?.name,
      },
      { new: true }
    ).populate({
      path: "items.product",
      select: "name slug price images category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    if (!cart) {
      return {
        success: false,
        error: "Cart not found",
      };
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    const cartWithPromotion: CartWithPromotion = {
      items: cart.items,
      subtotal,
      promotionDiscount: validation.discountAmount || 0,
      promotionCode: code.toUpperCase(),
      promotionName: validation.promotion?.name,
      finalTotal: Math.max(0, subtotal - (validation.discountAmount || 0)),
    };

    console.log(
      `✅ Applied promotion ${code} with discount $${validation.discountAmount}`
    );

    return {
      success: true,
      cart: cartWithPromotion,
    };
  } catch (error) {
    console.error("❌ Error applying promotion to cart:", error);
    return {
      success: false,
      error: "Failed to apply promotion",
    };
  }
}

// Remove promotion from cart
export async function removePromotionFromCart(): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    const cart = await Cart.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $unset: {
          promotionCode: 1,
          promotionDiscount: 1,
          promotionName: 1,
        },
      },
      { new: true }
    ).populate({
      path: "items.product",
      select: "name slug price images category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    if (!cart) {
      return {
        success: false,
        error: "Cart not found",
      };
    }

    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    const cartWithoutPromotion: CartWithPromotion = {
      items: cart.items,
      subtotal,
      promotionDiscount: 0,
      finalTotal: subtotal,
    };

    console.log("✅ Removed promotion from cart");

    return {
      success: true,
      cart: cartWithoutPromotion,
    };
  } catch (error) {
    console.error("❌ Error removing promotion from cart:", error);
    return {
      success: false,
      error: "Failed to remove promotion",
    };
  }
}

// Get available promotions for user
export async function getAvailablePromotions(): Promise<{
  success: boolean;
  promotions?: any[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    await connectToDatabase();

    const now = new Date();
    const query: any = {
      isActive: true,
      $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }],
      $and: [
        {
          $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }],
        },
      ],
    };

    // If user is authenticated, get personalized promotions
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        query.$or.push({
          "assignedCustomers.userId": userId,
          "assignedCustomers.isActive": true,
        });
      }
    }

    const promotions = await Promotion.find(query)
      .select(
        "name description type discountType discountValue codes applicabilityScope"
      )
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      promotions: promotions.map((promotion) => ({
        ...promotion,
        _id: promotion._id.toString(),
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching available promotions:", error);
    return {
      success: false,
      error: "Failed to fetch promotions",
    };
  }
}

// Record promotion usage (call this after successful order)
export async function recordPromotionUsage(
  promotionCode: string,
  orderId: string,
  discountAmount: number,
  orderTotal: number
): Promise<{ success: boolean; error?: string }> {
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

    const promotion = await Promotion.findOne({
      "codes.code": promotionCode.toUpperCase(),
    });

    if (!promotion) {
      return { success: false, error: "Promotion not found" };
    }

    // Record usage
    const usage = new CustomerPromotionUsage({
      user: user._id,
      promotion: promotion._id,
      code: promotionCode.toUpperCase(),
      order: orderId,
      discountAmount,
      metadata: {
        originalTotal: orderTotal + discountAmount,
        finalTotal: orderTotal,
      },
    });

    await usage.save();

    // Update promotion counters
    await Promotion.findByIdAndUpdate(promotion._id, {
      $inc: {
        usedCount: 1,
        totalRedemptions: 1,
        totalRevenue: discountAmount,
      },
    });

    // Update specific code counter
    await Promotion.findOneAndUpdate(
      {
        _id: promotion._id,
        "codes.code": promotionCode.toUpperCase(),
      },
      {
        $inc: { "codes.$.usedCount": 1 },
      }
    );

    console.log(`✅ Recorded promotion usage: ${promotionCode}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error recording promotion usage:", error);
    return { success: false, error: "Failed to record promotion usage" };
  }
}

// Helper functions
async function checkCustomerSegmentEligibility(
  userId: mongoose.Types.ObjectId,
  segment: string
): Promise<boolean> {
  // This is a simplified implementation
  // You can expand this based on your business logic
  switch (segment) {
    case "new_customers":
      // Check if user has no previous orders
      const orderCount = await mongoose
        .model("Order")
        .countDocuments({ user: userId });
      return orderCount === 0;

    case "returning_customers":
      // Check if user has at least one previous order
      const hasOrders = await mongoose
        .model("Order")
        .countDocuments({ user: userId });
      return hasOrders > 0;

    case "vip_customers":
      // Check if user has spent over $500 (example criteria)
      const totalSpent = await mongoose
        .model("Order")
        .aggregate([
          { $match: { user: userId, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
      return (totalSpent[0]?.total || 0) > 500;

    default:
      return true;
  }
}

function calculatePromotionDiscount(
  promotion: IPromotion,
  cartItems: any[]
): { discountAmount: number; applicableItems: string[] } {
  let discountAmount = 0;
  const applicableItems: string[] = [];

  // Filter applicable items based on promotion scope
  const eligibleItems = cartItems.filter((item) => {
    const product = item.product;

    // Check if product is excluded
    if (
      promotion.excludedProducts.some(
        (id) => id.toString() === product._id.toString()
      )
    ) {
      return false;
    }

    if (
      promotion.excludedCategories.some(
        (id) => id.toString() === product.category?._id.toString()
      )
    ) {
      return false;
    }

    // Check if product is discounted and should be excluded
    if (
      promotion.excludeDiscountedItems &&
      product.compareAtPrice &&
      product.compareAtPrice > product.price
    ) {
      return false;
    }

    // Check promotion scope
    switch (promotion.applicabilityScope) {
      case "entire_store":
        return true;

      case "categories":
        return promotion.targetCategories.some(
          (id) => id.toString() === product.category?._id.toString()
        );

      case "products":
        return promotion.targetProducts.some(
          (id) => id.toString() === product._id.toString()
        );

      default:
        return false;
    }
  });

  if (eligibleItems.length === 0) {
    return { discountAmount: 0, applicableItems: [] };
  }

  // Calculate discount based on type
  switch (promotion.discountType) {
    case "percentage":
      const eligibleSubtotal = eligibleItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      discountAmount = (eligibleSubtotal * promotion.discountValue) / 100;
      applicableItems.push(
        ...eligibleItems.map((item) => item.product._id.toString())
      );
      break;

    case "fixed_amount":
      discountAmount = promotion.discountValue;
      applicableItems.push(
        ...eligibleItems.map((item) => item.product._id.toString())
      );
      break;

    case "buy_x_get_y":
      if (promotion.buyXGetYConfig) {
        const { buyQuantity, getQuantity, getDiscountPercentage } =
          promotion.buyXGetYConfig;

        // Sort eligible items by price (cheapest first for discount)
        const sortedItems = [...eligibleItems].sort(
          (a, b) => a.price - b.price
        );

        const totalEligibleQty = eligibleItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const setsEligible = Math.floor(totalEligibleQty / buyQuantity);
        const discountableQty = Math.min(
          setsEligible * getQuantity,
          totalEligibleQty
        );

        // Apply discount to cheapest items
        let remainingDiscountQty = discountableQty;
        for (const item of sortedItems) {
          if (remainingDiscountQty <= 0) break;

          const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
          discountAmount +=
            (item.price * qtyToDiscount * getDiscountPercentage) / 100;
          applicableItems.push(item.product._id.toString());
          remainingDiscountQty -= qtyToDiscount;
        }
      }
      break;
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    applicableItems,
  };
}
