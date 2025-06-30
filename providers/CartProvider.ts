// "use client";

// import React from "react";
// import { useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useCartStore } from "@/store/cartStore";

// /**
//  * CartProvider - Initializes cart when user becomes available
//  * Place this in your root layout to ensure cart is initialized on app start
//  */
// export function CartProvider({ children }: { children: React.ReactNode }) {
//   const { user, isLoaded } = useUser();
//   const { initializeCart, initializing } = useCartStore();

//   useEffect(() => {
//     // Only initialize cart when Clerk is loaded and we have a user
//     if (isLoaded && user && initializing) {
//       initializeCart();
//     }
//   }, [isLoaded, user, initializing, initializeCart]);

//   return { children };
// }
"use client";

import React, { useEffect } from "react";

import { useUser } from "@clerk/nextjs";
import { useMembershipCartStore } from "@/store/membershipCartStore";

interface MembershipCartProviderProps {
  children: React.ReactNode;
}

export function MembershipCartProvider({
  children,
}: MembershipCartProviderProps) {
  const { user, isLoaded } = useUser();
  const { initializeCart, initializing } = useMembershipCartStore();

  useEffect(() => {
    // Only initialize cart when Clerk is loaded
    if (isLoaded && !initializing) {
      console.log("Initializing membership cart...");
      initializeCart();
    }
  }, [isLoaded, initializing, initializeCart]);

  return { children };
}

// Export a simplified hook for components that need cart state
export function useMembershipCartState() {
  const {
    cart,
    stats,
    loading,
    initializing,
    isOpen,
    openCart,
    closeCart,
    addToCartOptimistic,
    updateQuantityOptimistic,
    removeFromCartOptimistic,
    isInCart,
    getItemQuantity,
    getItemMembershipInfo,
  } = useMembershipCartStore();

  return {
    // State
    cart,
    stats,
    loading,
    initializing,
    isOpen,

    // Computed values
    isEmpty: !cart || cart.items.length === 0,
    hasItems: cart && cart.items.length > 0,
    hasMembershipBenefits: cart?.hasMembershipApplied || false,
    hasPromotions: cart?.hasPromotionApplied || false,

    // Actions
    openCart,
    closeCart,
    addToCart: addToCartOptimistic,
    updateQuantity: updateQuantityOptimistic,
    removeFromCart: removeFromCartOptimistic,

    // Utilities
    isInCart,
    getQuantity: getItemQuantity,
    getMembershipInfo: getItemMembershipInfo,
  };
}
