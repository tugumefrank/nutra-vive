// lib/utils/cart.ts

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique session ID for guest users
 */
export function generateSessionId(): string {
  return `guest_${uuidv4()}`;
}

/**
 * Get guest session ID from localStorage (client-side fallback)
 */
export function getGuestSessionId(): string | null {
  if (typeof window === "undefined") return null;

  let sessionId = localStorage.getItem("guest-session-id");

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("guest-session-id", sessionId);
  }

  return sessionId;
}

/**
 * Clear guest session ID (when user logs in)
 */
export function clearGuestSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("guest-session-id");
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: Array<{
    quantity: number;
    price: number;
  }>,
  options: {
    shippingThreshold?: number;
    shippingCost?: number;
    taxRate?: number;
    discountAmount?: number;
  } = {}
) {
  const {
    shippingThreshold = 25,
    shippingCost = 9.99,
    taxRate = 0.08, // 8% tax
    discountAmount = 0,
  } = options;

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    discount: discountAmount,
    total,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    qualifiesForFreeShipping: subtotal >= shippingThreshold,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate cart item quantity against inventory
 */
export function validateCartItemQuantity(
  requestedQuantity: number,
  availableInventory: number,
  currentCartQuantity: number = 0
): {
  isValid: boolean;
  maxAllowedQuantity: number;
  error?: string;
} {
  const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

  if (totalRequestedQuantity <= availableInventory) {
    return {
      isValid: true,
      maxAllowedQuantity: availableInventory,
    };
  }

  return {
    isValid: false,
    maxAllowedQuantity: availableInventory,
    error: `Only ${availableInventory} items available in stock`,
  };
}

/**
 * Debounce function for cart updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Cart item interface for type safety
 */
export interface CartItem {
  id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    inventory: number;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

/**
 * Cart summary interface
 */
export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  qualifiesForFreeShipping: boolean;
}

/**
 * Transform cart data to summary
 */
export function transformCartToSummary(
  cartData: {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
  },
  options?: {
    shippingThreshold?: number;
    shippingCost?: number;
    taxRate?: number;
    discountAmount?: number;
  }
): CartSummary {
  const totals = calculateCartTotals(cartData.items, options);

  return {
    items: cartData.items,
    itemCount: cartData.itemCount,
    subtotal: cartData.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
    qualifiesForFreeShipping: totals.qualifiesForFreeShipping,
  };
}
