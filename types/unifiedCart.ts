// lib/types/unifiedCart.ts

import { IUser, IUserMembership, IProduct, ICategory } from "@/lib/db/models";

// Enhanced Cart Item with all pricing scenarios
export interface UnifiedCartItem {
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

  // Pricing breakdown
  originalPrice: number; // Product's original price
  regularPrice: number; // Current price (after any product discounts)
  membershipPrice: number; // Price after membership (could be 0)
  promotionPrice: number; // Price after promotions
  finalPrice: number; // Final price per item

  // Quantity breakdown
  freeFromMembership: number; // How many items are free from membership
  paidQuantity: number; // How many items user pays for

  // Savings breakdown
  membershipSavings: number; // Total saved from membership
  promotionSavings: number; // Total saved from promotions
  totalSavings: number; // Total savings on this item

  // Membership metadata
  membershipEligible: boolean;
  categoryId?: string;
  categoryName?: string;
  usesAllocation: boolean;
}

// Complete cart with all pricing scenarios
export interface UnifiedCart {
  _id: string;
  items: UnifiedCartItem[];

  // Price totals
  subtotal: number; // Original total (at regular prices)
  membershipDiscount: number; // Total membership savings
  promotionDiscount: number; // Total promotion savings
  afterDiscountsTotal: number; // After all discounts, before shipping/tax
  shippingAmount: number;
  taxAmount: number;
  finalTotal: number; // Grand total

  // Promotion info
  promotionCode?: string;
  promotionName?: string;
  promotionId?: string;
  hasPromotionApplied: boolean;

  // Membership info
  hasMembershipApplied: boolean;
  membershipInfo?: {
    tier: string;
    totalSavings: number;
    allocationsUsed: MembershipAllocationUsage[];
  };

  // Summary counts
  totalItems: number;
  freeItems: number;
  paidItems: number;

  // Flags for UI
  canApplyPromotion: boolean; // Whether promotion can be applied
  hasEligibleItems: boolean; // Whether cart has promotion-eligible items
}

// Membership allocation tracking
export interface MembershipAllocationUsage {
  categoryId: string;
  categoryName: string;
  allocated: number;
  used: number;
  remaining: number;
  usedInCurrentCart: number;
}

// User context for cart operations
export interface UserCartContext {
  userId: string;
  user: IUser;
  membership: (IUserMembership & { membership: any }) | null;
  hasMembership: boolean;
}

// Product eligibility result
export interface ProductEligibility {
  isMembershipEligible: boolean;
  isPromotionEligible: boolean;
  categoryUsage?: MembershipAllocationUsage;
  availableForFree: number; // How many can be free from membership
}

// Cart operation result
export interface CartOperationResult {
  success: boolean;
  cart?: UnifiedCart;
  error?: string;
  membershipInfo?: {
    wasApplied: boolean;
    savings: number;
    remainingAllocation?: number;
  };
  promotionInfo?: {
    wasApplied: boolean;
    savings: number;
    code?: string;
  };
}

// Validation result for promotions with membership consideration
export interface PromotionValidationResult {
  isValid: boolean;
  promotion?: any;
  discountAmount?: number;
  error?: string;
  applicableItems?: string[]; // Product IDs eligible for promotion
  eligibleSubtotal?: number; // Subtotal eligible for promotion (paid items only)
}
