import { useQuery } from '@tanstack/react-query';
import { api, ApiBrand } from '@/services/api';
import { brands as fallbackBrands, Brand } from '@/data/brands';

// Convert API brand to internal Brand type
const mapApiBrand = (apiBrand: ApiBrand): Brand => ({
  id: apiBrand.id.toString(),
  name: apiBrand.name,
  description: apiBrand.description,
  logo: apiBrand.logo_url || '/placeholder.svg',
  country: apiBrand.country || 'Южная Корея',
  founded: apiBrand.founded || '2010',
  philosophy: apiBrand.philosophy || apiBrand.description,
  highlights: apiBrand.highlights || ['Натуральные ингредиенты', 'Высокое качество'],
  fullDescription: apiBrand.full_description || apiBrand.description,
});

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        const apiBrands = await api.getBrands();
        return apiBrands.map(mapApiBrand);
      } catch (error) {
        console.warn('API not available, using fallback data');
        return fallbackBrands;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      try {
        const apiBrand = await api.getBrandById(id);
        return mapApiBrand(apiBrand);
      } catch (error) {
        console.warn('API not available, using fallback data');
        const fallbackBrand = fallbackBrands.find(b => b.id === id || b.name.toLowerCase().replace(/\s+/g, '-') === id);
        if (!fallbackBrand) throw new Error('Brand not found');
        return fallbackBrand;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
