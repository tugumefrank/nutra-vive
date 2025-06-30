"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseFavoritesReturn {
  favoriteIds: string[];
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleProductFavorite: (
    productId: string,
    productName?: string
  ) => Promise<void>;
  addToFavoritesList: (
    productId: string,
    productName?: string
  ) => Promise<void>;
  removeFromFavoritesList: (
    productId: string,
    productName?: string
  ) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's favorite IDs
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const ids = await getUserFavoriteIds();
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load favorites when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Check if product is in favorites
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favoriteIds.includes(productId);
    },
    [favoriteIds]
  );

  // Toggle favorite status with optimistic updates
  const toggleProductFavorite = useCallback(
    async (productId: string, productName = "Product") => {
      if (!user) {
        toast.info("Please sign in to manage favorites");
        return;
      }

      const wasInFavorites = isFavorite(productId);

      // Optimistic update - instant UI feedback
      setFavoriteIds((prev) =>
        wasInFavorites
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      try {
        const result = await toggleFavorite(productId);

        if (result.success) {
          // Show success message with heart emoji
          if (result.isFavorite) {
            toast.success(`${productName} added to favorites`, {
              icon: "❤️",
              duration: 2000,
            });
          } else {
            toast.success(`${productName} removed from favorites`, {
              icon: "💔",
              duration: 2000,
            });
          }
        } else {
          // Revert optimistic update on error
          setFavoriteIds((prev) =>
            wasInFavorites
              ? [...prev, productId]
              : prev.filter((id) => id !== productId)
          );
          toast.error(result.error || "Failed to update favorites");
        }
      } catch (error) {
        // Revert optimistic update on error
        setFavoriteIds((prev) =>
          wasInFavorites
            ? [...prev, productId]
            : prev.filter((id) => id !== productId)
        );
        console.error("Error toggling favorite:", error);
        toast.error("Failed to update favorites");
      }
    },
    [user, isFavorite]
  );

  // Add to favorites with optimistic updates
  const addToFavoritesList = useCallback(
    async (productId: string, productName = "Product") => {
      if (!user) {
        toast.info("Please sign in to manage favorites");
        return;
      }

      if (isFavorite(productId)) {
        toast.info(`${productName} is already in favorites`, {
          icon: "❤️",
          duration: 2000,
        });
        return;
      }

      // Optimistic update - instant UI feedback
      setFavoriteIds((prev) => [...prev, productId]);

      try {
        const result = await addToFavorites(productId);

        if (result.success) {
          toast.success(`${productName} added to favorites`, {
            icon: "❤️",
            duration: 2000,
          });
        } else {
          // Revert optimistic update on error
          setFavoriteIds((prev) => prev.filter((id) => id !== productId));
          toast.error(result.error || "Failed to add to favorites");
        }
      } catch (error) {
        // Revert optimistic update on error
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
        console.error("Error adding to favorites:", error);
        toast.error("Failed to add to favorites");
      }
    },
    [user, isFavorite]
  );

  // Remove from favorites with optimistic updates
  const removeFromFavoritesList = useCallback(
    async (productId: string, productName = "Product") => {
      if (!user) {
        toast.info("Please sign in to manage favorites");
        return;
      }

      if (!isFavorite(productId)) {
        toast.info(`${productName} is not in favorites`, {
          duration: 2000,
        });
        return;
      }

      // Optimistic update - instant UI feedback
      setFavoriteIds((prev) => prev.filter((id) => id !== productId));

      try {
        const result = await removeFromFavorites(productId);

        if (result.success) {
          toast.success(`${productName} removed from favorites`, {
            icon: "💔",
            duration: 2000,
          });
        } else {
          // Revert optimistic update on error
          setFavoriteIds((prev) => [...prev, productId]);
          toast.error(result.error || "Failed to remove from favorites");
        }
      } catch (error) {
        // Revert optimistic update on error
        setFavoriteIds((prev) => [...prev, productId]);
        console.error("Error removing from favorites:", error);
        toast.error("Failed to remove from favorites");
      }
    },
    [user, isFavorite]
  );

  // Refresh favorites from server
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favoriteIds,
    isLoading,
    isFavorite,
    toggleProductFavorite,
    addToFavoritesList,
    removeFromFavoritesList,
    refreshFavorites,
  };
}

// Higher-order component to provide favorites context
import { createContext, useContext, ReactNode } from "react";
import {
  addToFavorites,
  getUserFavoriteIds,
  removeFromFavorites,
  toggleFavorite,
} from "@/lib/actions/favouriteServerActions";
import React from "react";

const FavoritesContext = createContext<UseFavoritesReturn | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const favorites = useFavorites();

  return React.createElement(
    FavoritesContext.Provider,
    { value: favorites },
    children
  );
}

export function useOptimisticFavorites(): UseFavoritesReturn {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error(
      "useOptimisticFavorites must be used within a FavoritesProvider"
    );
  }
  return context;
}

// Standalone hook for components that don't need the provider
export { useFavorites as useStandaloneFavorites };
