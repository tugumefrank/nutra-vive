"use client";

import React from "react";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";

/**
 * CartProvider - Initializes cart when user becomes available
 * Place this in your root layout to ensure cart is initialized on app start
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { initializeCart, initializing } = useCartStore();

  useEffect(() => {
    // Only initialize cart when Clerk is loaded and we have a user
    if (isLoaded && user && initializing) {
      initializeCart();
    }
  }, [isLoaded, user, initializing, initializeCart]);

  return { children };
}
