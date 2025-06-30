import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";
import {
  getMembershipCart,
  addToMembershipCart,
  updateMembershipCartItem,
  removeFromMembershipCart,
  clearMembershipCart,
  type MembershipCartWithPromotion,
  type MembershipCartItem,
  type MembershipInfo,
} from "@/lib/actions/membershipCartServerActions";

export interface MembershipCartStats {
  totalItems: number;
  regularTotal: number;
  membershipTotal: number;
  membershipSavings: number;
  promotionSavings: number;
  totalSavings: number;
  finalTotal: number;
  itemCount: number;
  freeItems: number;
  paidItems: number;
}

interface MembershipCartState {
  // State
  cart: MembershipCartWithPromotion | null;
  isOpen: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;

  // Reactive stats
  stats: MembershipCartStats;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  initializeCart: () => Promise<void>;

  // Optimistic Cart Operations with Membership Support
  addToCartOptimistic: (
    product: any,
    quantity: number
  ) => Promise<{
    success: boolean;
    membershipInfo?: MembershipInfo;
    error?: string;
  }>;
  updateQuantityOptimistic: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCartOptimistic: (productId: string) => Promise<void>;
  clearCartOptimistic: () => Promise<void>;

  // Utility functions
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItemMembershipInfo: (productId: string) => {
    isFree: boolean;
    savings: number;
    membershipPrice: number;
  } | null;
  refreshCart: () => Promise<void>;
}

