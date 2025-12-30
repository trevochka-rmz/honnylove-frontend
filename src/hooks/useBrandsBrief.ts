import { useQuery } from '@tanstack/react-query';
import { api, BrandBrief } from '@/services/api';
import { brands as fallbackBrands } from '@/data/brands';

export const useBrandsBrief = () => {
  return useQuery({
    queryKey: ['brands', 'brief'],
    queryFn: async (): Promise<BrandBrief[]> => {
      try {
        const response = await api.getBrandsBrief();
        return response.brands;
      } catch (error) {
        console.warn('API not available for brands brief, using fallback');
        return fallbackBrands.map(b => ({
          id: parseInt(b.id) || 0,
          slug: b.id,
          name: b.name,
          logo: b.logo,
        }));
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
