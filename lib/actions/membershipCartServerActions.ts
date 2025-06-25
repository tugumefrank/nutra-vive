// lib/actions/membershipCartServerActions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import { Cart, Product, UserMembership, User } from "../db/models";

interface MembershipCartItem {
  productId: string;
  categoryId: string;
  quantity: number;
  isFree: boolean;
  membershipPrice: number;
  regularPrice: number;
  savings: number;
}

export async function addToMembershipCart(
  productId: string,
  quantity: number = 1
): Promise<{
  success: boolean;
  cart?: any;
  membershipInfo?: {
    isFree: boolean;
    savings: number;
    categoryUsage?: any;
  };
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    // Get user and their active membership
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const membership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership");

    // Get product details
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return { success: false, error: "Product not found or unavailable" };
    }

    // Get or create cart
    let cart = await Cart.findOne({ clerkUserId: userId });
    if (!cart) {
      cart = new Cart({
        clerkUserId: userId,
        items: [],
        promotionDiscount: 0,
      });
    }

    let isFree = false;
    let savings = 0;
    let categoryUsage = null;

    // Check if user has membership and can get this product for free
    if (membership && product.category) {
      categoryUsage = membership.productUsage.find(
        (usage: any) =>
          usage.categoryId.toString() ===
          (product.category ? product.category.toString() : "")
      );

      if (categoryUsage && categoryUsage.availableQuantity >= quantity) {
        isFree = true;
        savings = product.price * quantity;
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = isFree ? 0 : product.price;
      cart.items[existingItemIndex].originalPrice = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: new (require("mongoose").Types.ObjectId)(productId),
        quantity,
        price: isFree ? 0 : product.price,
        originalPrice: product.price,
      });
    }

    // Update membership usage if product is free
    if (isFree && membership && categoryUsage) {
      await UserMembership.findByIdAndUpdate(
        membership._id,
        {
          $set: {
            "productUsage.$[elem].usedQuantity":
              categoryUsage.usedQuantity + quantity,
            "productUsage.$[elem].availableQuantity":
              categoryUsage.availableQuantity - quantity,
          },
        },
        {
          arrayFilters: [{ "elem.categoryId": product.category }],
        }
      );
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    revalidatePath("/cart");

    return {
      success: true,
      cart: cart.toObject(),
      membershipInfo: {
        isFree,
        savings,
        categoryUsage,
      },
    };
  } catch (error) {
    console.error("❌ Error adding to membership cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getMembershipCartSummary(): Promise<{
  success: boolean;
  summary?: {
    regularTotal: number;
    membershipTotal: number;
    totalSavings: number;
    freeItems: number;
    paidItems: number;
    membershipTier?: string;
  };
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

    const membership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership");

    const cart = await Cart.findOne({ clerkUserId: userId }).populate({
      path: "items.product",
      select: "name price category",
    });

    if (!cart) {
      return {
        success: true,
        summary: {
          regularTotal: 0,
          membershipTotal: 0,
          totalSavings: 0,
          freeItems: 0,
          paidItems: 0,
          membershipTier:
            typeof membership?.membership === "object" &&
            "tier" in membership.membership
              ? (membership.membership as { tier: string }).tier
              : undefined,
        },
      };
    }

    let regularTotal = 0;
    let membershipTotal = 0;
    let freeItems = 0;
    let paidItems = 0;

    for (const item of cart.items) {
      const itemRegularPrice = item.originalPrice || item.price;
      const itemTotal = itemRegularPrice * item.quantity;
      regularTotal += itemTotal;

      if (item.price === 0) {
        freeItems += item.quantity;
      } else {
        membershipTotal += item.price * item.quantity;
        paidItems += item.quantity;
      }
    }

    const totalSavings = regularTotal - membershipTotal;

    return {
      success: true,
      summary: {
        regularTotal,
        membershipTotal,
        totalSavings,
        freeItems,
        paidItems,
        membershipTier:
          typeof membership?.membership === "object" &&
          "tier" in membership.membership
            ? (membership.membership as { tier: string }).tier
            : undefined,
      },
    };
  } catch (error) {
    console.error("❌ Error getting membership cart summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
