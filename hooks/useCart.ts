"use client";

import {
  useState,
  useEffect,
  useCallback,
  useOptimistic,
  startTransition,
} from "react";
import { useUser } from "@clerk/nextjs";
import {
  getCart,
  getCartStats,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/actions/cartServerActions";
import { toast } from "sonner";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category?: {
      _id: string;
      name: string;
    };
  };
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  _id: string | null;
}

interface CartStats {
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

// Custom event for cart updates
const CART_UPDATE_EVENT = "cart-update";

export const triggerCartRefresh = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT));
  }
};

// Optimistic cart actions
type OptimisticAction =
  | { type: "ADD_ITEM"; product: any; quantity: number }
  | { type: "UPDATE_ITEM"; productId: string; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string };

function cartReducer(state: CartState, action: OptimisticAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === action.product._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.quantity,
        };
        return { ...state, items: newItems };
      } else {
        // Add new item
        const newItem: CartItem = {
          _id: `temp_${Date.now()}`, // Temporary ID for optimistic update
          product: action.product,
          quantity: action.quantity,
          price: action.product.price,
        };
        return { ...state, items: [...state.items, newItem] };
      }
    }

    case "UPDATE_ITEM": {
      if (action.quantity === 0) {
        // Remove item if quantity is 0
        return {
          ...state,
          items: state.items.filter(
            (item) => item.product._id !== action.productId
          ),
        };
      }

      const newItems = state.items.map((item) =>
        item.product._id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return { ...state, items: newItems };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product._id !== action.productId
        ),
      };
    }

    default:
      return state;
  }
}

export function useOptimisticCart() {
  const { user, isLoaded } = useUser();
  const [cart, setCart] = useState<CartState>({ items: [], _id: null });
  const [optimisticCart, addOptimisticAction] = useOptimistic(
    cart,
    cartReducer
  );
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setCart({ items: [], _id: null });
        return;
      }

      const result = await getCart();

      if (result.success && result.cart) {
        setCart(result.cart);
      } else {
        setCart({ items: [], _id: null });
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
      setCart({ items: [], _id: null });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    return () =>
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
  }, [fetchCart]);

  // Initial load and when user changes
  useEffect(() => {
    if (isLoaded) {
      fetchCart();
    }
  }, [isLoaded, user, fetchCart]);

  // Optimistic add to cart
  const optimisticAddToCart = useCallback(
    async (product: any, quantity: number = 1) => {
      if (!user) {
        toast.info("Please sign in to add items to cart");
        return { success: false, error: "Not authenticated" };
      }

      // Optimistic update
      startTransition(() => {
        addOptimisticAction({ type: "ADD_ITEM", product, quantity });
      });

      try {
        // Server action
        const result = await addToCart(product._id, quantity);

        if (result.success) {
          // Update real cart state with server response
          if (result.cart) {
            setCart(result.cart);
          }
          toast.success(`${product.name} added to cart!`);
          return { success: true };
        } else {
          // Revert optimistic update on error
          fetchCart();
          toast.error(result.error || "Failed to add item to cart");
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on error
        fetchCart();
        console.error("Error adding to cart:", error);
        toast.error("Failed to add item to cart");
        return { success: false, error: "Network error" };
      }
    },
    [user, addOptimisticAction, fetchCart]
  );

  // Optimistic update quantity
  const optimisticUpdateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) {
        toast.info("Please sign in to manage cart");
        return { success: false, error: "Not authenticated" };
      }

      const previousCart = cart;

      // Optimistic update
      startTransition(() => {
        addOptimisticAction({ type: "UPDATE_ITEM", productId, quantity });
      });

      try {
        let result;
        if (quantity === 0) {
          result = await removeFromCart(productId);
        } else {
          result = await updateCartItem(productId, quantity);
        }

        if (result.success) {
          // Update real cart state with server response
          if (result.cart) {
            setCart(result.cart);
          }
          return { success: true };
        } else {
          // Revert optimistic update on error
          setCart(previousCart);
          toast.error(result.error || "Failed to update cart");
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on error
        setCart(previousCart);
        console.error("Error updating cart:", error);
        toast.error("Failed to update cart");
        return { success: false, error: "Network error" };
      }
    },
    [user, addOptimisticAction, cart]
  );

  // Optimistic remove from cart
  const optimisticRemoveFromCart = useCallback(
    async (productId: string) => {
      if (!user) {
        toast.info("Please sign in to manage cart");
        return { success: false, error: "Not authenticated" };
      }

      const previousCart = cart;
      const item = cart.items.find((item) => item.product._id === productId);

      // Optimistic update
      startTransition(() => {
        addOptimisticAction({ type: "REMOVE_ITEM", productId });
      });

      try {
        const result = await removeFromCart(productId);

        if (result.success) {
          // Update real cart state with server response
          if (result.cart) {
            setCart(result.cart);
          }
          toast.success(`${item?.product.name || "Item"} removed from cart`);
          return { success: true };
        } else {
          // Revert optimistic update on error
          setCart(previousCart);
          toast.error(result.error || "Failed to remove item");
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on error
        setCart(previousCart);
        console.error("Error removing from cart:", error);
        toast.error("Failed to remove item");
        return { success: false, error: "Network error" };
      }
    },
    [user, addOptimisticAction, cart]
  );

  // Helper functions
  const isInCart = useCallback(
    (productId: string): boolean => {
      return optimisticCart.items.some(
        (item) => item.product._id === productId
      );
    },
    [optimisticCart.items]
  );

  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = optimisticCart.items.find(
        (item) => item.product._id === productId
      );
      return item ? item.quantity : 0;
    },
    [optimisticCart.items]
  );

  // Calculate stats from optimistic cart
  const stats: CartStats = {
    totalItems: optimisticCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    ),
    totalPrice: optimisticCart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    ),
    itemCount: optimisticCart.items.length,
  };

  return {
    cart: optimisticCart,
    stats,
    loading,
    refresh: fetchCart,
    isInCart,
    getItemQuantity,
    addToCart: optimisticAddToCart,
    updateQuantity: optimisticUpdateQuantity,
    removeFromCart: optimisticRemoveFromCart,
  };
}
