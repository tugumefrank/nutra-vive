import { create } from "zustand";
import { IUser } from "@/lib/db/models";

interface UserStore {
  user: IUser | null;
  isLoading: boolean;
  preferences: {
    newsletter: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    currency: string;
    language: string;
  };

  // Actions
  setUser: (user: IUser | null) => void;
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

  setUser: (user: IUser | null) => {
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
