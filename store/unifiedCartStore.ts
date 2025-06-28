// lib/stores/unifiedCartStore.ts
import { create } from "zustand";
import { shallow, useShallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";
import { debounce } from "lodash";

// Import our unified types and actions
import { UnifiedCart, UnifiedCartItem } from "@/types/unifiedCart";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyPromotionToCart,
  removePromotionFromCart,
  validatePromotionCode,
  refreshCartPrices,
} from "@/lib/actions/unifiedCartServerActions";
import { useCallback } from "react";

// Enhanced cart stats for unified system
interface UnifiedCartStats {
  totalItems: number; // Total quantity of all items
  subtotal: number; // Original total (before discounts)
  membershipDiscount: number; // Total membership savings
  promotionDiscount: number; // Total promotion savings
  totalSavings: number; // Total of all savings
  finalTotal: number; // Final price after all discounts/shipping/tax
  itemCount: number; // Number of unique items
  freeItems: number; // Items free from membership
  paidItems: number; // Items user pays for
  shippingAmount: number; // Shipping cost
  taxAmount: number; // Tax amount
}

interface UnifiedCartState {
  // Core State
  cart: UnifiedCart | null;
  isOpen: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;

  // Enhanced Stats (reactive, not computed)
  stats: UnifiedCartStats;

  // Loading States for specific operations
  isAddingToCart: Record<string, boolean>; // productId -> isLoading
  isUpdatingItem: Record<string, boolean>; // productId -> isLoading
  isRemovingItem: Record<string, boolean>; // productId -> isLoading
  isApplyingPromotion: boolean;
  isRemovingPromotion: boolean;

  // Promotion State
  promotionCodeInput: string;
  promotionValidationError: string | null;

  // Basic Cart Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  initializeCart: () => Promise<void>;

  // Optimistic Cart Operations (with debouncing)
  addToCartOptimistic: (product: any, quantity: number) => Promise<void>;
  updateQuantityOptimistic: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCartOptimistic: (productId: string) => Promise<void>;
  clearCartOptimistic: () => Promise<void>;

  // Debounced operations for rapid clicks
  debouncedUpdateQuantity: (productId: string, quantity: number) => void;
  debouncedAddToCart: (product: any, quantity: number) => void;

  // Promotion Operations
  setPromotionCodeInput: (code: string) => void;
  validatePromotionCodeInput: () => Promise<boolean>;
  applyPromotionOptimistic: (code: string) => Promise<void>;
  removePromotionOptimistic: () => Promise<void>;

  // Utility Functions
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItem: (productId: string) => UnifiedCartItem | null;
  refreshCart: () => Promise<void>;
  refreshCartPrices: () => Promise<void>;

  // Membership Utilities
  getMembershipSavingsForProduct: (productId: string) => number;
  getRemainingAllocation: (categoryId: string) => number;
  canGetFreeFromMembership: (productId: string, quantity?: number) => boolean;

  // Promotion Utilities
  canApplyPromotion: () => boolean;
  getPromotionEligibleTotal: () => number;
}

