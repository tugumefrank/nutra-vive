// lib/actions/membershipCartServerActions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import {
  Cart,
  Product,
  Promotion,
  CustomerPromotionUsage,
  User,
  UserMembership,
  ICart,
  IProduct,
  IUser,
  IUserMembership,
  IPromotion,
} from "../db/models";
import mongoose from "mongoose";

// Enhanced Cart Interface with Membership Support
export interface MembershipCartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category?: {
      _id: string;
      name: string;
      slug: string;
    };
    promotionEligible?: boolean;
    isDiscounted?: boolean;
  };
  quantity: number;
  price: number;
  originalPrice?: number;
  membershipPrice: number; // Price after membership discount (0 if free)
  isFreeFromMembership: boolean;
  membershipSavings: number;
  categoryId?: string;
  categoryName?: string;
}

export interface MembershipCartWithPromotion {
  _id: string;
  items: MembershipCartItem[];
  subtotal: number;
  membershipDiscount: number; // Total saved from membership
  promotionDiscount: number;
  promotionCode?: string;
  promotionName?: string;
  promotionId?: string;
  finalTotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  hasPromotionApplied: boolean;
  hasMembershipApplied: boolean;
  membershipInfo?: {
    tier: string;
    totalSavings: number;
    allocationsUsed: Array<{
      categoryId: string;
      categoryName: string;
      used: number;
      allocated: number;
      remaining: number;
    }>;
  };
}

export interface MembershipCartSummary {
  regularTotal: number;
  membershipTotal: number;
  membershipSavings: number;
  promotionSavings: number;
  totalSavings: number;
  finalTotal: number;
  freeItems: number;
  paidItems: number;
  membershipTier?: string;
  allocationsUsed: Array<{
    categoryName: string;
    used: number;
    allocated: number;
    remaining: number;
  }>;
}

export interface MembershipInfo {
  wasApplied: boolean;
  savings: number;
  remainingAllocation?: number;
}

export interface ProductUsage {
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  allocatedQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
  lastUsed?: Date;
}

// Membership Plan Interface  
interface MembershipPlan {
  _id: string;
  name: string;
  tier: string;
  price: number;
  duration: number;
  benefits: string[];
  limits?: {
    monthlyProducts?: number;
    categoryLimits?: Record<string, number>;
  };
}

export interface UserCartMembershipData {
  userId: string;
  user: IUser;
  cart: ICart;
  membership: (IUserMembership & { membership: MembershipPlan }) | null;
}

export interface EligibilityResult {
  eligible: boolean;
  categoryUsage?: ProductUsage;
}

// Validation Schemas
const addToMembershipCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const updateMembershipCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

type AddToMembershipCartData = z.infer<typeof addToMembershipCartSchema>;
type UpdateMembershipCartItemData = z.infer<
  typeof updateMembershipCartItemSchema
>;

// Helper function to calculate shipping
function calculateShipping(
  subtotal: number,
  deliveryMethod: string = "standard"
): number {
  if (deliveryMethod === "pickup") return 0;
  if (subtotal >= 25) return 0; // Free shipping over $25
  return deliveryMethod === "express" ? 9.99 : 5.99;
}

// Helper function to calculate tax
function calculateTax(amount: number): number {
  return Math.round(amount * 0.08 * 100) / 100; // 8% tax
}

// Raw Membership Cart Item Interface (from database)
interface RawMembershipCartItem {
  _id?: any;
  productId: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  membershipPrice?: number;
  name?: string;
  image?: string;
  product?: any; // Can be properly typed later
}

// Raw Membership Cart Interface (from database)
interface RawMembershipCart {
  _id?: any;
  items?: RawMembershipCartItem[];
  membershipDiscount?: number;
  promotionDiscount?: number;
  promotionCode?: string;
  promotionName?: string;
  promotionId?: string;
}

