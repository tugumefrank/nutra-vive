// lib/actions/unifiedCartServerActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Cart, Product } from "@/lib/db/models";
import {
  getUserCartContext,
  getOrCreateCart,
  checkProductEligibility,
  updateMembershipAllocations,
  serializeUnifiedCart,
  validatePromotionForUnifiedCart,
} from "@/lib/helpers/unifiedCartHelpers";
import {
  UnifiedCart,
  CartOperationResult,
  PromotionValidationResult,
} from "@/types/unifiedCart";
import mongoose from "mongoose";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const updateCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

// ============================================================================
// CORE CART OPERATIONS
// ============================================================================

/**
 * Add item to cart with unified pricing (handles membership + promotions)
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<CartOperationResult> {
  try {
    console.log(`🛒 Adding ${quantity}x product ${productId} to cart`);

    // Validate input
    const validatedData = addToCartSchema.parse({ productId, quantity });

    // Get user context and cart
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    await connectToDatabase();

    // Get product with category
    const product = await Product.findById(validatedData.productId)
      .populate("category")
      .lean();

    if (!product || !product.isActive) {
      return {
        success: false,
        error: "Product not found or unavailable",
      };
    }

    // Check product eligibility for membership and promotions
    const eligibility = await checkProductEligibility(product as any, context);

    console.log(`📋 Product eligibility:`, {
      membershipEligible: eligibility.isMembershipEligible,
      availableForFree: eligibility.availableForFree,
      promotionEligible: eligibility.isPromotionEligible,
    });

    // Track membership info for response
    const membershipInfo = {
      wasApplied: false,
      savings: 0,
      remainingAllocation: eligibility.availableForFree,
    };

    // Calculate quantities for membership
    const freeFromMembership = eligibility.isMembershipEligible
      ? Math.min(quantity, eligibility.availableForFree)
      : 0;

    if (freeFromMembership > 0) {
      membershipInfo.wasApplied = true;
      membershipInfo.savings = freeFromMembership * product.price;
      membershipInfo.remainingAllocation =
        eligibility.availableForFree - freeFromMembership;
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === validatedData.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newTotalQuantity = existingItem.quantity + quantity;

      // Recalculate membership allocation for total quantity
      const newFreeFromMembership = eligibility.isMembershipEligible
        ? Math.min(newTotalQuantity, eligibility.availableForFree)
        : 0;

      const currentFreeQuantity = Math.ceil(
        ((existingItem as any).membershipSavings || 0) / product.price
      );
      const allocationChange = newFreeFromMembership - currentFreeQuantity;

      // Update item properties
      existingItem.quantity = newTotalQuantity;
      existingItem.price = product.price;
      (existingItem as any).originalPrice =
        product.compareAtPrice || product.price;
      (existingItem as any).membershipSavings =
        newFreeFromMembership * product.price;
      (existingItem as any).freeFromMembership = newFreeFromMembership;
      (existingItem as any).paidQuantity =
        newTotalQuantity - newFreeFromMembership;
      (existingItem as any).usesAllocation = newFreeFromMembership > 0;

      // Update membership allocation if needed
      if (context.hasMembership && allocationChange !== 0 && product.category) {
        await updateMembershipAllocations(
          context.membership!,
          typeof product.category === "object" &&
            product.category !== null &&
            "_id" in product.category
            ? (product.category as { _id: any })._id.toString()
            : product.category?.toString(),
          allocationChange
        );
      }
    } else {
      // Add new item
      const newItem = {
        product: new mongoose.Types.ObjectId(validatedData.productId),
        quantity: validatedData.quantity,
        price: product.price,
        originalPrice: product.compareAtPrice || product.price,
        membershipSavings: freeFromMembership * product.price,
        freeFromMembership: freeFromMembership,
        paidQuantity: quantity - freeFromMembership,
        usesAllocation: freeFromMembership > 0,
        categoryId:
          typeof product.category === "object" &&
          product.category !== null &&
          "_id" in product.category
            ? (product.category as { _id: any })._id.toString()
            : product.category?.toString(),
        categoryName:
          typeof product.category === "object" &&
          product.category !== null &&
          "name" in product.category
            ? (product.category as { name: string }).name
            : undefined,
      };

      cart.items.push(newItem as any);

      // Update membership allocation
      if (context.hasMembership && freeFromMembership > 0 && product.category) {
        await updateMembershipAllocations(
          context.membership!,
          typeof product.category === "object" &&
            product.category !== null &&
            "_id" in product.category
            ? (product.category as { _id: any })._id.toString()
            : product.category?.toString(),
          freeFromMembership
        );
      }
    }

    // Revalidate promotion if one is applied
    if ((cart as any).promotionCode) {
      console.log(`🎫 Revalidating promotion: ${(cart as any).promotionCode}`);
      const validation = await validatePromotionForUnifiedCart(cart, context);
      if (!validation.isValid) {
        console.log(`❌ Promotion no longer valid: ${validation.error}`);
        (cart as any).promotionCode = undefined;
        (cart as any).promotionDiscount = 0;
        (cart as any).promotionName = undefined;
        (cart as any).promotionId = undefined;
      } else {
        console.log(
          `✅ Promotion still valid, discount: $${validation.discountAmount}`
        );
        (cart as any).promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    // Serialize and return unified cart
    const unifiedCart = await serializeUnifiedCart(cart, context);

    console.log(
      `✅ Item added successfully. Cart total: $${unifiedCart.finalTotal}`
    );
    revalidatePath("/cart");

    return {
      success: true,
      cart: unifiedCart,
      membershipInfo,
    };
  } catch (error) {
    console.error("❌ Error adding to cart:", error);

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

/**
 * Update cart item quantity with unified pricing
 */
