// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { Product } from "@/lib/db/schema";
// import { CartItem, CartStore } from "@/types";
// import { calculateTax, calculateShipping } from "@/lib/utils";

// const useCartStore = create<CartStore>()(
//   persist(
//     (set, get) => ({
//       items: [],
//       isOpen: false,

//       addItem: (product: Product, quantity = 1) => {
//         set((state) => {
//           const existingItem = state.items.find(
//             (item) => item.productId === product.id
//           );

//           if (existingItem) {
//             // Update quantity of existing item
//             return {
//               items: state.items.map((item) =>
//                 item.productId === product.id
//                   ? {
//                       ...item,
//                       quantity: item.quantity + quantity,
//                       totalPrice: (item.quantity + quantity) * item.price,
//                     }
//                   : item
//               ),
//             };
//           } else {
//             // Add new item
//             const newItem: CartItem = {
//               id: `${product.id}-${Date.now()}`,
//               productId: product.id,
//               product,
//               quantity,
//               price: parseFloat(product.price),
//               totalPrice: parseFloat(product.price) * quantity,
//             };

//             return {
//               items: [...state.items, newItem],
//             };
//           }
//         });
//       },

//       removeItem: (productId: string) => {
//         set((state) => ({
//           items: state.items.filter((item) => item.productId !== productId),
//         }));
//       },

//       updateQuantity: (productId: string, quantity: number) => {
//         if (quantity <= 0) {
//           get().removeItem(productId);
//           return;
//         }

//         set((state) => ({
//           items: state.items.map((item) =>
//             item.productId === productId
//               ? {
//                   ...item,
//                   quantity,
//                   totalPrice: quantity * item.price,
//                 }
//               : item
//           ),
//         }));
//       },

//       clearCart: () => {
//         set({ items: [] });
//       },

//       getItemCount: () => {
//         return get().items.reduce((total, item) => total + item.quantity, 0);
//       },

//       getSubtotal: () => {
//         return get().items.reduce((total, item) => total + item.totalPrice, 0);
//       },

//       openCart: () => set({ isOpen: true }),
//       closeCart: () => set({ isOpen: false }),
//       toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
//     }),
//     {
//       name: "nutra-vive-cart",
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({ items: state.items }), // Only persist items
//     }
//   )
// );

// // Helper hook for cart summary
// export const useCartSummary = () => {
//   const { items, getSubtotal } = useCartStore();

//   const subtotal = getSubtotal();
//   const tax = calculateTax(subtotal);
//   const shipping = calculateShipping(subtotal);
//   const total = subtotal + tax + shipping;

//   return {
//     items,
//     itemCount: items.reduce((total, item) => total + item.quantity, 0),
//     subtotal,
//     tax,
//     shipping,
//     discount: 0, // Will be calculated based on applied discount codes
//     total,
//   };
// };

// export default useCartStore;
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} from "@/lib/actions/cartServerActions";

export interface CartItem {
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
    isActive: boolean;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}

interface CartStats {
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

interface CartState {
  // State
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;

  // Computed
  stats: CartStats;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  initializeCart: () => Promise<void>;

  // Optimistic Cart Operations
  addToCartOptimistic: (product: any, quantity: number) => Promise<void>;
  updateQuantityOptimistic: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCartOptimistic: (productId: string) => Promise<void>;
  clearCartOptimistic: () => Promise<void>;

  // Utility functions
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  refreshCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    cart: null,
    isOpen: false,
    loading: false,
    initializing: true,
    error: null,

    // Computed stats
    get stats(): CartStats {
      const cart = get().cart;
      if (!cart?.items) {
        return { totalItems: 0, totalPrice: 0, itemCount: 0 };
      }

      const totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const itemCount = cart.items.length;

      return { totalItems, totalPrice, itemCount };
    },

    // Basic actions
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),

