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
  clearLocalState: () => void;
  isFavorite: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  clearLocalState: () => {
    set({ items: [], error: null });
  },

  fetchWishlist: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true, error: null });
    try {
      const items = await api.getWishlist();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch wishlist', isLoading: false });
    }
  },

  addToWishlist: async (productId: number) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return false;

    try {
      const newItem = await api.addToWishlist(productId);
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
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return false;

    try {
      await api.removeFromWishlist(productId);
      set((state) => ({
        items: state.items.filter((item) => item.product_id !== productId),
      }));
      return true;
    } catch (error) {
      return false;
    }
  },

  clearWishlist: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    try {
      await api.clearWishlist();
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear wishlist');
    }
  },

  isFavorite: (productId: string) => {
    return get().items.some((item) => item.product_id === parseInt(productId));
  },
}));
