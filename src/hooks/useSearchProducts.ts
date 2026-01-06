import { useQuery } from '@tanstack/react-query';
import { api, ProductsResponse } from '@/services/api';
import { products as fallbackProducts, Product } from '@/data/products';

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
      try {
        // Use the getProducts API with search parameter
        const response: ProductsResponse = await api.getProducts({ search: query });
        return response.products.map(mapApiProduct);
      } catch (error) {
        console.warn('API not available, using fallback search');
        const searchLower = query.toLowerCase();
        return fallbackProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower)
        );
      }
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
    retry: 1,
  });
};
