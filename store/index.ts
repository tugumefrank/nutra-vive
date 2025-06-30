// Export all stores from a single file for easier imports

export { useFavoritesStore } from "./favoritesStore";

export { default as useThemeStore } from "./themeStore";
export { default as useSearchStore } from "./searchStore";
export { default as useUIStore } from "./uiStore";

// Combined store hooks for common use cases

import { useFavoritesStore } from "./favoritesStore";
import useUserStore from "./userStore";

// // Hook to get cart and favorites count for badge display
// export const useShoppingCounts = () => {
//   const cartItemCount = useCartStore((state) => state.getItemCount());
//   const favoriteItemCount = useFavoritesStore((state) => state.items.length);

//   return {
//     cartCount: cartItemCount,
//     favoriteCount: favoriteItemCount,
//   };
// };

// // Hook to check if user is authenticated
// export const useIsAuthenticated = () => {
//   const user = useUserStore((state) => state.user);
//   return !!user;
// };

// // Hook for product interaction states
// export const useProductInteractions = (productId: string) => {
//   const isInCart = useCartStore((state) =>
//     state.items.some((item) => item.productId === productId)
//   );
//   const isInFavorites = useFavoritesStore((state) =>
//     state.isInFavorites(productId)
//   );

//   return {
//     isInCart,
//     isInFavorites,
//   };
// };