export const useMembershipCartStore = create<MembershipCartState>()(
  subscribeWithSelector((set, get) => {
    // Helper function to calculate membership cart stats
    const calculateMembershipStats = (
      cart: MembershipCartWithPromotion | null
    ): MembershipCartStats => {
      if (!cart?.items) {
        return {
          totalItems: 0,
          regularTotal: 0,
          membershipTotal: 0,
          membershipSavings: 0,
          promotionSavings: 0,
          totalSavings: 0,
          finalTotal: 0,
          itemCount: 0,
          freeItems: 0,
          paidItems: 0,
        };
      }

      const totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      let freeItems = 0;
      let paidItems = 0;

      cart.items.forEach((item) => {
        if (item.isFreeFromMembership) {
          const freeQuantity = Math.ceil(
            item.membershipSavings / item.product.price
          );
          freeItems += freeQuantity;
          paidItems += item.quantity - freeQuantity;
        } else {
          paidItems += item.quantity;
        }
      });

      return {
        totalItems,
        regularTotal: cart.subtotal,
        membershipTotal: cart.finalTotal,
        membershipSavings: cart.membershipDiscount,
        promotionSavings: cart.promotionDiscount,
        totalSavings: cart.membershipDiscount + cart.promotionDiscount,
        finalTotal: cart.finalTotal,
        itemCount: cart.items.length,
        freeItems,
        paidItems,
      };
    };

    return {
      // Initial state
      cart: null,
      isOpen: false,
      loading: false,
      initializing: true,
      error: null,
      stats: {
        totalItems: 0,
        regularTotal: 0,
        membershipTotal: 0,
        membershipSavings: 0,
        promotionSavings: 0,
        totalSavings: 0,
        finalTotal: 0,
        itemCount: 0,
        freeItems: 0,
        paidItems: 0,
      },

      // Basic actions
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Initialize membership cart on app start
      initializeCart: async () => {
        try {
          set({ initializing: true, error: null });
          console.log("Initializing membership cart...");

          const result = await getMembershipCart();

          if (result.success && result.cart) {
            const newStats = calculateMembershipStats(result.cart);
            set({
              cart: result.cart,
              stats: newStats,
              initializing: false,
              error: null,
            });
            console.log("Membership cart initialized successfully");
          } else {
            console.log("No cart found, creating empty cart");
            const emptyCart: MembershipCartWithPromotion = {
              _id: "",
              items: [],
              subtotal: 0,
              membershipDiscount: 0,
              promotionDiscount: 0,
              finalTotal: 0,
              shippingAmount: 0,
              taxAmount: 0,
              totalAmount: 0,
              hasPromotionApplied: false,
              hasMembershipApplied: false,
            };
            const newStats = calculateMembershipStats(emptyCart);
            set({
              cart: emptyCart,
              stats: newStats,
              initializing: false,
              error: null,
            });
          }
        } catch (error) {
          console.error("Failed to initialize membership cart:", error);
          const emptyCart: MembershipCartWithPromotion = {
            _id: "",
            items: [],
            subtotal: 0,
            membershipDiscount: 0,
            promotionDiscount: 0,
            finalTotal: 0,
            shippingAmount: 0,
            taxAmount: 0,
            totalAmount: 0,
            hasPromotionApplied: false,
            hasMembershipApplied: false,
          };
          const newStats = calculateMembershipStats(emptyCart);
          set({
            cart: emptyCart,
            stats: newStats,
            initializing: false,
            error: "Failed to load cart",
          });
        }
      },

      // Optimistic add to membership cart
      addToCartOptimistic: async (product: any, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) {
          await get().initializeCart();
          return { success: false, error: "Cart not initialized" };
        }

        // Create optimistic update (basic version - server will provide accurate membership pricing)
        const existingItemIndex = currentCart.items.findIndex(
          (item) => item.product._id === product._id
        );

        let optimisticCart: MembershipCartWithPromotion;

        if (existingItemIndex >= 0) {
          // Update existing item (optimistic - server will correct pricing)
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        } else {
          // Add new item (optimistic - assume regular pricing, server will apply membership benefits)
          const newItem: MembershipCartItem = {
            _id: `temp-${Date.now()}`,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images || [],
              category: product.category,
              promotionEligible: product.promotionEligible,
              isDiscounted: product.isDiscounted,
            },
            quantity,
            price: product.price,
            originalPrice: product.compareAtPrice || product.price,
            membershipPrice: product.price, // Will be corrected by server
            isFreeFromMembership: false, // Will be corrected by server
            membershipSavings: 0, // Will be corrected by server
            categoryId: product.category?._id,
            categoryName: product.category?.name,
          };

          optimisticCart = {
            ...currentCart,
            items: [...currentCart.items, newItem],
            subtotal: currentCart.subtotal + product.price * quantity,
          };
        }

        // Apply optimistic update immediately
        const newStats = calculateMembershipStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        try {
          // Make server call with membership logic
          console.log(`Adding ${product.name} to membership cart...`);
          const result = await addToMembershipCart(product._id, quantity);

          if (result.success && result.cart) {
            // Replace with server response (has accurate membership pricing)
            const serverStats = calculateMembershipStats(result.cart);
            set({ cart: result.cart, stats: serverStats, error: null });

            // Show success toast with membership info
            if (result.membershipInfo?.wasApplied) {
              toast.success(
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-lg">👑</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900">
                      Added with Membership Benefits!
                    </div>
                    <div className="text-sm text-amber-700">
                      You saved ${result.membershipInfo.savings.toFixed(2)} on{" "}
                      {product.name}
                    </div>
                  </div>
                </div>,
                { duration: 4000 }
              );
            } else {
              toast.success(`${product.name} added to cart`);
            }

            return {
              success: true,
              membershipInfo: result.membershipInfo,
            };
          } else {
            throw new Error(result.error || "Failed to add to cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateMembershipStats(currentCart);
          set({ cart: currentCart, stats: revertStats });

          const errorMessage =
            error instanceof Error ? error.message : "Failed to add to cart";
          toast.error(errorMessage);
          console.error("Add to membership cart failed:", error);

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      // Optimistic quantity update with membership recalculation
      updateQuantityOptimistic: async (productId: string, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        // Create optimistic update (server will recalculate membership benefits)
        let optimisticCart: MembershipCartWithPromotion;

        if (quantity <= 0) {
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.filter(
              (item) => item.product._id !== productId
            ),
          };
        } else {
          optimisticCart = {
            ...currentCart,
            items: currentCart.items.map((item) =>
              item.product._id === productId ? { ...item, quantity } : item
            ),
          };
        }

        // Apply optimistic update
        const newStats = calculateMembershipStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        try {
          const result = await updateMembershipCartItem(productId, quantity);

          if (result.success && result.cart) {
            const serverStats = calculateMembershipStats(result.cart);
            set({ cart: result.cart, stats: serverStats, error: null });
          } else {
            throw new Error(result.error || "Failed to update cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateMembershipStats(currentCart);
          set({ cart: currentCart, stats: revertStats });
          toast.error("Failed to update cart");
          console.error("Update membership cart failed:", error);
        }
      },

      // Optimistic remove from membership cart
      removeFromCartOptimistic: async (productId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const itemToRemove = currentCart.items.find(
          (item) => item.product._id === productId
        );

        // Create optimistic update
        const optimisticCart: MembershipCartWithPromotion = {
          ...currentCart,
          items: currentCart.items.filter(
            (item) => item.product._id !== productId
          ),
        };

        // Apply optimistic update
        const newStats = calculateMembershipStats(optimisticCart);
        set({ cart: optimisticCart, stats: newStats });

        try {
          const result = await removeFromMembershipCart(productId);

          if (result.success) {
            if (result.cart) {
              const serverStats = calculateMembershipStats(result.cart);
              set({ cart: result.cart, stats: serverStats, error: null });
            } else {
              // Cart is empty, use empty state
              await get().refreshCart();
            }

            toast.success(
              itemToRemove
                ? `${itemToRemove.product.name} removed from cart`
                : "Item removed from cart"
            );
          } else {
            throw new Error(result.error || "Failed to remove from cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateMembershipStats(currentCart);
          set({ cart: currentCart, stats: revertStats });
          toast.error("Failed to remove item");
          console.error("Remove from membership cart failed:", error);
        }
      },

      // Clear membership cart optimistically
      clearCartOptimistic: async () => {
        const currentCart = get().cart;
        if (!currentCart) return;

        // Apply optimistic update immediately
        const emptyCart: MembershipCartWithPromotion = {
          _id: "",
          items: [],
          subtotal: 0,
          membershipDiscount: 0,
          promotionDiscount: 0,
          finalTotal: 0,
          shippingAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          hasPromotionApplied: false,
          hasMembershipApplied: false,
        };
        const newStats = calculateMembershipStats(emptyCart);
        set({ cart: emptyCart, stats: newStats });

        try {
          const result = await clearMembershipCart();

          if (result.success) {
            toast.success("Cart cleared");
            await get().refreshCart(); // Refresh to ensure clean state
          } else {
            throw new Error(result.error || "Failed to clear cart");
          }
        } catch (error) {
          // Revert optimistic update on error
          const revertStats = calculateMembershipStats(currentCart);
          set({ cart: currentCart, stats: revertStats });
          toast.error("Failed to clear cart");
          console.error("Clear membership cart failed:", error);
        }
      },

      // Utility functions enhanced for membership
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

      getItemMembershipInfo: (productId: string) => {
        const cart = get().cart;
        const item = cart?.items.find((item) => item.product._id === productId);

        if (!item) return null;

        return {
          isFree: item.isFreeFromMembership,
          savings: item.membershipSavings,
          membershipPrice: item.membershipPrice,
        };
      },

      // Refresh membership cart from server
      refreshCart: async () => {
        try {
          set({ loading: true, error: null });
          console.log("Refreshing membership cart...");

          const result = await getMembershipCart();

          if (result.success && result.cart) {
            const newStats = calculateMembershipStats(result.cart);
            set({ cart: result.cart, stats: newStats, loading: false });
          } else {
            const emptyCart: MembershipCartWithPromotion = {
              _id: "",
              items: [],
              subtotal: 0,
              membershipDiscount: 0,
              promotionDiscount: 0,
              finalTotal: 0,
              shippingAmount: 0,
              taxAmount: 0,
              totalAmount: 0,
              hasPromotionApplied: false,
              hasMembershipApplied: false,
            };
            const newStats = calculateMembershipStats(emptyCart);
            set({ cart: emptyCart, stats: newStats, loading: false });
          }
        } catch (error) {
          console.error("Failed to refresh membership cart:", error);
          set({ loading: false, error: "Failed to refresh cart" });
        }
      },
    };
  })
);

// Export the hook for easier usage
export const useMembershipCart = () => useMembershipCartStore((state) => state);
