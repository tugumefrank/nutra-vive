// Legacy cart store - fully commented out as system transitions to unified cart
// import { create } from "zustand";
// import { subscribeWithSelector } from "zustand/middleware";
// ... [entire implementation commented out]

// Placeholder export to prevent import errors while transitioning to unified cart
export const useCartStore = () => ({
  stats: { totalItems: 0, totalPrice: 0, itemCount: 0 },
  isOpen: false,
  loading: false,
  initializing: false,
  openCart: () => {},
  closeCart: () => {},
});