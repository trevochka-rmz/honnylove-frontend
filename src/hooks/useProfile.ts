import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';
import { fetchWithCreds } from '@/services/api';

export interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  discount_percentage: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  orderCount: number;
  cartCount: number;
  wishlistCount: number;
  reviewCount: number;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

const API_URL = `${API_BASE_URL}/api`;

export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileData> => {
      const response = await fetchWithCreds(`${API_URL}/users/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  
  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<ProfileData> => {
      const response = await fetchWithCreds(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (user) {
        setAuth({
          ...user,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
        });
      }
    },
  });
};
