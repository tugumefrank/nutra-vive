import { create } from "zustand";
import { User } from "@/lib/db/schema";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  preferences: {
    newsletter: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    currency: string;
    language: string;
  };

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  updatePreferences: (preferences: Partial<UserStore["preferences"]>) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  preferences: {
    newsletter: true,
    emailNotifications: true,
    smsNotifications: false,
    currency: "USD",
    language: "en",
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  updatePreferences: (newPreferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    }));
  },

  clearUser: () => {
    set({ user: null });
  },
}));

export default useUserStore;
