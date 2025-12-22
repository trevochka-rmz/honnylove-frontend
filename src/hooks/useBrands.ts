import { useQuery } from '@tanstack/react-query';
import { api, ApiBrand, BrandsParams, BrandsResponse } from '@/services/api';
import { brands as fallbackBrandsData, Brand } from '@/data/brands';

// Convert API brand to internal Brand type
const mapApiBrand = (apiBrand: ApiBrand): Brand => ({
  id: String(apiBrand.id),
  name: apiBrand.name,
  description: apiBrand.description,
  logo: apiBrand.logo_url || apiBrand.logo || '/placeholder.svg',
  country: apiBrand.country || 'South Korea',
  founded: apiBrand.founded || '',
  philosophy: apiBrand.philosophy || '',
  highlights: apiBrand.highlights || [],
  productsCount: typeof apiBrand.productsCount === 'string' 
    ? parseInt(apiBrand.productsCount) 
    : (apiBrand.productsCount || 0),
  fullDescription: apiBrand.fullDescription || apiBrand.full_description || apiBrand.description,
});

export interface BrandsResult {
  brands: Brand[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export const useBrands = (params: BrandsParams = {}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: async (): Promise<BrandsResult> => {
      try {
        const response: BrandsResponse = await api.getBrands(params);
        return {
          brands: response.brands.map(mapApiBrand),
          total: response.total,
          page: response.page,
          pages: response.pages,
          limit: response.limit,
          hasMore: response.hasMore,
        };
      } catch (error) {
        console.warn('API not available, using fallback brands data');
        let filtered = [...fallbackBrandsData];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(b => 
            b.name.toLowerCase().includes(searchLower) ||
            b.description.toLowerCase().includes(searchLower)
          );
        }

        const total = filtered.length;
        const limit = params.limit || 8;
        const page = params.page || 1;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paginatedBrands = filtered.slice(start, start + limit);

        return {
          brands: paginatedBrands,
          total,
          page,
          pages,
          limit,
          hasMore: page < pages,
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useAllBrands = () => {
  return useQuery({
    queryKey: ['brands', 'all'],
    queryFn: async (): Promise<Brand[]> => {
      try {
        const response: BrandsResponse = await api.getBrands({ limit: 50 });
        return response.brands.map(mapApiBrand);
      } catch (error) {
        console.warn('API not available, using fallback brands data');
        return fallbackBrandsData;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: async (): Promise<Brand> => {
      try {
        const apiBrand = await api.getBrandById(id);
        return mapApiBrand(apiBrand);
      } catch (error) {
        console.warn('API not available, using fallback brand data');
        const fallback = fallbackBrandsData.find(b => b.id === id);
        if (!fallback) throw new Error('Brand not found');
        return fallback;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
