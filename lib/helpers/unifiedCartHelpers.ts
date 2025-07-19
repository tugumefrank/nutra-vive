// lib/helpers/unifiedCartHelpers.ts

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import {
  User,
  UserMembership,
  Cart,
  Product,
  Promotion,
  IUser,
  IUserMembership,
  IProduct,
  ICart,
} from "@/lib/db/models";
import {
  ProductEligibility,
  PromotionValidationResult,
  UnifiedCart,
  UnifiedCartItem,
  UserCartContext,
} from "@/types/unifiedCart";

// ============================================================================
// CORE HELPER FUNCTIONS
// ============================================================================

/**
 * Get user context including membership information
 */
export async function getUserCartContext(): Promise<UserCartContext> {
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

  // Get active membership
  const membership = (await UserMembership.findOne({
    user: user._id,
    status: "active",
  })
    .populate("membership")
    .lean()) as (IUserMembership & { membership: any }) | null;

  console.log('🏷️ User cart context:', {
    userId,
    userFound: !!user,
    membershipFound: !!membership,
    membershipData: membership ? {
      tier: membership.membership?.tier,
      status: membership.status,
      productUsage: membership.productUsage
    } : null
  });

  return {
    userId,
    user,
    membership,
    hasMembership: !!membership,
  };
}

/**
 * Get or create cart for user
 */
export async function getOrCreateCart(userId: string): Promise<ICart> {
  let cart = (await Cart.findOne({ clerkUserId: userId })) as ICart;
  if (!cart) {
    cart = new Cart({
      clerkUserId: userId,
      items: [],
      promotionDiscount: 0,
    });
    await cart.save();
  }
  return cart;
}

/**
 * Check product eligibility for membership and promotions
 */
export async function checkProductEligibility(
  product: IProduct & { category: any },
  context: UserCartContext
): Promise<ProductEligibility> {
  const result: ProductEligibility = {
    isMembershipEligible: false,
    isPromotionEligible: product.promotionEligible !== false,
    availableForFree: 0,
  };

  console.log('🔍 Checking eligibility for product:', {
    productName: product.name,
    productCategory: product.category?.name,
    productCategoryId: product.category?._id,
    hasMembership: context.hasMembership,
    membershipExists: !!context.membership
  });

  // Check membership eligibility
  if (context.hasMembership && context.membership && product.category) {
    console.log('🔍 Searching for category match:', {
      productCategoryId: product.category._id.toString(),
      availableAllocations: context.membership.productUsage.map((usage: any) => ({
        categoryId: usage.categoryId.toString(),
        categoryName: usage.categoryName,
        available: usage.availableQuantity
      }))
    });

    const categoryUsage = context.membership.productUsage.find(
      (usage: any) => {
        const usageCategoryId = usage.categoryId?.toString();
        const productCategoryId = product.category._id?.toString();
        const productCategoryName = product.category?.name?.toLowerCase();
        const usageCategoryName = usage.categoryName?.toLowerCase();
        
        console.log(`🛒 Comparing cart: "${usageCategoryId}" vs "${productCategoryId}"`);
        console.log(`🛒 Comparing names: "${usageCategoryName}" vs "${productCategoryName}"`);
        
        // Primary match: by category ID
        if (usageCategoryId === productCategoryId) {
          console.log(`🛒 ✅ CART MATCH BY ID`);
          return true;
        }
        
        // Fallback match: by category name (case-insensitive)
        if (usageCategoryName && productCategoryName && usageCategoryName === productCategoryName) {
          console.log(`🛒 ✅ CART MATCH BY NAME (fallback)`);
          return true;
        }
        
        // Special case mapping for category name variations
        const nameMapping: { [key: string]: string[] } = {
          'iced tea': ['iced tea', 'ice tea', 'iced-tea'],
          'tea bags': ['tea bags', 'tea bag', 'tea-bags', 'teabags'],
          'juice': ['juice', 'juices'],
          'herbal tea': ['herbal tea', 'herbal-tea', 'herbal']
        };
        
        for (const [canonical, variations] of Object.entries(nameMapping)) {
          if (variations.includes(usageCategoryName) && variations.includes(productCategoryName)) {
            console.log(`🛒 ✅ CART MATCH BY NAME VARIATION (${canonical})`);
            return true;
          }
        }
        
        return false;
      }
    );

    console.log('🔍 Category usage found:', {
      categoryUsage: categoryUsage ? {
        categoryId: categoryUsage.categoryId,
        categoryName: categoryUsage.categoryName,
        allocated: categoryUsage.allocatedQuantity,
        used: categoryUsage.usedQuantity,
        available: categoryUsage.availableQuantity
      } : null
    });

    if (categoryUsage && categoryUsage.availableQuantity > 0) {
      result.isMembershipEligible = true;
      result.categoryUsage = {
        categoryId: categoryUsage.categoryId.toString(),
        categoryName: categoryUsage.categoryName,
        allocated: categoryUsage.allocatedQuantity,
        used: categoryUsage.usedQuantity,
        remaining: categoryUsage.availableQuantity,
        usedInCurrentCart: 0, // Will be calculated later
      };
      result.availableForFree = categoryUsage.availableQuantity;
    }
  }

  console.log('🔍 Eligibility result:', result);
  return result;
}

