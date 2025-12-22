import { useQuery } from '@tanstack/react-query';
import { api, ApiProduct } from '@/services/api';
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
});

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const apiProducts = await api.getProducts();
        return apiProducts.map(mapApiProduct);
      } catch (error) {
        console.warn('API not available, using fallback data');
        return fallbackProducts;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
