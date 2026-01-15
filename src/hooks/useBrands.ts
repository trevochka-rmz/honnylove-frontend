import { useQuery } from '@tanstack/react-query';
import { api, ApiBrand, BrandsParams, BrandsResponse } from '@/services/api';

export interface Brand {
  id: string;
  slug?: string;
  name: string;
  logo: string;
  description: string;
  fullDescription?: string;
  country: string;
  founded: string;
  philosophy: string;
  highlights: string[];
  productsCount?: number;
}

// Convert API brand to internal Brand type
const mapApiBrand = (apiBrand: ApiBrand): Brand => ({
  id: String(apiBrand.id),
  slug: apiBrand.slug,
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
      const response: BrandsResponse = await api.getBrands(params);
      return {
        brands: response.brands.map(mapApiBrand),
        total: response.total,
        page: response.page,
        pages: response.pages,
        limit: response.limit,
        hasMore: response.hasMore,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useAllBrands = () => {
  return useQuery({
    queryKey: ['brands', 'all'],
    queryFn: async (): Promise<Brand[]> => {
      const response: BrandsResponse = await api.getBrands({ limit: 50 });
      return response.brands.map(mapApiBrand);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: async (): Promise<Brand> => {
      const apiBrand = await api.getBrandById(id);
      return mapApiBrand(apiBrand);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
