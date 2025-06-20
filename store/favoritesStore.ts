// import { create } from "zustand";
// import { subscribeWithSelector } from "zustand/middleware";
// import { toast } from "sonner";
// import {
//   toggleFavorite,
//   getUserFavoriteIds,
// } from "@/lib/actions/favouriteServerActions";

// export interface FavoriteItem {
//   productId: string;
//   productName: string;
//   addedAt: Date;
// }

// interface FavoritesState {
//   // State
//   favoriteIds: string[]; // Array of product IDs that are favorited
//   items: FavoriteItem[]; // Detailed favorite items (for favorites page)
//   loading: boolean;
//   initializing: boolean;
//   error: string | null;

//   // Stats
//   count: number;

//   // Actions
//   initializeFavorites: () => Promise<void>;

//   // Optimistic Favorites Operations
//   toggleFavoriteOptimistic: (
//     productId: string,
//     productName: string
//   ) => Promise<void>;

//   // Utility functions
//   isFavorite: (productId: string) => boolean;
//   refreshFavorites: () => Promise<void>;
// }

// export const useFavoritesStore = create<FavoritesState>()(
//   subscribeWithSelector((set, get) => {
//     return {
//       // Initial state
//       favoriteIds: [],
//       items: [],
//       loading: false,
//       initializing: true,
//       error: null,
//       count: 0,

//       // Initialize favorites on app start
//       initializeFavorites: async () => {
//         try {
//           set({ initializing: true, error: null });
//           const favoriteIds = await getUserFavoriteIds();

//           // Convert IDs to items for count and basic info
//           const items: FavoriteItem[] = favoriteIds.map((id) => ({
//             productId: id,
//             productName: "", // Will be populated when needed
//             addedAt: new Date(),
//           }));

//           set({
//             favoriteIds,
//             items,
//             count: favoriteIds.length,
//             initializing: false,
//           });
//         } catch (error) {
//           console.error("Failed to initialize favorites:", error);
//           set({
//             favoriteIds: [],
//             items: [],
//             count: 0,
//             initializing: false,
//             error: "Failed to load favorites",
//           });
//         }
//       },

//       // Optimistic toggle favorite
//       toggleFavoriteOptimistic: async (
//         productId: string,
//         productName: string
//       ) => {
//         const currentFavoriteIds = get().favoriteIds;
//         const currentItems = get().items;
//         const isFavorited = currentFavoriteIds.includes(productId);

//         let optimisticFavoriteIds: string[];
//         let optimisticItems: FavoriteItem[];

//         if (isFavorited) {
//           // Remove from favorites
//           optimisticFavoriteIds = currentFavoriteIds.filter(
//             (id) => id !== productId
//           );
//           optimisticItems = currentItems.filter(
//             (item) => item.productId !== productId
//           );
//         } else {
//           // Add to favorites
//           optimisticFavoriteIds = [...currentFavoriteIds, productId];
//           optimisticItems = [
//             ...currentItems,
//             {
//               productId,
//               productName,
//               addedAt: new Date(),
//             },
//           ];
//         }

//         // Apply optimistic update immediately
//         set({
//           favoriteIds: optimisticFavoriteIds,
//           items: optimisticItems,
//           count: optimisticFavoriteIds.length,
//         });

//         try {
//           // Make server call
//           const result = await toggleFavorite(productId);

//           if (result.success) {
//             // Server call successful - optimistic update was correct
//             const action = result.isFavorite ? "added to" : "removed from";
//             toast.success(`${productName} ${action} favorites`);
//             set({ error: null });
//           } else {
//             throw new Error(result.error || "Failed to update favorites");
//           }
//         } catch (error) {
//           // Revert optimistic update on error
//           set({
//             favoriteIds: currentFavoriteIds,
//             items: currentItems,
//             count: currentFavoriteIds.length,
//           });
//           toast.error(
//             error instanceof Error
//               ? error.message
//               : "Failed to update favorites"
//           );
//           console.error("Toggle favorite failed:", error);
//         }
//       },

//       // Utility functions
//       isFavorite: (productId: string) => {
//         const favoriteIds = get().favoriteIds;
//         return favoriteIds.includes(productId);
//       },

//       // Refresh favorites from server
//       refreshFavorites: async () => {
//         try {
//           set({ loading: true, error: null });
//           const favoriteIds = await getUserFavoriteIds();

//           // Convert IDs to items
//           const items: FavoriteItem[] = favoriteIds.map((id) => ({
//             productId: id,
//             productName: "", // Will be populated when needed
//             addedAt: new Date(),
//           }));

//           set({
//             favoriteIds,
//             items,
//             count: favoriteIds.length,
//             loading: false,
//           });
//         } catch (error) {
//           console.error("Failed to refresh favorites:", error);
//           set({ loading: false, error: "Failed to refresh favorites" });
//         }
//       },
//     };
//   })
// );
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";
import {
  toggleFavorite,
  getUserFavoriteIds,
} from "@/lib/actions/favouriteServerActions";

