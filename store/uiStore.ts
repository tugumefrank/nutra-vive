import { create } from "zustand";

interface UIStore {
  // Loading states
  isLoading: boolean;
  loadingMessage: string;

  // Modal states
  modals: Record<string, boolean>;

  // Mobile navigation
  isMobileMenuOpen: boolean;

  // Product quick view
  quickViewProduct: string | null;

  // Sidebar states
  isSidebarOpen: boolean;

  // Actions
  setLoading: (isLoading: boolean, message?: string) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setQuickViewProduct: (productId: string | null) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  openCart: () => void;
}

const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  isLoading: false,
  loadingMessage: "",
  modals: {},
  isMobileMenuOpen: false,
  quickViewProduct: null,
  isSidebarOpen: false,

  // Actions
  setLoading: (isLoading: boolean, message = "") => {
    set({ isLoading, loadingMessage: message });
  },

  openModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    }));
  },
  openCart: () => {
    // Implement the logic to open the cart UI/modal here
    set({
      /* update state to open cart */
    });
  },
  closeModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    }));
  },

  toggleModal: (modalId: string) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: !state.modals[modalId] },
    }));
  },

  closeAllModals: () => {
    set({ modals: {} });
  },

  setMobileMenuOpen: (isOpen: boolean) => {
    set({ isMobileMenuOpen: isOpen });
  },

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  setQuickViewProduct: (productId: string | null) => {
    set({ quickViewProduct: productId });
  },

  setSidebarOpen: (isOpen: boolean) => {
    set({ isSidebarOpen: isOpen });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
}));

export default useUIStore;
