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
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const getToken = async (): Promise<string | null> => {
  const { accessToken, refreshToken, setAuth, user, logout } = useAuthStore.getState();
  if (!accessToken || !refreshToken) return null;

  try {
    const { accessToken: newToken } = await api.refreshToken(refreshToken);
    if (user) {
      setAuth(user, newToken, refreshToken);
    }
    return newToken;
  } catch {
    logout();
    return null;
  }
};

export const useCartApiStore = create<CartApiState>((set, get) => ({
  items: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    const token = await getToken();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.getCart(token);
      set({ items: data.items, summary: data.summary, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const token = await getToken();
    if (!token) return false;

    try {
      await api.addToCart(token, productId, quantity);
      // Refetch cart to get updated data
      await get().fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart', error);
      return false;
    }
  },

  updateQuantity: async (cartItemId: number, quantity: number) => {
    const token = await getToken();
    if (!token) return false;

    try {
      const response = await api.updateCartItem(token, cartItemId, quantity);
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
    const token = await getToken();
    if (!token) return false;

    try {
      const response = await api.removeFromCart(token, cartItemId);
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
    const token = await getToken();
    if (!token) return;

    try {
      await api.clearCart(token);
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