export const useUnifiedCartStore = create<UnifiedCartState>()(
  subscribeWithSelector((set, get) => {
    // Helper function to calculate comprehensive stats
    const calculateStats = (cart: UnifiedCart | null): UnifiedCartStats => {
      if (!cart || !cart.items.length) {
        return {
          totalItems: 0,
          subtotal: 0,
          membershipDiscount: 0,
          promotionDiscount: 0,
          totalSavings: 0,
          finalTotal: 0,
          itemCount: 0,
          freeItems: 0,
          paidItems: 0,
          shippingAmount: 0,
          taxAmount: 0,
        };
      }

      return {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        membershipDiscount: cart.membershipDiscount,
        promotionDiscount: cart.promotionDiscount,
        totalSavings: cart.membershipDiscount + cart.promotionDiscount,
        finalTotal: cart.finalTotal,
        itemCount: cart.items.length,
        freeItems: cart.freeItems,
        paidItems: cart.paidItems,
        shippingAmount: cart.shippingAmount,
        taxAmount: cart.taxAmount,
      };
    };

    // Create debounced functions
    const debouncedUpdateQuantityInternal = debounce(
      async (productId: string, quantity: number) => {
        const state = get();
        try {
          const result = await updateCartItem(productId, quantity);

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              error: null,
              isUpdatingItem: { ...state.isUpdatingItem, [productId]: false },
            });

            if (quantity === 0) {
              toast.success("Item removed from cart");
            }
          } else {
            throw new Error(result.error || "Failed to update cart");
          }
        } catch (error) {
          // Revert will be handled by the calling function
          set({
            isUpdatingItem: { ...state.isUpdatingItem, [productId]: false },
          });
          toast.error("Failed to update cart");
          console.error("Update cart failed:", error);
        }
      },
      300 // 300ms delay
    );

    const debouncedAddToCartInternal = debounce(
      async (product: any, quantity: number) => {
        const state = get();
        try {
          const result = await addToCart(product._id, quantity);

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              error: null,
              isAddingToCart: { ...state.isAddingToCart, [product._id]: false },
            });

            // Show success message with membership info if applicable
            if (result.membershipInfo?.wasApplied) {
              toast.success(
                `${product.name} added to cart! Saved $${result.membershipInfo.savings.toFixed(2)} with membership`
              );
            } else {
              toast.success(`${product.name} added to cart`);
            }
          } else {
            throw new Error(result.error || "Failed to add to cart");
          }
        } catch (error) {
          set({
            isAddingToCart: { ...state.isAddingToCart, [product._id]: false },
          });
          toast.error(
            error instanceof Error ? error.message : "Failed to add to cart"
          );
          console.error("Add to cart failed:", error);
        }
      },
      200 // 200ms delay for add operations
    );

    return {
      // Initial State
      cart: null,
      isOpen: false,
      loading: false,
      initializing: true,
      error: null,
      stats: calculateStats(null),

      // Loading States
      isAddingToCart: {},
      isUpdatingItem: {},
      isRemovingItem: {},
      isApplyingPromotion: false,
      isRemovingPromotion: false,

      // Promotion State
      promotionCodeInput: "",
      promotionValidationError: null,

      // Basic Actions
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Initialize cart on app start
      initializeCart: async () => {
        try {
          set({ initializing: true, error: null });
          const result = await getCart();

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              initializing: false,
              error: null,
            });
          } else {
            // Empty cart state
            const newStats = calculateStats(null);
            set({
              cart: null,
              stats: newStats,
              initializing: false,
              error: null,
            });
          }
        } catch (error) {
          console.error("Failed to initialize cart:", error);
          const newStats = calculateStats(null);
          set({
            cart: null,
            stats: newStats,
            initializing: false,
            error: "Failed to load cart",
          });
        }
      },

      // Optimistic add to cart
      addToCartOptimistic: async (product: any, quantity: number) => {
        const state = get();
        const productId = product._id;

        // Prevent multiple simultaneous additions
        if (state.isAddingToCart[productId]) {
          return;
        }

        set({
          isAddingToCart: { ...state.isAddingToCart, [productId]: true },
        });

        // If no cart exists, create empty one for optimistic update
        const currentCart = state.cart || {
          _id: "",
          items: [],
          subtotal: 0,
          membershipDiscount: 0,
          promotionDiscount: 0,
          afterDiscountsTotal: 0,
          shippingAmount: 0,
          taxAmount: 0,
          finalTotal: 0,
          totalItems: 0,
          freeItems: 0,
          paidItems: 0,
          hasPromotionApplied: false,
          hasMembershipApplied: false,
          canApplyPromotion: true,
          hasEligibleItems: true,
        };

        // Create optimistic update
        const existingItemIndex = currentCart.items.findIndex(
          (item) => item.product._id === productId
        );

        let optimisticCart: UnifiedCart;

        if (existingItemIndex >= 0) {
          // Update existing item optimistically
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        } else {
          // Add new item optimistically (simplified - real calculation happens server-side)
          const newItem: UnifiedCartItem = {
            _id: `temp-${Date.now()}`,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images || [],
              category: product.category,
              promotionEligible: product.promotionEligible,
              isDiscounted: product.isDiscounted,
            },
            quantity,
            originalPrice: product.compareAtPrice || product.price,
            regularPrice: product.price,
            membershipPrice: product.price, // Will be calculated server-side
            promotionPrice: product.price,
            finalPrice: product.price,
            freeFromMembership: 0, // Will be calculated server-side
            paidQuantity: quantity,
            membershipSavings: 0,
            promotionSavings: 0,
            totalSavings: 0,
            membershipEligible: false,
            categoryId: product.category?._id,
            categoryName: product.category?.name,
            usesAllocation: false,
          };

          optimisticCart = {
            ...currentCart,
            items: [...currentCart.items, newItem],
            totalItems: currentCart.totalItems + quantity,
          };
        }

        // Apply optimistic update immediately
        const newStats = calculateStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        // Make actual server call (debounced)
        try {
          await debouncedAddToCartInternal(product, quantity);
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateStats(currentCart);
          set({
            cart: currentCart,
            stats: revertStats,
            isAddingToCart: { ...state.isAddingToCart, [productId]: false },
          });
        }
      },

      // Optimistic quantity update with debouncing
      updateQuantityOptimistic: async (productId: string, quantity: number) => {
        const state = get();

        // Prevent multiple simultaneous updates
        if (state.isUpdatingItem[productId]) {
          return;
        }

        const currentCart = state.cart;
        if (!currentCart) return;

        set({
          isUpdatingItem: { ...state.isUpdatingItem, [productId]: true },
        });

        let optimisticCart: UnifiedCart;

        if (quantity <= 0) {
          // Remove item optimistically
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.filter(
              (item) => item.product._id !== productId
            ),
          };
        } else {
          // Update quantity optimistically
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.map((item) =>
              item.product._id === productId
                ? { ...item, quantity, paidQuantity: quantity } // Simplified
                : item
            ),
          };
        }

        // Apply optimistic update immediately
        const newStats = calculateStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        // Make actual server call (debounced)
        try {
          await debouncedUpdateQuantityInternal(productId, quantity);
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateStats(currentCart);
          set({
            cart: currentCart,
            stats: revertStats,
            isUpdatingItem: { ...state.isUpdatingItem, [productId]: false },
          });
        }
      },

      // Debounced wrapper functions for rapid clicks
      debouncedUpdateQuantity: (productId: string, quantity: number) => {
        get().updateQuantityOptimistic(productId, quantity);
      },

      debouncedAddToCart: (product: any, quantity: number) => {
        get().addToCartOptimistic(product, quantity);
      },

      // Optimistic remove from cart
      removeFromCartOptimistic: async (productId: string) => {
        const state = get();

        if (state.isRemovingItem[productId]) {
          return;
        }

        const currentCart = state.cart;
        if (!currentCart) return;

        set({
          isRemovingItem: { ...state.isRemovingItem, [productId]: true },
        });

        // Create optimistic update
        const optimisticCart: UnifiedCart = {
          ...currentCart,
          items: currentCart.items.filter(
            (item) => item.product._id !== productId
          ),
        };

        // Apply optimistic update immediately
        const newStats = calculateStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        try {
          const result = await removeFromCart(productId);

          if (result.success && result.cart) {
            const serverStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: serverStats,
              error: null,
              isRemovingItem: { ...state.isRemovingItem, [productId]: false },
            });
            toast.success("Item removed from cart");
          } else {
            throw new Error(result.error || "Failed to remove from cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateStats(currentCart);
          set({
            cart: currentCart,
            stats: revertStats,
            isRemovingItem: { ...state.isRemovingItem, [productId]: false },
          });
          toast.error("Failed to remove item");
          console.error("Remove from cart failed:", error);
        }
      },

      // Clear cart optimistically
      clearCartOptimistic: async () => {
        const currentCart = get().cart;
        if (!currentCart) return;

        // Apply optimistic update immediately
        const newStats = calculateStats(null);
        set({ cart: null, stats: newStats });

        try {
          const result = await clearCart();
          if (result.success) {
            toast.success("Cart cleared");
          } else {
            throw new Error("Failed to clear cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateStats(currentCart);
          set({ cart: currentCart, stats: revertStats });
          toast.error("Failed to clear cart");
          console.error("Clear cart failed:", error);
        }
      },

      // Promotion Actions
      setPromotionCodeInput: (code: string) => {
        set({
          promotionCodeInput: code,
          promotionValidationError: null,
        });
      },

      validatePromotionCodeInput: async () => {
        const code = get().promotionCodeInput.trim();
        if (!code) return false;

        try {
          const result = await validatePromotionCode(code);
          if (result.isValid) {
            set({ promotionValidationError: null });
            return true;
          } else {
            set({ promotionValidationError: result.error || "Invalid code" });
            return false;
          }
        } catch (error) {
          set({ promotionValidationError: "Failed to validate code" });
          return false;
        }
      },

      applyPromotionOptimistic: async (code: string) => {
        const state = get();
        if (state.isApplyingPromotion) return;

        set({ isApplyingPromotion: true, promotionValidationError: null });

        try {
          const result = await applyPromotionToCart(code);

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              isApplyingPromotion: false,
              promotionCodeInput: "",
              error: null,
            });

            if (result.promotionInfo?.wasApplied) {
              toast.success(
                `Promotion applied! You saved $${result.promotionInfo.savings.toFixed(2)}`
              );
            }
          } else {
            set({
              isApplyingPromotion: false,
              promotionValidationError:
                result.error || "Failed to apply promotion",
            });
            toast.error(result.error || "Failed to apply promotion");
          }
        } catch (error) {
          set({
            isApplyingPromotion: false,
            promotionValidationError: "Failed to apply promotion",
          });
          toast.error("Failed to apply promotion");
          console.error("Apply promotion failed:", error);
        }
      },

      removePromotionOptimistic: async () => {
        const state = get();
        if (state.isRemovingPromotion) return;

        set({ isRemovingPromotion: true });

        try {
          const result = await removePromotionFromCart();

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              isRemovingPromotion: false,
              error: null,
            });
            toast.success("Promotion removed");
          } else {
            throw new Error("Failed to remove promotion");
          }
        } catch (error) {
          set({ isRemovingPromotion: false });
          toast.error("Failed to remove promotion");
          console.error("Remove promotion failed:", error);
        }
      },

      // Utility Functions
      isInCart: (productId: string) => {
        const cart = get().cart;
        return (
          cart?.items.some((item) => item.product._id === productId) || false
        );
      },

      getItemQuantity: (productId: string) => {
        const cart = get().cart;
        const item = cart?.items.find((item) => item.product._id === productId);
        return item?.quantity || 0;
      },

      getItem: (productId: string) => {
        const cart = get().cart;
        return (
          cart?.items.find((item) => item.product._id === productId) || null
        );
      },

      refreshCart: async () => {
        try {
          set({ loading: true, error: null });
          const result = await getCart();

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({ cart: result.cart, stats: newStats, loading: false });
          } else {
            const newStats = calculateStats(null);
            set({ cart: null, stats: newStats, loading: false });
          }
        } catch (error) {
          console.error("Failed to refresh cart:", error);
          set({ loading: false, error: "Failed to refresh cart" });
        }
      },

      // Refresh cart prices to reflect updated product prices (e.g., after auto-discounts)
      refreshCartPrices: async () => {
        try {
          set({ loading: true, error: null });
          
          // Try server action first
          const result = await refreshCartPrices();

          if (result.success && result.cart) {
            const newStats = calculateStats(result.cart);
            set({ cart: result.cart, stats: newStats, loading: false });
            console.log("✅ Cart prices refreshed successfully");
          } else {
            throw new Error(result.error || "Failed to refresh cart prices");
          }
        } catch (error) {
          console.error("Failed to refresh cart prices:", error);
          
          // Fallback: try API endpoint
          try {
            const response = await fetch('/api/cart/refresh-prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            const apiResult = await response.json();
            
            if (apiResult.success && apiResult.cart) {
              const newStats = calculateStats(apiResult.cart);
              set({ cart: apiResult.cart, stats: newStats, loading: false });
              console.log("✅ Cart prices refreshed via API");
            } else {
              throw new Error(apiResult.error || "API refresh failed");
            }
          } catch (apiError) {
            console.error("Failed to refresh cart prices via API:", apiError);
            set({ loading: false, error: "Failed to refresh cart prices" });
          }
        }
      },

      // Membership Utilities
      getMembershipSavingsForProduct: (productId: string) => {
        const item = get().getItem(productId);
        return item?.membershipSavings || 0;
      },

      getRemainingAllocation: (categoryId: string) => {
        const cart = get().cart;
        if (!cart?.membershipInfo) return 0;

        const allocation = cart.membershipInfo.allocationsUsed.find(
          (alloc) => alloc.categoryId === categoryId
        );
        return allocation?.remaining || 0;
      },

      canGetFreeFromMembership: (productId: string, quantity: number = 1) => {
        const cart = get().cart;
        const item = get().getItem(productId);

        if (!cart?.membershipInfo || !item?.categoryId) return false;

        const remaining = get().getRemainingAllocation(item.categoryId);
        return remaining >= quantity;
      },

      // Promotion Utilities
      canApplyPromotion: () => {
        const cart = get().cart;
        return cart?.canApplyPromotion || false;
      },

      getPromotionEligibleTotal: () => {
        const cart = get().cart;
        if (!cart) return 0;

        // Calculate total of paid items that are promotion eligible
        return cart.items.reduce((total, item) => {
          if (
            item.product.promotionEligible !== false &&
            item.paidQuantity > 0
          ) {
            return total + item.paidQuantity * item.regularPrice;
          }
          return total;
        }, 0);
      },
    };
  })
);

