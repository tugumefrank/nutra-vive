import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FavoritesStore } from "@/types";

const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return {
              items: [...state.items, productId],
            };
          }
          return state;
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId: string) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInFavorites: (productId: string) => {
        return get().items.includes(productId);
      },

      clearFavorites: () => {
        set({ items: [] });
      },
    }),
    {
      name: "nutra-vive-favorites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFavoritesStore;
