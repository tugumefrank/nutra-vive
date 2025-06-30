"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Import the server actions
import {
  getMembershipCart,
  addToMembershipCart,
  updateMembershipCartItem,
  removeFromMembershipCart,
  clearMembershipCart,
  getMembershipCartSummary,
  type MembershipCartWithPromotion,
  type MembershipCartSummary,
} from '@/lib/actions/membershipCartServerActions';

// Types
interface CartState {
  cart: MembershipCartWithPromotion | null;
  summary: MembershipCartSummary | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  lastUpdated: number;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'SET_CART'; payload: MembershipCartWithPromotion | null }
  | { type: 'SET_SUMMARY'; payload: MembershipCartSummary | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TIMESTAMP' }
  | { type: 'RESET' };

interface CartContextType {
  state: CartState;
  actions: {
    refreshCart: () => Promise<void>;
    addToCart: (productId: string, quantity?: number) => Promise<boolean>;
    updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
    removeFromCart: (productId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
  };
}

// Initial state
const initialState: CartState = {
  cart: null,
  summary: null,
  loading: false,
  initializing: true,
  error: null,
  lastUpdated: 0,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIALIZING':
      return { ...state, initializing: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, error: null };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_TIMESTAMP':
      return { ...state, lastUpdated: Date.now() };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
export function MembershipCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Refresh cart data from server
  const refreshCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const [cartResult, summaryResult] = await Promise.all([
        getMembershipCart(),
        getMembershipCartSummary(),
      ]);

      if (cartResult.success) {
        dispatch({ type: 'SET_CART', payload: cartResult.cart || null });
      } else {
        dispatch({ type: 'SET_ERROR', payload: cartResult.error || 'Failed to load cart' });
      }

      if (summaryResult.success) {
        dispatch({ type: 'SET_SUMMARY', payload: summaryResult.summary || null });
      }

      dispatch({ type: 'UPDATE_TIMESTAMP' });
    } catch (error) {
      console.error('Error refreshing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZING', payload: false });
    }
  }, []);

  // Add to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await addToMembershipCart(productId, quantity);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to add item' });
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshCart]);

  // Update quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await updateMembershipCartItem(productId, quantity);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to update item' });
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item quantity' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await removeFromMembershipCart(productId);
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to remove item' });
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshCart]);

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await clearMembershipCart();
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to clear cart' });
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshCart]);

  // Initialize cart on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeCart = async () => {
      if (mounted) {
        await refreshCart();
      }
    };

    initializeCart();

    return () => {
      mounted = false;
    };
  }, [refreshCart]);

  const contextValue: CartContextType = {
    state,
    actions: {
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    },
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useMembershipCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useMembershipCart must be used within a MembershipCartProvider');
  }
  return context;
}

// Custom hook with computed values for easier usage
export function useMembershipCartState() {
  const { state, actions } = useMembershipCart();
  const { cart, summary, loading, initializing, error } = state;

  // Computed values
  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const hasItems = !isEmpty;
  const hasMembershipBenefits = cart?.hasMembershipApplied || false;
  const hasPromotions = cart?.hasPromotionApplied || false;
  const itemCount = cart?.items?.length || 0;

  // Stats object similar to what was used in the original component
  const stats = {
    totalItems: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    itemCount,
    regularTotal: summary?.regularTotal || cart?.subtotal || 0,
    membershipTotal: summary?.membershipTotal || cart?.finalTotal || 0,
    membershipSavings: summary?.membershipSavings || cart?.membershipDiscount || 0,
    promotionSavings: summary?.promotionSavings || cart?.promotionDiscount || 0,
    totalSavings: summary?.totalSavings || 
      ((summary?.membershipSavings || 0) + (summary?.promotionSavings || 0)) || 0,
    finalTotal: summary?.finalTotal || cart?.finalTotal || 0,
    shippingAmount: cart?.shippingAmount || 0,
    taxAmount: cart?.taxAmount || 0,
    totalAmount: cart?.totalAmount || 0,
  };

  return {
    // State
    cart,
    summary,
    loading,
    initializing,
    error,
    
    // Computed values
    isEmpty,
    hasItems,
    hasMembershipBenefits,
    hasPromotions,
    stats,
    
    // Actions
    refreshCart: actions.refreshCart,
    addToCart: actions.addToCart,
    updateQuantity: actions.updateQuantity,
    removeFromCart: actions.removeFromCart,
    clearCart: actions.clearCart,
  };
}