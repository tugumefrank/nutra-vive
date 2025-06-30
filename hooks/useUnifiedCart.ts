// import { useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useCartStore } from "@/store/cartStore";

// /**
//  * Unified cart hook that provides all cart functionality
//  * This ensures all components are synchronized and use the same state
//  */
// export function useUnifiedCart() {
//   const { user } = useUser();

//   // Get all cart state and actions from the store
//   const {
//     cart,
//     isOpen,
//     loading,
//     initializing,
//     error,
//     stats,
//     openCart,
//     closeCart,
//     initializeCart,
//     addToCartOptimistic,
//     updateQuantityOptimistic,
//     removeFromCartOptimistic,
//     clearCartOptimistic,
//     isInCart,
//     getItemQuantity,
//     refreshCart,
//   } = useCartStore();

//   // Initialize cart when user becomes available
//   useEffect(() => {
//     if (user && initializing) {
//       initializeCart();
//     }
//   }, [user, initializing, initializeCart]);

//   // Wrapper functions that handle authentication checks
//   const addToCart = async (product: any, quantity: number = 1) => {
//     if (!user) {
//       throw new Error("User must be authenticated");
//     }
//     return addToCartOptimistic(product, quantity);
//   };

//   const updateQuantity = async (productId: string, quantity: number) => {
//     if (!user) {
//       throw new Error("User must be authenticated");
//     }
//     return updateQuantityOptimistic(productId, quantity);
//   };

//   const removeFromCart = async (productId: string) => {
//     if (!user) {
//       throw new Error("User must be authenticated");
//     }
//     return removeFromCartOptimistic(productId);
//   };

//   const clearCart = async () => {
//     if (!user) {
//       throw new Error("User must be authenticated");
//     }
//     return clearCartOptimistic();
//   };

//   return {
//     // State
//     cart: user ? cart : null,
//     isOpen,
//     loading,
//     initializing,
//     error,
//     stats: user ? stats : { totalItems: 0, totalPrice: 0, itemCount: 0 },

//     // UI Actions
//     openCart,
//     closeCart,

//     // Cart Operations (with auth checks)
//     addToCart,
//     updateQuantity,
//     removeFromCart,
//     clearCart,
//     refreshCart,

//     // Utility functions
//     isInCart: user ? isInCart : () => false,
//     getItemQuantity: user ? getItemQuantity : () => 0,

//     // Authentication state
//     isAuthenticated: !!user,
//   };
// }
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";

/**
 * Unified cart hook that provides all cart functionality
 * This ensures all components are synchronized and use the same state
 */
export function useUnifiedCart() {
  const { user } = useUser();

  // Get all cart state and actions from the store
  const {
    cart,
    isOpen,
    loading,
    initializing,
    error,
    stats,
    openCart,
    closeCart,
    initializeCart,
    addToCartOptimistic,
    updateQuantityOptimistic,
    removeFromCartOptimistic,
    clearCartOptimistic,
    isInCart,
    getItemQuantity,
    refreshCart,
  } = useCartStore();

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
    stats: user ? stats : { totalItems: 0, totalPrice: 0, itemCount: 0 },

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
