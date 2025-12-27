import { create } from 'zustand';
import { api, WishlistItem } from '@/services/api';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  isFavorite: (productId: string) => boolean;
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

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    const token = await getToken();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const items = await api.getWishlist(token);
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch wishlist', isLoading: false });
    }
  },

  addToWishlist: async (productId: number) => {
    const token = await getToken();
    if (!token) return false;

    try {
      const newItem = await api.addToWishlist(token, productId);
      set((state) => ({ items: [...state.items, newItem] }));
      return true;
    } catch (error: any) {
      if (error.message === 'Товар уже в избранном') {
        return false;
      }
      throw error;
    }
  },

  removeFromWishlist: async (productId: number) => {
    const token = await getToken();
    if (!token) return false;

    try {
      await api.removeFromWishlist(token, productId);
      set((state) => ({
        items: state.items.filter((item) => item.product_id !== productId),
      }));
      return true;
    } catch (error) {
      return false;
    }
  },

  clearWishlist: async () => {
    const token = await getToken();
    if (!token) return;

    try {
      await api.clearWishlist(token);
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear wishlist');
    }
  },

  isFavorite: (productId: string) => {
    return get().items.some((item) => item.product_id === parseInt(productId));
  },
}));
