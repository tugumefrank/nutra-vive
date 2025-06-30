import { useFavoritesStore } from "@/store/favoritesStore";

/**
 * Optimized favorites selectors for specific data subscriptions
 * These ensure components only re-render when their specific data changes
 */
export const useFavoritesSelectors = () => {
  // Subscribe only to count - optimized for header/nav components
  const count = useFavoritesStore((state) => state.count);

  // Subscribe only to loading states
  const loading = useFavoritesStore((state) => state.loading);
  const initializing = useFavoritesStore((state) => state.initializing);

  return {
    count,
    loading,
    initializing,
  };
};

/**
 * Optimized hook specifically for favorites count display
 * Perfect for header and mobile nav favorites icons
 */
export const useFavoritesCount = () => {
  return useFavoritesStore((state) => state.count);
};

/**
 * Optimized hook for checking if a specific product is favorited
 * Perfect for product cards and quick views
 */
export const useIsFavorite = (productId: string) => {
  return useFavoritesStore((state) => state.isFavorite(productId));
};
