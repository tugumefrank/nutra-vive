"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useFavoritesStore } from "@/store/favoritesStore";

/**
 * FavoritesProvider - Initializes favorites when user becomes available
 * Place this in your root layout to ensure favorites are initialized on app start
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { initializeFavorites, initializing } = useFavoritesStore();

  useEffect(() => {
    // Only initialize favorites when Clerk is loaded and we have a user
    if (isLoaded && user && initializing) {
      initializeFavorites();
    }
  }, [isLoaded, user, initializing, initializeFavorites]);

  return <>{children}</>;
}
