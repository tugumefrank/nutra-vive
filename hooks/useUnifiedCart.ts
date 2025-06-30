import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUnifiedCartStore } from "@/store/unifiedCartStore";

/**
 * Unified cart hook that provides all cart functionality
 * This ensures all components are synchronized and use the same state
 */
export function useUnifiedCart() {
  const { user } = useUser();

  // Get all cart state and actions from the store
  const cart = useUnifiedCartStore((state) => state.cart);
  const isOpen = useUnifiedCartStore((state) => state.isOpen);
  const loading = useUnifiedCartStore((state) => state.loading);
  const initializing = useUnifiedCartStore((state) => state.initializing);
  const error = useUnifiedCartStore((state) => state.error);
  const stats = useUnifiedCartStore((state) => state.stats);
  const openCart = useUnifiedCartStore((state) => state.openCart);
  const closeCart = useUnifiedCartStore((state) => state.closeCart);
  const initializeCart = useUnifiedCartStore((state) => state.initializeCart);
  const addToCartOptimistic = useUnifiedCartStore(
    (state) => state.addToCartOptimistic
  );
  const updateQuantityOptimistic = useUnifiedCartStore(
    (state) => state.updateQuantityOptimistic
  );
  const removeFromCartOptimistic = useUnifiedCartStore(
    (state) => state.removeFromCartOptimistic
  );
  const clearCartOptimistic = useUnifiedCartStore(
    (state) => state.clearCartOptimistic
  );
  const isInCart = useUnifiedCartStore((state) => state.isInCart);
  const getItemQuantity = useUnifiedCartStore((state) => state.getItemQuantity);
  const refreshCart = useUnifiedCartStore((state) => state.refreshCart);

  // Initialize cart when user becomes available
  useEffect(() => {
    if (user && initializing) {
      initializeCart();
    }
  }, [user, initializing, initializeCart]);

  // Wrapper functions that handle authentication checks
  const addToCart = async (product: any, quantity: number = 1) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    return addToCartOptimistic(product, quantity);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    return updateQuantityOptimistic(productId, quantity);
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    return removeFromCartOptimistic(productId);
  };

  const clearCart = async () => {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    return clearCartOptimistic();
  };

  return {
    // State
    cart: user ? cart : null,
    isOpen,
    loading,
    initializing,
    error,
    stats: user ? stats : { 
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
      taxAmount: 0 
    },

    // UI Actions
    openCart,
    closeCart,

    // Cart Operations (with auth checks)
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,

    // Utility functions
    isInCart: user ? isInCart : () => false,
    getItemQuantity: user ? getItemQuantity : () => 0,

    // Authentication state
    isAuthenticated: !!user,
  };
}
