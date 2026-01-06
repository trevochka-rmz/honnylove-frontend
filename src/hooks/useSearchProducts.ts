import { useQuery } from '@tanstack/react-query';
import { api, ProductsResponse } from '@/services/api';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  image: string;
  images: string[];
  description: string;
  ingredients?: string;
  usage?: string;
  rating: number;
  reviewCount: number;
  variants?: { name: string; value: string }[];
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  top_category_name?: string;
  top_category_id?: number;
  top_category_slug?: string;
  parent_category_name?: string;
  parent_category_id?: number;
  parent_category_slug?: string;
  category_name?: string;
  category_id?: number;
  category_slug?: string;
  category_level?: number;
  brand_slug?: string;
  skin_type?: string;
  slug?: string;
}

// Convert API product to internal Product type
const mapApiProduct = (apiProduct: any): Product => ({
  id: apiProduct.id,
  name: apiProduct.name,
  brand: apiProduct.brand,
  category: apiProduct.category,
  price: parseFloat(apiProduct.price),
  discountPrice: apiProduct.discountPrice ? parseFloat(apiProduct.discountPrice) : undefined,
  image: apiProduct.image,
  images: apiProduct.images,
  description: apiProduct.description,
  ingredients: apiProduct.ingredients,
  usage: apiProduct.usage,
  rating: parseFloat(apiProduct.rating),
  reviewCount: apiProduct.reviewCount,
  variants: apiProduct.variants,
  inStock: apiProduct.inStock,
  isNew: apiProduct.isNew,
  isBestseller: apiProduct.isBestseller,
  top_category_name: apiProduct.top_category_name,
  top_category_id: apiProduct.top_category_id,
  top_category_slug: apiProduct.top_category_slug,
  parent_category_name: apiProduct.parent_category_name,
  parent_category_id: apiProduct.parent_category_id,
  parent_category_slug: apiProduct.parent_category_slug,
  category_name: apiProduct.category_name,
  category_id: apiProduct.category_id,
  category_slug: apiProduct.category_slug,
  category_level: apiProduct.category_level,
  brand_slug: apiProduct.brand_slug,
  skin_type: apiProduct.skin_type,
  slug: apiProduct.slug,
});

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async (): Promise<Product[]> => {
      if (!query.trim()) return [];
      const response: ProductsResponse = await api.getProducts({ search: query });
      return response.products.map(mapApiProduct);
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
    retry: 1,
  });
};