/**
 * Calculate item pricing based on membership and promotions
 */
export function calculateItemPricing(
  product: IProduct,
  quantity: number,
  eligibility: ProductEligibility,
  promotionDiscount: number = 0
): {
  freeFromMembership: number;
  paidQuantity: number;
  membershipPrice: number;
  promotionPrice: number;
  finalPrice: number;
  membershipSavings: number;
  promotionSavings: number;
  totalSavings: number;
} {
  console.log('💰 Calculating pricing for:', {
    productName: product.name,
    quantity,
    eligibility: {
      isMembershipEligible: eligibility.isMembershipEligible,
      availableForFree: eligibility.availableForFree
    }
  });

  // For auto-discounted products, compareAtPrice is the original price before discount
  // For non-discounted products, use the current price as the original price
  const originalPrice = product.isDiscounted && product.compareAtPrice 
    ? product.compareAtPrice 
    : product.price;
  const regularPrice = product.price; // This is now the current (possibly discounted) price

  // Calculate membership allocation
  const freeFromMembership = eligibility.isMembershipEligible
    ? Math.min(quantity, eligibility.availableForFree)
    : 0;
  const paidQuantity = quantity - freeFromMembership;

  console.log('💰 Pricing calculation:', {
    freeFromMembership,
    paidQuantity,
    regularPrice
  });

  // Calculate pricing
  const membershipPrice = paidQuantity * regularPrice;
  const membershipSavings = freeFromMembership * regularPrice;

  // Apply promotion only to paid items
  const promotionSavings = Math.min(promotionDiscount, membershipPrice);
  const promotionPrice = membershipPrice - promotionSavings;
  const finalPrice = promotionPrice;

  // Calculate auto-discount savings (product-level discounts)
  const autoDiscountSavings = product.isDiscounted && product.compareAtPrice 
    ? (product.compareAtPrice - product.price) * quantity
    : 0;

  const totalSavings = membershipSavings + promotionSavings + autoDiscountSavings;

  const result = {
    freeFromMembership,
    paidQuantity,
    membershipPrice,
    promotionPrice,
    finalPrice,
    membershipSavings,
    promotionSavings,
    totalSavings,
  };

  console.log('💰 Final pricing result:', result);

  return result;
}

/**
 * Calculate shipping cost
 */
export function calculateShipping(
  subtotal: number,
  membershipHasFreeShipping: boolean = false,
  deliveryMethod: string = "standard"
): number {
  // Always return 0 - shipping is now free for all orders
  return 0;
}

/**
 * Calculate tax
 */
export function calculateTax(amount: number): number {
  return 0; // Tax calculation disabled
}

/**
 * Validate promotion for cart with membership consideration
 */
