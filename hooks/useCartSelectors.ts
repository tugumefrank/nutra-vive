import { useCartStore } from "@/store/cartStore";

/**
 * Optimized cart selectors for specific data subscriptions
 * These ensure components only re-render when their specific data changes
 */
export const useCartSelectors = () => {
  // Subscribe only to stats - optimized for header/nav components
  const stats = useCartStore((state) => state.stats);

  // Subscribe only to cart open state
  const isOpen = useCartStore((state) => state.isOpen);

  // Subscribe only to loading states
  const loading = useCartStore((state) => state.loading);
  const initializing = useCartStore((state) => state.initializing);

  // Subscribe to actions (these don't cause re-renders)
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);

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
  return useCartStore((state) => state.stats.totalItems);
};

/**
 * Optimized hook for cart item count (different from total items)
 * totalItems = sum of all quantities, itemCount = number of unique products
 */
export const useCartItemCount = () => {
  return useCartStore((state) => state.stats.itemCount);
};
