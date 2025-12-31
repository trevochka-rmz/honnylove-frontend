import { useQuery } from '@tanstack/react-query';
import { api, ApiProduct, ProductsParams, ProductsResponse } from '@/services/api';
import { products as fallbackProducts, Product } from '@/data/products';

// Convert API product to internal Product type
const mapApiProduct = (apiProduct: ApiProduct): Product => ({
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
  // Category path info
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

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export const useProducts = (params: ProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<ProductsResult> => {
      try {
        const response: ProductsResponse = await api.getProducts(params);
        return {
          products: response.products.map(mapApiProduct),
          total: response.total,
          page: response.page,
          pages: response.pages,
          limit: response.limit,
          hasMore: response.hasMore,
        };
      } catch (error) {
        console.warn('API not available, using fallback data');
        // Apply basic filtering/pagination to fallback data
        let filtered = [...fallbackProducts];
        
        if (params.category) {
          filtered = filtered.filter(p => p.category === params.category);
        }
        if (params.isNew !== undefined) {
          filtered = filtered.filter(p => p.isNew === params.isNew);
        }
        if (params.isBestseller !== undefined) {
          filtered = filtered.filter(p => p.isBestseller === params.isBestseller);
        }
        if (params.minPrice !== undefined) {
          filtered = filtered.filter(p => (p.discountPrice || p.price) >= params.minPrice!);
        }
        if (params.maxPrice !== undefined) {
          filtered = filtered.filter(p => (p.discountPrice || p.price) <= params.maxPrice!);
        }
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.brand.toLowerCase().includes(searchLower)
          );
        }

        // Sort
        if (params.sort) {
          switch (params.sort) {
            case 'price_asc':
              filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
              break;
            case 'price_desc':
              filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
              break;
            case 'rating':
              filtered.sort((a, b) => b.rating - a.rating);
              break;
            case 'popularity':
              filtered.sort((a, b) => b.reviewCount - a.reviewCount);
              break;
          }
        }

        const total = filtered.length;
        const limit = params.limit || 9;
        const page = params.page || 1;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paginatedProducts = filtered.slice(start, start + limit);

        return {
          products: paginatedProducts,
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

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const apiProduct = await api.getProductById(id);
        return mapApiProduct(apiProduct);
      } catch (error) {
        console.warn('API not available, using fallback data');
        const fallbackProduct = fallbackProducts.find(p => p.id === id);
        if (!fallbackProduct) throw new Error('Product not found');
        return fallbackProduct;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      try {
        const apiProducts = await api.searchProducts(query);
        return apiProducts.map(mapApiProduct);
      } catch (error) {
        console.warn('API not available, using fallback search');
        return fallbackProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        );
      }
    },
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