export interface FavoriteItem {
  productId: string;
  productName: string;
  addedAt: Date;
}

interface FavoritesState {
  // State
  favoriteIds: string[]; // Array of product IDs that are favorited
  items: FavoriteItem[]; // Detailed favorite items (for favorites page)
  loading: boolean;
  initializing: boolean;
  error: string | null;

  // Stats
  count: number;

  // Actions
  initializeFavorites: () => Promise<void>;

  // Optimistic Favorites Operations
  toggleFavoriteOptimistic: (
    productId: string,
    productName: string
  ) => Promise<void>;

  // Utility functions
  isFavorite: (productId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  subscribeWithSelector((set, get) => {
    return {
      // Initial state
      favoriteIds: [],
      items: [],
      loading: false,
      initializing: true,
      error: null,
      count: 0,

      // Initialize favorites on app start
      initializeFavorites: async () => {
        try {
          set({ initializing: true, error: null });
          const favoriteIds = await getUserFavoriteIds();

          // Convert IDs to items for count and basic info
          const items: FavoriteItem[] = favoriteIds.map((id) => ({
            productId: id,
            productName: "", // Will be populated when needed
            addedAt: new Date(),
          }));

          set({
            favoriteIds,
            items,
            count: favoriteIds.length,
            initializing: false,
          });
        } catch (error) {
          console.error("Failed to initialize favorites:", error);
          set({
            favoriteIds: [],
            items: [],
            count: 0,
            initializing: false,
            error: "Failed to load favorites",
          });
        }
      },

      // Optimistic toggle favorite
      toggleFavoriteOptimistic: async (
        productId: string,
        productName: string
      ) => {
        const currentState = get();
        const currentFavoriteIds = [...currentState.favoriteIds]; // Create new array
        const currentItems = [...currentState.items]; // Create new array
        const isFavorited = currentFavoriteIds.includes(productId);

        let optimisticFavoriteIds: string[];
        let optimisticItems: FavoriteItem[];

        if (isFavorited) {
          // Remove from favorites - create completely new arrays
          optimisticFavoriteIds = currentFavoriteIds.filter(
            (id) => id !== productId
          );
          optimisticItems = currentItems.filter(
            (item) => item.productId !== productId
          );

          console.log("🔴 Removing from favorites:", productId);
          console.log(
            "🔴 Before:",
            currentFavoriteIds.length,
            "After:",
            optimisticFavoriteIds.length
          );
        } else {
          // Add to favorites - create completely new arrays
          optimisticFavoriteIds = [...currentFavoriteIds, productId];
          optimisticItems = [
            ...currentItems,
            {
              productId,
              productName,
              addedAt: new Date(),
            },
          ];

          console.log("🟢 Adding to favorites:", productId);
          console.log(
            "🟢 Before:",
            currentFavoriteIds.length,
            "After:",
            optimisticFavoriteIds.length
          );
        }

        // Apply optimistic update immediately with completely new state
        set(() => ({
          favoriteIds: optimisticFavoriteIds,
          items: optimisticItems,
          count: optimisticFavoriteIds.length,
        }));

        // Log the state after update
        console.log(
          "📊 State updated, new count:",
          optimisticFavoriteIds.length
        );

        try {
          // Make server call
          const result = await toggleFavorite(productId);

          if (result.success) {
            // Server call successful - optimistic update was correct
            const action = result.isFavorite ? "added to" : "removed from";
            toast.success(`${productName} ${action} favorites`);
            set((state) => ({ ...state, error: null }));

            console.log("✅ Server confirmed:", action, "favorites");
          } else {
            throw new Error(result.error || "Failed to update favorites");
          }
        } catch (error) {
          // Revert optimistic update on error
          console.log(
            "❌ Server error, reverting to:",
            currentFavoriteIds.length
          );

          set(() => ({
            favoriteIds: currentFavoriteIds,
            items: currentItems,
            count: currentFavoriteIds.length,
          }));

          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update favorites"
          );
          console.error("Toggle favorite failed:", error);
        }
      },

      // Utility functions
      isFavorite: (productId: string) => {
        const favoriteIds = get().favoriteIds;
        return favoriteIds.includes(productId);
      },

      // Refresh favorites from server
      refreshFavorites: async () => {
        try {
          set({ loading: true, error: null });
          const favoriteIds = await getUserFavoriteIds();

          // Convert IDs to items
          const items: FavoriteItem[] = favoriteIds.map((id) => ({
            productId: id,
            productName: "", // Will be populated when needed
            addedAt: new Date(),
          }));

          set({
            favoriteIds,
            items,
            count: favoriteIds.length,
            loading: false,
          });
        } catch (error) {
          console.error("Failed to refresh favorites:", error);
          set({ loading: false, error: "Failed to refresh favorites" });
        }
      },
    };
  })
);