// Export hooks for specific functionality
export const useCartStats = () =>
  useUnifiedCartStore(useShallow((state) => state.stats));
export const useCartItems = () =>
  useUnifiedCartStore(useShallow((state) => state.cart?.items || []));
export const useCartDrawer = () =>
  useUnifiedCartStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      openCart: state.openCart,
      closeCart: state.closeCart,
      toggleCart: state.toggleCart,
    }))
  );
// Instead of one hook returning an object, create individual hooks:
export const useCartLoadingState = () =>
  useUnifiedCartStore((state) => state.loading);
export const useCartInitializing = () =>
  useUnifiedCartStore((state) => state.initializing);
export const useIsAddingToCart = () =>
  useUnifiedCartStore((state) => state.isAddingToCart);
export const useIsUpdatingItem = () =>
  useUnifiedCartStore((state) => state.isUpdatingItem);
export const useIsRemovingItem = () =>
  useUnifiedCartStore((state) => state.isRemovingItem);
export const useCartPromotion = () =>
  useUnifiedCartStore(
    useShallow((state) => ({
      // Wrap the selector with useShallow
      promotionCodeInput: state.promotionCodeInput,
      promotionValidationError: state.promotionValidationError,
      isApplyingPromotion: state.isApplyingPromotion,
      isRemovingPromotion: state.isRemovingPromotion,
      hasPromotionApplied: state.cart?.hasPromotionApplied || false,
      promotionCode: state.cart?.promotionCode,
      promotionName: state.cart?.promotionName,
      promotionDiscount: state.cart?.promotionDiscount || 0,
      setPromotionCodeInput: state.setPromotionCodeInput,
      validatePromotionCodeInput: state.validatePromotionCodeInput,
      applyPromotionOptimistic: state.applyPromotionOptimistic,
      removePromotionOptimistic: state.removePromotionOptimistic,
      canApplyPromotion: state.canApplyPromotion,
    }))
  );

// Hook for cart price refresh functionality
export const useCartPriceRefresh = () =>
  useUnifiedCartStore((state) => ({
    refreshCartPrices: state.refreshCartPrices,
    loading: state.loading,
  }));
