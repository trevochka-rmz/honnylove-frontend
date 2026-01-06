import { useQuery } from '@tanstack/react-query';
import { api, BrandBrief } from '@/services/api';

export const useBrandsBrief = () => {
  return useQuery({
    queryKey: ['brands', 'brief'],
    queryFn: async (): Promise<BrandBrief[]> => {
      const response = await api.getBrandsBrief();
      return response.brands;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