export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<CartOperationResult> {
  try {
    console.log(`🔄 Updating cart item ${productId} to quantity ${quantity}`);

    // Validate input
    const validatedData = updateCartItemSchema.parse({ productId, quantity });

    // Get user context and cart
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    await connectToDatabase();

    if (validatedData.quantity === 0) {
      // Remove item completely
      return await removeFromCart(productId);
    }

    // Find existing item
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === validatedData.productId
    );

    if (existingItemIndex < 0) {
      return { success: false, error: "Item not found in cart" };
    }

    const existingItem = cart.items[existingItemIndex];

    // Get product details for recalculation
    const product = await Product.findById(validatedData.productId)
      .populate("category")
      .lean();

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check current eligibility
    const eligibility = await checkProductEligibility(product as any, context);

    // Calculate current and new allocation usage
    const currentFreeQuantity = (existingItem as any).freeFromMembership || 0;
    const newFreeQuantity = eligibility.isMembershipEligible
      ? Math.min(
          validatedData.quantity,
          eligibility.availableForFree + currentFreeQuantity
        )
      : 0;
    const allocationChange = newFreeQuantity - currentFreeQuantity;

    // Update item properties
    existingItem.quantity = validatedData.quantity;
    (existingItem as any).freeFromMembership = newFreeQuantity;
    (existingItem as any).paidQuantity =
      validatedData.quantity - newFreeQuantity;
    (existingItem as any).membershipSavings = newFreeQuantity * product.price;
    (existingItem as any).usesAllocation = newFreeQuantity > 0;

    // Update membership allocation if needed
    if (context.hasMembership && allocationChange !== 0 && product.category) {
      await updateMembershipAllocations(
        context.membership!,
        typeof product.category === "object" &&
          product.category !== null &&
          "_id" in product.category
          ? (product.category as { _id: any })._id.toString()
          : product.category?.toString(),
        allocationChange
      );
    }

    // Revalidate promotion
    if ((cart as any).promotionCode) {
      const validation = await validatePromotionForUnifiedCart(cart, context);
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

    const unifiedCart = await serializeUnifiedCart(cart, context);

    console.log(`✅ Cart item updated successfully`);
    revalidatePath("/cart");

    return {
      success: true,
      cart: unifiedCart,
    };
  } catch (error) {
    console.error("❌ Error updating cart item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Remove item from cart with allocation restoration
 */
export async function removeFromCart(
  productId: string
): Promise<CartOperationResult> {
  try {
    console.log(`🗑️ Removing item ${productId} from cart`);

    // Get user context and cart
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    // Find item to remove
    const itemToRemove = cart.items.find(
      (item: any) => item.product.toString() === productId
    );

    if (!itemToRemove) {
      return { success: false, error: "Item not found in cart" };
    }

    // Restore membership allocation if item used it
    if (context.hasMembership && (itemToRemove as any).usesAllocation) {
      const freeQuantity = (itemToRemove as any).freeFromMembership || 0;
      if (freeQuantity > 0 && (itemToRemove as any).categoryId) {
        await updateMembershipAllocations(
          context.membership!,
          (itemToRemove as any).categoryId,
          -freeQuantity // Negative to restore allocation
        );
      }
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    // Revalidate promotion
    if ((cart as any).promotionCode) {
      const validation = await validatePromotionForUnifiedCart(cart, context);
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

    const unifiedCart = await serializeUnifiedCart(cart, context);

    console.log(`✅ Item removed from cart successfully`);
    revalidatePath("/cart");

    return {
      success: true,
      cart: unifiedCart,
    };
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Get cart with unified pricing
 */
export async function getCart(): Promise<CartOperationResult> {
  try {
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    // Filter out inactive products and restore allocations
    await cart.populate({
      path: "items.product",
      select:
        "name slug price images category isActive compareAtPrice promotionEligible",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    const originalItemCount = cart.items.length;
    const removedItems = cart.items.filter(
      (item: any) => !item.product?.isActive
    );
    cart.items = cart.items.filter((item: any) => item.product?.isActive);

    // Restore allocations for removed items
    if (removedItems.length > 0 && context.hasMembership) {
      for (const item of removedItems) {
        if ((item as any).usesAllocation && (item as any).categoryId) {
          const freeQuantity = (item as any).freeFromMembership || 0;
          if (freeQuantity > 0) {
            await updateMembershipAllocations(
              context.membership!,
              (item as any).categoryId,
              -freeQuantity
            );
          }
        }
      }
    }

    // Revalidate promotion if items were removed
    if (
      cart.items.length !== originalItemCount &&
      (cart as any).promotionCode
    ) {
      const validation = await validatePromotionForUnifiedCart(cart, context);
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

    const unifiedCart = await serializeUnifiedCart(cart, context);

    return {
      success: true,
      cart: unifiedCart,
    };
  } catch (error) {
    console.error("❌ Error getting cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Clear cart with allocation restoration
 */
export async function clearCart(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`🧹 Clearing cart`);

    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    // Restore all allocations before clearing
    if (context.hasMembership) {
      for (const item of cart.items) {
        if ((item as any).usesAllocation && (item as any).categoryId) {
          const freeQuantity = (item as any).freeFromMembership || 0;
          if (freeQuantity > 0) {
            await updateMembershipAllocations(
              context.membership!,
              (item as any).categoryId,
              -freeQuantity
            );
          }
        }
      }
    }

    // Clear cart
    cart.items = [];
    (cart as any).promotionCode = undefined;
    (cart as any).promotionDiscount = 0;
    (cart as any).promotionName = undefined;
    (cart as any).promotionId = undefined;

    await cart.save();

    console.log(`✅ Cart cleared successfully`);
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// ============================================================================
// PROMOTION OPERATIONS
// ============================================================================

/**
 * Validate promotion code for unified cart
 */
export async function validatePromotionCode(
  code: string
): Promise<PromotionValidationResult> {
  try {
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    if (!cart || cart.items.length === 0) {
      return { isValid: false, error: "Your cart is empty" };
    }

    const validation = await validatePromotionForUnifiedCart(
      cart,
      context,
      code
    );
    return validation;
  } catch (error) {
    console.error("❌ Error validating promotion code:", error);
    return { isValid: false, error: "Failed to validate promotion code" };
  }
}

/**
 * Apply promotion to unified cart
 */
export async function applyPromotionToCart(
  code: string
): Promise<CartOperationResult> {
  try {
    console.log(`🎫 Applying promotion code: ${code}`);

    const validation = await validatePromotionCode(code);
    if (!validation.isValid) {
      console.log(`❌ Promotion validation failed: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    // Apply promotion to cart
    (cart as any).promotionCode = code.toUpperCase();
    (cart as any).promotionDiscount = validation.discountAmount || 0;
    (cart as any).promotionName = validation.promotion?.name;
    (cart as any).promotionId = validation.promotion?._id;

    await cart.save();

    const unifiedCart = await serializeUnifiedCart(cart, context);

    console.log(
      `✅ Applied promotion ${code} with discount $${validation.discountAmount}`
    );
    revalidatePath("/cart");

    return {
      success: true,
      cart: unifiedCart,
      promotionInfo: {
        wasApplied: true,
        savings: validation.discountAmount || 0,
        code: code.toUpperCase(),
      },
    };
  } catch (error) {
    console.error("❌ Error applying promotion to cart:", error);
    return { success: false, error: "Failed to apply promotion" };
  }
}

/**
 * Remove promotion from unified cart
 */
export async function removePromotionFromCart(): Promise<CartOperationResult> {
  try {
    const context = await getUserCartContext();
    const cart = await getOrCreateCart(context.userId);

    const wasApplied = (cart as any).promotionCode;

    // Remove promotion
    (cart as any).promotionCode = undefined;
    (cart as any).promotionDiscount = 0;
    (cart as any).promotionName = undefined;
    (cart as any).promotionId = undefined;

    await cart.save();

    const unifiedCart = await serializeUnifiedCart(cart, context);

    if (wasApplied) {
      console.log(`✅ Removed promotion ${wasApplied} from cart`);
    }

    revalidatePath("/cart");

    return {
      success: true,
      cart: unifiedCart,
    };
  } catch (error) {
    console.error("❌ Error removing promotion from cart:", error);
    return { success: false, error: "Failed to remove promotion" };
  }
}

// ============================================================================
// CART STATS
// ============================================================================

/**
 * Get cart statistics
 */
export async function getCartStats(): Promise<{
  success: boolean;
  stats?: {
    totalItems: number;
    subtotal: number;
    membershipDiscount: number;
    promotionDiscount: number;
    finalTotal: number;
    itemCount: number;
    freeItems: number;
    paidItems: number;
  };
  error?: string;
}> {
  try {
    const result = await getCart();

    if (!result.success || !result.cart) {
      return {
        success: true,
        stats: {
          totalItems: 0,
          subtotal: 0,
          membershipDiscount: 0,
          promotionDiscount: 0,
          finalTotal: 0,
          itemCount: 0,
          freeItems: 0,
          paidItems: 0,
        },
      };
    }

    const cart = result.cart;

    return {
      success: true,
      stats: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        membershipDiscount: cart.membershipDiscount,
        promotionDiscount: cart.promotionDiscount,
        finalTotal: cart.finalTotal,
        itemCount: cart.items.length,
        freeItems: cart.freeItems,
        paidItems: cart.paidItems,
      },
    };
  } catch (error) {
    console.error("❌ Error getting cart stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