    // Initialize cart on app start
    initializeCart: async () => {
      try {
        set({ initializing: true, error: null });
        const result = await getCart();

        if (result.success && result.cart) {
          set({ cart: result.cart, initializing: false });
        } else {
          set({ cart: { items: [] }, initializing: false });
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
        set({
          cart: { items: [] },
          initializing: false,
          error: "Failed to load cart",
        });
      }
    },

    // Optimistic add to cart
    addToCartOptimistic: async (product: any, quantity: number) => {
      const currentCart = get().cart;
      if (!currentCart) return;

      // Create optimistic update
      const existingItemIndex = currentCart.items.findIndex(
        (item) => item.product._id === product._id
      );

      let optimisticCart: Cart;

      if (existingItemIndex >= 0) {
        // Update existing item
        optimisticCart = {
          ...currentCart,
          items: currentCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          _id: `temp-${Date.now()}`, // Temporary ID
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images || [],
            category: product.category,
            isActive: product.isActive,
          },
          quantity,
          price: product.price,
        };

        optimisticCart = {
          ...currentCart,
          items: [...currentCart.items, newItem],
        };
      }

      // Apply optimistic update immediately
      set({ cart: optimisticCart });

      try {
        // Make server call
        const result = await addToCart(product._id, quantity);

        if (result.success && result.cart) {
          // Replace with server response
          set({ cart: result.cart, error: null });
          toast.success(`${product.name} added to cart`);
        } else {
          throw new Error(result.error || "Failed to add to cart");
        }
      } catch (error) {
        // Revert optimistic update on error
        set({ cart: currentCart });
        toast.error(
          error instanceof Error ? error.message : "Failed to add to cart"
        );
        console.error("Add to cart failed:", error);
      }
    },

    // Optimistic quantity update
    updateQuantityOptimistic: async (productId: string, quantity: number) => {
      const currentCart = get().cart;
      if (!currentCart) return;

      let optimisticCart: Cart;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        optimisticCart = {
          ...currentCart,
          items: currentCart.items.filter(
            (item) => item.product._id !== productId
          ),
        };
      } else {
        // Update quantity
        optimisticCart = {
          ...currentCart,
          items: currentCart.items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          ),
        };
      }

      // Apply optimistic update immediately
      set({ cart: optimisticCart });

      try {
        // Make server call
        const result = await updateCartItem(productId, quantity);

        if (result.success && result.cart) {
          // Replace with server response
          set({ cart: result.cart, error: null });
        } else {
          throw new Error(result.error || "Failed to update cart");
        }
      } catch (error) {
        // Revert optimistic update on error
        set({ cart: currentCart });
        toast.error("Failed to update cart");
        console.error("Update cart failed:", error);
      }
    },

    // Optimistic remove from cart
    removeFromCartOptimistic: async (productId: string) => {
      const currentCart = get().cart;
      if (!currentCart) return;

      // Create optimistic update
      const optimisticCart: Cart = {
        ...currentCart,
        items: currentCart.items.filter(
          (item) => item.product._id !== productId
        ),
      };

      // Apply optimistic update immediately
      set({ cart: optimisticCart });

      try {
        // Make server call
        const result = await removeFromCart(productId);

        if (result.success && result.cart) {
          // Replace with server response
          set({ cart: result.cart, error: null });
          toast.success("Item removed from cart");
        } else {
          throw new Error(result.error || "Failed to remove from cart");
        }
      } catch (error) {
        // Revert optimistic update on error
        set({ cart: currentCart });
        toast.error("Failed to remove item");
        console.error("Remove from cart failed:", error);
      }
    },

    // Clear cart optimistically
    clearCartOptimistic: async () => {
      const currentCart = get().cart;
      if (!currentCart) return;

      // Apply optimistic update immediately
      set({ cart: { items: [] } });

      try {
        // Make server call (you'll need to add this action)
        // const result = await clearCart();
        // For now, we'll just keep the optimistic update
        toast.success("Cart cleared");
      } catch (error) {
        // Revert optimistic update on error
        set({ cart: currentCart });
        toast.error("Failed to clear cart");
        console.error("Clear cart failed:", error);
      }
    },

    // Utility functions
    isInCart: (productId: string) => {
      const cart = get().cart;
      return (
        cart?.items.some((item) => item.product._id === productId) || false
      );
    },

    getItemQuantity: (productId: string) => {
      const cart = get().cart;
      const item = cart?.items.find((item) => item.product._id === productId);
      return item?.quantity || 0;
    },

    // Refresh cart from server
    refreshCart: async () => {
      try {
        set({ loading: true, error: null });
        const result = await getCart();

        if (result.success && result.cart) {
          set({ cart: result.cart, loading: false });
        } else {
          set({ cart: { items: [] }, loading: false });
        }
      } catch (error) {
        console.error("Failed to refresh cart:", error);
        set({ loading: false, error: "Failed to refresh cart" });
      }
    },
  }))
);