// Enhanced serialization function with membership support
const serializeMembershipCart = (
  cart: RawMembershipCart,
  membership?: IUserMembership & { membership: MembershipPlan }
): MembershipCartWithPromotion | null => {
  if (!cart) return null;

  // Calculate subtotal from original prices
  const subtotal: number =
    cart.items?.reduce(
      (sum: number, item: RawMembershipCartItem) =>
        sum + item.quantity * (item.originalPrice || item.price),
      0
    ) || 0;

  // Calculate membership discount
  const membershipDiscount: number =
    cart.items?.reduce(
      (sum: number, item: any) => sum + (item.membershipSavings || 0),
      0
    ) || 0;

  // Get promotion discount
  const promotionDiscount: number = cart.promotionDiscount || 0;

  // Calculate final total after all discounts
  const afterDiscountsTotal: number = Math.max(
    0,
    subtotal - membershipDiscount - promotionDiscount
  );

  // Calculate shipping and tax
  const shippingAmount: number = calculateShipping(afterDiscountsTotal);
  const taxAmount: number = calculateTax(afterDiscountsTotal + shippingAmount);
  const totalAmount: number = afterDiscountsTotal + shippingAmount + taxAmount;

  return {
    _id: cart._id?.toString() || "",
    items:
      cart.items?.map(
        (item: any): MembershipCartItem => ({
          _id: item._id?.toString() || "",
          product: {
            _id: item.product?._id?.toString() || "",
            name: item.product?.name || "",
            slug: item.product?.slug || "",
            price: item.product?.price || 0,
            compareAtPrice: item.product?.compareAtPrice,
            images: item.product?.images || [],
            category: item.product?.category
              ? {
                  _id: item.product.category._id?.toString() || "",
                  name: item.product.category.name || "",
                  slug: item.product.category.slug || "",
                }
              : undefined,
            promotionEligible: item.product?.promotionEligible,
            isDiscounted: item.product?.isDiscounted,
          },
          quantity: item.quantity || 0,
          price: item.price || 0,
          originalPrice: item.originalPrice,
          membershipPrice: item.membershipPrice || item.price || 0,
          isFreeFromMembership: item.isFreeFromMembership || false,
          membershipSavings: item.membershipSavings || 0,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
        })
      ) || [],
    subtotal,
    membershipDiscount,
    promotionDiscount,
    promotionCode: cart.promotionCode,
    promotionName: cart.promotionName,
    promotionId: cart.promotionId?.toString(),
    finalTotal: afterDiscountsTotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    hasPromotionApplied: !!(cart.promotionCode && promotionDiscount > 0),
    hasMembershipApplied: membershipDiscount > 0,
    membershipInfo: membership
      ? {
          tier: membership.membership.tier,
          totalSavings: membershipDiscount,
          allocationsUsed: membership.productUsage.map(
            (usage: ProductUsage) => ({
              categoryId: usage.categoryId.toString(),
              categoryName: usage.categoryName,
              used: usage.usedQuantity,
              allocated: usage.allocatedQuantity,
              remaining: usage.availableQuantity,
            })
          ),
        }
      : undefined,
  };
};

// Helper function to get current user, cart, and membership
async function getUserCartAndMembership(): Promise<UserCartMembershipData> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User must be authenticated");
  }

  await connectToDatabase();

  // Get user
  const user = (await User.findOne({ clerkId: userId }).lean()) as IUser;
  if (!user) {
    throw new Error("User not found");
  }

  // Get or create cart
  let cart = (await Cart.findOne({ clerkUserId: userId })) as ICart;
  if (!cart) {
    cart = new Cart({
      clerkUserId: userId,
      items: [],
      promotionDiscount: 0,
    });
    await cart.save();
  }

  // Get active membership
  const membership = (await UserMembership.findOne({
    user: user._id,
    status: "active",
  })
    .populate("membership")
    .lean()) as (IUserMembership & { membership: any }) | null;

  return { userId, user, cart, membership };
}

// Check if product is eligible for membership free allocation
function isProductEligibleForMembership(
  product: IProduct & { category: any },
  membership: (IUserMembership & { membership: any }) | null
): EligibilityResult {
  if (!membership || !product.category) {
    return { eligible: false };
  }

  const categoryUsage = membership.productUsage.find(
    (usage: ProductUsage) =>
      usage.categoryId.toString() === product.category._id.toString()
  );

  if (!categoryUsage || categoryUsage.availableQuantity <= 0) {
    return { eligible: false };
  }

  return { eligible: true, categoryUsage };
}

