import { create } from 'zustand';
import { api, CartItemApi, CartResponse } from '@/services/api';
import { useAuthStore } from './authStore';

interface CartApiState {
  items: CartItemApi[];
  summary: CartResponse['summary'] | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  clearLocalState: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartApiStore = create<CartApiState>((set, get) => ({
  items: [],
  summary: null,
  isLoading: false,
  error: null,

  clearLocalState: () => {
    set({ items: [], summary: null, error: null });
  },

  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.getCart();
      set({ items: data.items, summary: data.summary, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return false;

    try {
      await api.addToCart(productId, quantity);
      await get().fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart', error);
      return false;
    }
  },

  updateQuantity: async (cartItemId: number, quantity: number) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return false;

    try {
      const response = await api.updateCartItem(cartItemId, quantity);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === cartItemId ? response.item : item
        ),
        summary: response.cartSummary,
      }));
      return true;
    } catch (error) {
      console.error('Failed to update cart item', error);
      return false;
    }
  },

  removeFromCart: async (cartItemId: number) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return false;

    try {
      const response = await api.removeFromCart(cartItemId);
      set((state) => ({
        items: state.items.filter((item) => item.id !== cartItemId),
        summary: response.cartSummary,
      }));
      return true;
    } catch (error) {
      console.error('Failed to remove from cart', error);
      return false;
    }
  },

  clearCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    try {
      await api.clearCart();
      set({ items: [], summary: null });
    } catch (error) {
      console.error('Failed to clear cart');
    }
  },

  getTotalItems: () => {
    return get().summary?.itemsTotal || 0;
  },

  getTotalPrice: () => {
    return get().summary?.subtotal || 0;
  },
}));