export async function validatePromotionForUnifiedCart(
  cart: ICart,
  context: UserCartContext,
  code?: string
): Promise<PromotionValidationResult> {
  try {
    const promotionCode = code || (cart as any).promotionCode;

    if (!promotionCode) {
      return { isValid: false, error: "No promotion code provided" };
    }

    await connectToDatabase();

    const promotion = await Promotion.findOne({
      "codes.code": promotionCode.toUpperCase(),
      isActive: true,
    }).populate([
      { path: "targetCategories", select: "_id name" },
      { path: "targetProducts", select: "_id name" },
      { path: "excludedCategories", select: "_id name" },
      { path: "excludedProducts", select: "_id name" },
    ]);

    if (!promotion) {
      return { isValid: false, error: "Invalid promotion code" };
    }

    // Validate promotion (timing, usage limits, etc.)
    const codeObj = promotion.codes.find(
      (c: any) => c.code === promotionCode.toUpperCase()
    );
    if (!codeObj || !codeObj.isActive) {
      return { isValid: false, error: "Promotion code is not active" };
    }

    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      return { isValid: false, error: "Promotion has not started yet" };
    }

    if (promotion.endsAt && promotion.endsAt < now) {
      return { isValid: false, error: "Promotion has expired" };
    }

    // Calculate eligible subtotal (only paid items, not free membership items)
    await cart.populate({
      path: "items.product",
      select: "name price category compareAtPrice promotionEligible",
      populate: { path: "category", select: "_id name" },
    });

    let eligibleSubtotal = 0;
    const applicableItems: string[] = [];

    for (const item of cart.items) {
      const product = item.product as any;

      // Skip if product is not promotion eligible
      if (product.promotionEligible === false) continue;

      // Check if product is excluded
      if (
        promotion.excludedProducts.some(
          (id: any) => id.toString() === product._id.toString()
        )
      )
        continue;

      if (
        promotion.excludedCategories.some(
          (id: any) => id.toString() === product.category?._id.toString()
        )
      )
        continue;

      // Check promotion scope
      let isInScope = false;
      switch (promotion.applicabilityScope) {
        case "entire_store":
          isInScope = true;
          break;
        case "categories":
          isInScope = promotion.targetCategories.some(
            (id: any) => id.toString() === product.category?._id.toString()
          );
          break;
        case "products":
          isInScope = promotion.targetProducts.some(
            (id: any) => id.toString() === product._id.toString()
          );
          break;
      }

      if (isInScope) {
        // Calculate paid quantity (excluding free membership items)
        const eligibility = await checkProductEligibility(product, context);
        const paidQuantity = Math.max(
          0,
          item.quantity - eligibility.availableForFree
        );

        if (paidQuantity > 0) {
          const paidItemTotal = paidQuantity * product.price;
          eligibleSubtotal += paidItemTotal;
          applicableItems.push(product._id.toString());
        }
      }
    }

    // Check minimum requirements against eligible subtotal
    if (
      promotion.minimumPurchaseAmount &&
      eligibleSubtotal < promotion.minimumPurchaseAmount
    ) {
      return {
        isValid: false,
        error: `Minimum purchase amount of $${promotion.minimumPurchaseAmount} required for eligible items`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    switch (promotion.discountType) {
      case "percentage":
        discountAmount = (eligibleSubtotal * promotion.discountValue) / 100;
        break;
      case "fixed_amount":
        discountAmount = Math.min(promotion.discountValue, eligibleSubtotal);
        break;
      // Add buy_x_get_y logic if needed
    }

    if (discountAmount === 0) {
      return {
        isValid: false,
        error:
          "This promotion does not apply to any eligible items in your cart",
      };
    }

    return {
      isValid: true,
      promotion: promotion.toObject(),
      discountAmount: Math.round(discountAmount * 100) / 100,
      applicableItems,
      eligibleSubtotal,
    };
  } catch (error) {
    console.error("❌ Error validating promotion for unified cart:", error);
    return { isValid: false, error: "Failed to validate promotion" };
  }
}

/**
 * Update membership allocations
 */
export async function updateMembershipAllocations(
  membership: IUserMembership & { membership: any },
  categoryId: string,
  quantityChange: number
): Promise<void> {
  if (quantityChange === 0) return;

  await UserMembership.findByIdAndUpdate(
    membership._id,
    {
      $inc: {
        "productUsage.$[elem].usedQuantity": quantityChange,
        "productUsage.$[elem].availableQuantity": -quantityChange,
      },
    },
    {
      arrayFilters: [{ "elem.categoryId": categoryId }],
    }
  );
}

/**
 * Serialize cart to unified format
 */
export async function serializeUnifiedCart(
  cart: ICart,
  context: UserCartContext
): Promise<UnifiedCart> {
  // Populate cart items
  await cart.populate({
    path: "items.product",
    select:
      "name slug price images category isActive compareAtPrice promotionEligible isDiscounted",
    populate: { path: "category", select: "name slug" },
  });

  const items: UnifiedCartItem[] = [];
  let subtotal = 0;
  let membershipDiscount = 0;
  let promotionDiscount = 0;
  let freeItems = 0;
  let paidItems = 0;

  // Process each cart item
  for (const cartItem of cart.items) {
    const product = cartItem.product as any;
    if (!product || !product.isActive) continue;

    const eligibility = await checkProductEligibility(product, context);
    const itemPromotionDiscount = 0; // Calculate per-item promotion discount if needed

    const pricing = calculateItemPricing(
      product,
      cartItem.quantity,
      eligibility,
      itemPromotionDiscount
    );

    const unifiedItem: UnifiedCartItem = {
      _id:
        (cartItem as any)._id?.toString() || (product._id?.toString?.() ?? ""),
      product: {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images || [],
        category: product.category
          ? {
              _id: product.category._id.toString(),
              name: product.category.name,
              slug: product.category.slug,
            }
          : undefined,
        promotionEligible: product.promotionEligible,
        isDiscounted: product.isDiscounted,
      },
      quantity: cartItem.quantity,
      originalPrice: product.compareAtPrice || product.price,
      regularPrice: product.price,
      membershipPrice: pricing.membershipPrice,
      promotionPrice: pricing.promotionPrice,
      finalPrice: pricing.finalPrice,
      freeFromMembership: pricing.freeFromMembership,
      paidQuantity: pricing.paidQuantity,
      membershipSavings: pricing.membershipSavings,
      promotionSavings: pricing.promotionSavings,
      totalSavings: pricing.totalSavings,
      membershipEligible: eligibility.isMembershipEligible,
      categoryId: product.category?._id.toString(),
      categoryName: product.category?.name,
      usesAllocation: pricing.freeFromMembership > 0,
    };

    items.push(unifiedItem);
    // For subtotal, use current product price (after auto-discounts) as the base
    // This ensures that auto-discounted products contribute their discounted price to the subtotal
    subtotal += cartItem.quantity * product.price;
    membershipDiscount += pricing.membershipSavings;
    freeItems += pricing.freeFromMembership;
    paidItems += pricing.paidQuantity;
  }

  // Apply promotion discount from cart
  promotionDiscount = (cart as any).promotionDiscount || 0;

  const afterDiscountsTotal = Math.max(
    0,
    subtotal - membershipDiscount - promotionDiscount
  );
  const membershipHasFreeShipping =
    context.membership?.membership?.freeDelivery || false;
  const shippingAmount = calculateShipping(
    afterDiscountsTotal,
    membershipHasFreeShipping
  );
  const taxAmount = calculateTax(afterDiscountsTotal + shippingAmount);
  const finalTotal = afterDiscountsTotal + shippingAmount + taxAmount;

  // Build membership info
  const membershipInfo =
    context.hasMembership && context.membership
      ? {
          tier: context.membership.membership.tier,
          totalSavings: membershipDiscount,
          allocationsUsed: context.membership.productUsage.map(
            (usage: any) => ({
              categoryId: usage.categoryId.toString(),
              categoryName: usage.categoryName,
              allocated: usage.allocatedQuantity,
              used: usage.usedQuantity,
              remaining: usage.availableQuantity,
              usedInCurrentCart: items
                .filter(
                  (item) => item.categoryId === usage.categoryId.toString()
                )
                .reduce((sum, item) => sum + item.freeFromMembership, 0),
            })
          ),
        }
      : undefined;

  return {
    _id: cart._id?.toString() || "",
    items,
    subtotal,
    membershipDiscount,
    promotionDiscount,
    afterDiscountsTotal,
    shippingAmount,
    taxAmount,
    finalTotal,
    promotionCode: (cart as any).promotionCode,
    promotionName: (cart as any).promotionName,
    promotionId: (cart as any).promotionId?.toString(),
    hasPromotionApplied: !!(
      (cart as any).promotionCode && promotionDiscount > 0
    ),
    hasMembershipApplied: membershipDiscount > 0,
    membershipInfo,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    freeItems,
    paidItems,
    canApplyPromotion: paidItems > 0, // Can only apply promotions if there are paid items
    hasEligibleItems: items.some(
      (item) => item.product.promotionEligible !== false
    ),
  };
}