// Add item to cart with membership pricing
export async function addToMembershipCart(
  productId: string,
  quantity: number
): Promise<{
  success: boolean;
  cart?: MembershipCartWithPromotion;
  error?: string;
  membershipInfo?: MembershipInfo;
}> {
  try {
    const validatedData = addToMembershipCartSchema.parse({
      productId,
      quantity,
    });
    const { cart, membership } = await getUserCartAndMembership();

    // Get product details with category
    const product = (await Product.findById(validatedData.productId)
      .populate("category")
      .lean()) as (IProduct & { category: any }) | null;

    if (!product || !product.isActive) {
      return {
        success: false,
        error: "Product not found or unavailable",
      };
    }

    const membershipInfo: MembershipInfo = {
      wasApplied: false,
      savings: 0,
      remainingAllocation: undefined,
    };

    // Check if product is eligible for membership discount
    const eligibility = isProductEligibleForMembership(product, membership);
    let quantityFromAllocation = 0;
    let quantityToPay = quantity;

    if (eligibility.eligible && eligibility.categoryUsage) {
      // Calculate how many can be free from membership
      quantityFromAllocation = Math.min(
        quantity,
        eligibility.categoryUsage.availableQuantity
      );
      quantityToPay = quantity - quantityFromAllocation;

      membershipInfo.wasApplied = quantityFromAllocation > 0;
      membershipInfo.savings = quantityFromAllocation * product.price;
      membershipInfo.remainingAllocation =
        eligibility.categoryUsage.availableQuantity - quantityFromAllocation;
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === validatedData.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      // Recalculate membership pricing for total quantity
      if (eligibility.eligible && eligibility.categoryUsage) {
        const totalFreeQuantity = Math.min(
          newQuantity,
          eligibility.categoryUsage.availableQuantity
        );
        const totalPaidQuantity = newQuantity - totalFreeQuantity;

        existingItem.quantity = newQuantity;
        (existingItem as any).membershipPrice =
          totalPaidQuantity > 0 ? product.price : 0;
        (existingItem as any).isFreeFromMembership = totalFreeQuantity > 0;
        (existingItem as any).membershipSavings =
          totalFreeQuantity * product.price;
        (existingItem as any).categoryId = product.category._id.toString();
        (existingItem as any).categoryName = product.category.name;
      } else {
        existingItem.quantity = newQuantity;
        (existingItem as any).membershipPrice = product.price;
        (existingItem as any).isFreeFromMembership = false;
        (existingItem as any).membershipSavings = 0;
      }

      existingItem.price = product.price;
      (existingItem as any).originalPrice =
        product.compareAtPrice || product.price;
    } else {
      // Add new item
      const newItem = {
        product: new mongoose.Types.ObjectId(validatedData.productId),
        quantity: validatedData.quantity,
        price: product.price,
        originalPrice: product.compareAtPrice || product.price,
        membershipPrice: quantityToPay > 0 ? product.price : 0,
        isFreeFromMembership: quantityFromAllocation > 0,
        membershipSavings: quantityFromAllocation * product.price,
        categoryId: product.category?._id.toString(),
        categoryName: product.category?.name,
      };

      cart.items.push(newItem as any);
    }

    // Update membership usage if applicable
    if (
      eligibility.eligible &&
      eligibility.categoryUsage &&
      quantityFromAllocation > 0 &&
      membership
    ) {
      await UserMembership.findByIdAndUpdate(
        membership._id,
        {
          $set: {
            "productUsage.$[elem].usedQuantity":
              eligibility.categoryUsage.usedQuantity + quantityFromAllocation,
            "productUsage.$[elem].availableQuantity":
              eligibility.categoryUsage.availableQuantity -
              quantityFromAllocation,
          },
        },
        {
          arrayFilters: [{ "elem.categoryId": product.category._id }],
        }
      );
    }

    // Revalidate promotion if one is applied
    if ((cart as any).promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        (cart as any).promotionCode = undefined;
        (cart as any).promotionDiscount = 0;
        (cart as any).promotionName = undefined;
        (cart as any).promotionId = undefined;
      } else {
        (cart as any).promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item added to membership cart successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart:
        serializeMembershipCart(cart.toObject(), membership || undefined) ??
        undefined,
      membershipInfo,
    };
  } catch (error) {
    console.error("❌ Error adding to membership cart:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err) => err.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Update cart item quantity with membership recalculation
export async function updateMembershipCartItem(
  productId: string,
  quantity: number
): Promise<{
  success: boolean;
  cart?: MembershipCartWithPromotion;
  error?: string;
}> {
  try {
    const validatedData = updateMembershipCartItemSchema.parse({
      productId,
      quantity,
    });
    const { cart, membership } = await getUserCartAndMembership();

    if (validatedData.quantity === 0) {
      // Remove item and restore allocation
      const itemToRemove = cart.items.find(
        (item: any) => item.product.toString() === validatedData.productId
      );

      if (
        itemToRemove &&
        (itemToRemove as any).isFreeFromMembership &&
        membership
      ) {
        // Restore allocation
        const freeQuantity = Math.ceil(
          ((itemToRemove as any).membershipSavings || 0) / itemToRemove.price
        );
        await UserMembership.findByIdAndUpdate(
          membership._id,
          {
            $inc: {
              "productUsage.$[elem].usedQuantity": -freeQuantity,
              "productUsage.$[elem].availableQuantity": freeQuantity,
            },
          },
          {
            arrayFilters: [
              { "elem.categoryId": (itemToRemove as any).categoryId },
            ],
          }
        );
      }

      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== validatedData.productId
      );
    } else {
      // Update quantity and recalculate membership pricing
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === validatedData.productId
      );

      if (existingItemIndex >= 0) {
        const item = cart.items[existingItemIndex];
        const newQuantity = validatedData.quantity;

        // Get product to recalculate pricing
        const product = (await Product.findById(validatedData.productId)
          .populate("category")
          .lean()) as (IProduct & { category: any }) | null;

        if (!product) {
          return { success: false, error: "Product not found" };
        }

        // Check membership eligibility
        const eligibility = isProductEligibleForMembership(product, membership);

        if (eligibility.eligible && eligibility.categoryUsage && membership) {
          // Calculate change in allocation usage
          const oldFreeQuantity = Math.ceil(
            ((item as any).membershipSavings || 0) / product.price
          );
          const newFreeQuantity = Math.min(
            newQuantity,
            eligibility.categoryUsage.availableQuantity + oldFreeQuantity
          );
          const allocationChange = newFreeQuantity - oldFreeQuantity;

          // Update membership allocation
          if (allocationChange !== 0) {
            await UserMembership.findByIdAndUpdate(
              membership._id,
              {
                $inc: {
                  "productUsage.$[elem].usedQuantity": allocationChange,
                  "productUsage.$[elem].availableQuantity": -allocationChange,
                },
              },
              {
                arrayFilters: [{ "elem.categoryId": product.category._id }],
              }
            );
          }

          // Update item pricing
          item.quantity = newQuantity;
          (item as any).membershipPrice =
            (newQuantity - newFreeQuantity) * product.price;
          (item as any).membershipSavings = newFreeQuantity * product.price;
          (item as any).isFreeFromMembership = newFreeQuantity > 0;
        } else {
          item.quantity = newQuantity;
          (item as any).membershipPrice = newQuantity * product.price;
          (item as any).membershipSavings = 0;
          (item as any).isFreeFromMembership = false;
        }
      } else {
        return { success: false, error: "Item not found in cart" };
      }
    }

    // Revalidate promotion if one is applied
    if ((cart as any).promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        (cart as any).promotionCode = undefined;
        (cart as any).promotionDiscount = 0;
        (cart as any).promotionName = undefined;
        (cart as any).promotionId = undefined;
      } else {
        (cart as any).promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Membership cart item updated successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart:
        serializeMembershipCart(cart.toObject(), membership ?? undefined) ??
        undefined,
    };
  } catch (error) {
    console.error("❌ Error updating membership cart item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get cart with membership pricing
export async function getMembershipCart(): Promise<{
  success: boolean;
  cart?: MembershipCartWithPromotion;
  error?: string;
}> {
  try {
    const { cart, membership } = await getUserCartAndMembership();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // Filter out inactive products and restore allocations if needed
    const originalItemCount = cart.items.length;
    const removedItems = cart.items.filter(
      (item: any) => !item.product?.isActive
    );
    cart.items = cart.items.filter((item: any) => item.product?.isActive);

    // Restore allocations for removed items
    if (removedItems.length > 0 && membership) {
      for (const item of removedItems) {
        if ((item as any).isFreeFromMembership && (item as any).categoryId) {
          const freeQuantity = Math.ceil(
            ((item as any).membershipSavings || 0) / item.price
          );
          await UserMembership.findByIdAndUpdate(
            membership._id,
            {
              $inc: {
                "productUsage.$[elem].usedQuantity": -freeQuantity,
                "productUsage.$[elem].availableQuantity": freeQuantity,
              },
            },
            {
              arrayFilters: [{ "elem.categoryId": (item as any).categoryId }],
            }
          );
        }
      }
    }

    // Revalidate promotion if items were removed
    if (
      cart.items.length !== originalItemCount &&
      (cart as any).promotionCode
    ) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        (cart as any).promotionCode = undefined;
        (cart as any).promotionDiscount = 0;
        (cart as any).promotionName = undefined;
        (cart as any).promotionId = undefined;
      } else {
        (cart as any).promotionDiscount = validation.discountAmount || 0;
      }
    }

    if (cart.isModified()) {
      await cart.save();
    }

    return {
      success: true,
      cart:
        serializeMembershipCart(cart.toObject(), membership || undefined) ??
        undefined,
    };
  } catch (error) {
    console.error("❌ Error getting membership cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get membership cart summary
export async function getMembershipCartSummary(): Promise<{
  success: boolean;
  summary?: MembershipCartSummary;
  error?: string;
}> {
  try {
    const result = await getMembershipCart();

    if (!result.success || !result.cart) {
      return {
        success: true,
        summary: {
          regularTotal: 0,
          membershipTotal: 0,
          membershipSavings: 0,
          promotionSavings: 0,
          totalSavings: 0,
          finalTotal: 0,
          freeItems: 0,
          paidItems: 0,
          allocationsUsed: [],
        },
      };
    }

    const cart = result.cart;
    const membershipSavings = cart.membershipDiscount;
    const promotionSavings = cart.promotionDiscount;
    const totalSavings = membershipSavings + promotionSavings;

    let freeItems = 0;
    let paidItems = 0;

    cart.items.forEach((item) => {
      if (item.isFreeFromMembership) {
        const freeQuantity = Math.ceil(
          item.membershipSavings / item.product.price
        );
        freeItems += freeQuantity;
        paidItems += item.quantity - freeQuantity;
      } else {
        paidItems += item.quantity;
      }
    });

    return {
      success: true,
      summary: {
        regularTotal: cart.subtotal,
        membershipTotal: cart.finalTotal,
        membershipSavings,
        promotionSavings,
        totalSavings,
        finalTotal: cart.finalTotal,
        freeItems,
        paidItems,
        membershipTier: cart.membershipInfo?.tier,
        allocationsUsed: cart.membershipInfo?.allocationsUsed || [],
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

// Promotion validation function placeholder
// This should be replaced with actual implementation from your cartServerActions.ts
async function validatePromotionForCart(
  cart: ICart,
  code?: string
): Promise<{
  isValid: boolean;
  promotion?: IPromotion;
  discountAmount?: number;
  error?: string;
}> {
  // For now, return invalid until proper implementation is added
  return {
    isValid: false,
    error:
      "Promotion validation requires implementation from cartServerActions.ts",
  };
}

// Remove item from membership cart
export async function removeFromMembershipCart(productId: string): Promise<{
  success: boolean;
  cart?: MembershipCartWithPromotion;
  error?: string;
}> {
  try {
    const { cart, membership } = await getUserCartAndMembership();

    // Find and remove item, restoring allocation if needed
    const itemToRemove = cart.items.find(
      (item: any) => item.product.toString() === productId
    );

    if (
      itemToRemove &&
      (itemToRemove as any).isFreeFromMembership &&
      membership
    ) {
      // Restore allocation
      const freeQuantity = Math.ceil(
        ((itemToRemove as any).membershipSavings || 0) / itemToRemove.price
      );
      await UserMembership.findByIdAndUpdate(
        membership._id,
        {
          $inc: {
            "productUsage.$[elem].usedQuantity": -freeQuantity,
            "productUsage.$[elem].availableQuantity": freeQuantity,
          },
        },
        {
          arrayFilters: [
            { "elem.categoryId": (itemToRemove as any).categoryId },
          ],
        }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    // Revalidate promotion if one is applied
    if ((cart as any).promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        (cart as any).promotionCode = undefined;
        (cart as any).promotionDiscount = 0;
        (cart as any).promotionName = undefined;
        (cart as any).promotionId = undefined;
      } else {
        (cart as any).promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item removed from membership cart successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart:
        serializeMembershipCart(cart.toObject(), membership || undefined) ??
        undefined,
    };
  } catch (error) {
    console.error("❌ Error removing from membership cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Clear membership cart
export async function clearMembershipCart(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { cart, membership } = await getUserCartAndMembership();

    // Restore all allocations before clearing
    if (membership) {
      for (const item of cart.items) {
        if ((item as any).isFreeFromMembership && (item as any).categoryId) {
          const freeQuantity = Math.ceil(
            ((item as any).membershipSavings || 0) / item.price
          );
          await UserMembership.findByIdAndUpdate(
            membership._id,
            {
              $inc: {
                "productUsage.$[elem].usedQuantity": -freeQuantity,
                "productUsage.$[elem].availableQuantity": freeQuantity,
              },
            },
            {
              arrayFilters: [{ "elem.categoryId": (item as any).categoryId }],
            }
          );
        }
      }
    }

    cart.items = [];
    (cart as any).promotionCode = undefined;
    (cart as any).promotionDiscount = 0;
    (cart as any).promotionName = undefined;
    (cart as any).promotionId = undefined;

    await cart.save();

    console.log("✅ Membership cart cleared successfully");
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("❌ Error clearing membership cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
