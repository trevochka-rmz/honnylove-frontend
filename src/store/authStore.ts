import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartApiStore } from '@/store/cartApiStore';
import { useWishlistStore } from '@/store/wishlistStore';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  discount_percentage?: string;
  is_active: boolean;
  isVerified?: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Clear auth state
        set({
          user: null,
          isAuthenticated: false,
        });
        // Clear other stores that depend on auth
        import('@/store/cartApiStore').then(({ useCartApiStore }) => {
          useCartApiStore.getState().clearLocalState();
        });
        import('@/store/wishlistStore').then(({ useWishlistStore }) => {
          useWishlistStore.getState().clearLocalState();
        });
      },
    }),
    {
      name: 'honnylove-auth',
    }
  )
);
