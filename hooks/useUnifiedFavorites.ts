import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useFavoritesStore } from "@/store/favoritesStore";

/**
 * Unified favorites hook that provides all favorites functionality
 * This ensures all components are synchronized and use the same state
 */
export function useUnifiedFavorites() {
  const { user } = useUser();

  // Get all favorites state and actions from the store
  const {
    favoriteIds,
    items,
    loading,
    initializing,
    error,
    count,
    initializeFavorites,
    toggleFavoriteOptimistic,
    isFavorite,
    refreshFavorites,
  } = useFavoritesStore();

  // Initialize favorites when user becomes available
  useEffect(() => {
    if (user && initializing) {
      initializeFavorites();
    }
  }, [user, initializing, initializeFavorites]);

  // Wrapper function that handles authentication checks
  const toggleFavorite = async (productId: string, productName: string) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }
    return toggleFavoriteOptimistic(productId, productName);
  };

  return {
    // State
    favoriteIds: user ? favoriteIds : [],
    items: user ? items : [],
    loading,
    initializing,
    error,
    count: user ? count : 0,

    // Favorites Operations (with auth checks)
    toggleFavorite,
    refreshFavorites,

    // Utility functions
    isFavorite: user ? isFavorite : () => false,

    // Authentication state
    isAuthenticated: !!user,
  };
}
