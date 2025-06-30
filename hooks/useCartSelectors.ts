import { useUnifiedCartStore } from "@/store/unifiedCartStore";

/**
 * Optimized cart selectors for specific data subscriptions
 * These ensure components only re-render when their specific data changes
 */
export const useCartSelectors = () => {
  // Subscribe only to stats - optimized for header/nav components
  const stats = useUnifiedCartStore((state) => state.stats);

  // Subscribe only to cart open state
  const isOpen = useUnifiedCartStore((state) => state.isOpen);

  // Subscribe only to loading states
  const loading = useUnifiedCartStore((state) => state.loading);
  const initializing = useUnifiedCartStore((state) => state.initializing);

  // Subscribe to actions (these don't cause re-renders)
  const openCart = useUnifiedCartStore((state) => state.openCart);
  const closeCart = useUnifiedCartStore((state) => state.closeCart);

  return {
    stats,
    isOpen,
    loading,
    initializing,
    openCart,
    closeCart,
  };
};

/**
 * Optimized hook specifically for cart count display
 * Perfect for header and mobile nav cart icons
 */
export const useCartCount = () => {
  return useUnifiedCartStore((state) => state.stats.totalItems);
};

/**
 * Optimized hook for cart item count (different from total items)
 * totalItems = sum of all quantities, itemCount = number of unique products
 */
export const useCartItemCount = () => {
  return useUnifiedCartStore((state) => state.stats.itemCount);
};
