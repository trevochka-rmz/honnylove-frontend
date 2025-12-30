import { useQuery } from '@tanstack/react-query';
import { api, ApiCategory } from '@/services/api';

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async (): Promise<ApiCategory[]> => {
      try {
        const response = await api.getAllCategories();
        return response.data;
      } catch (error) {
        console.warn('API not available for categories');
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

export const useCategory = (id: number | null) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async (): Promise<ApiCategory | null> => {
      if (!id) return null;
      try {
        const response = await api.getCategoryById(id);
        return response.data;
      } catch (error) {
        console.warn('API not available for category');
        return null;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
