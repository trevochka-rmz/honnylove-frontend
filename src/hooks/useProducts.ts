import { useQuery } from '@tanstack/react-query';
import { api, ApiProduct, ProductsParams, ProductsResponse, StockVariant } from '@/services/api';

export type { StockVariant } from '@/services/api';

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
  stockVariants?: StockVariant[];
  variantCount?: number;
  stockQuantity?: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  product_type?: string;
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
  similarProducts?: Product[];
}

interface ApiSimilarProduct {
  id: string;
  name: string;
  slug?: string;
  price: string;
  discountPrice?: string | null;
  image: string;
  brand?: string;
  brand_slug?: string;
  category_name?: string;
  category_id?: number;
  rating?: string;
  reviewCount?: number;
  isBestseller?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
}

const mapSimilarProduct = (p: ApiSimilarProduct): Product => ({
  id: p.id,
  name: p.name,
  brand: p.brand || '',
  category: p.category_name || '',
  price: parseFloat(p.price),
  discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : undefined,
  image: p.image,
  images: [],
  description: '',
  rating: p.rating ? parseFloat(p.rating) : 0,
  reviewCount: p.reviewCount || 0,
  inStock: p.inStock ?? false,
  isBestseller: p.isBestseller,
  category_name: p.category_name,
  category_id: p.category_id,
  brand_slug: p.brand_slug,
  slug: p.slug,
  stockQuantity: p.stockQuantity,
});

const getApiNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

// Convert API product to internal Product type
const mapApiProduct = (apiProduct: ApiProduct): Product => {
  const rawProduct = apiProduct as ApiProduct & {
    stock_variants?: StockVariant[];
    variant_count?: number;
    stock_quantity?: number;
  };
  const stockVariants = rawProduct.stockVariants || rawProduct.stock_variants || [];

  return ({
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
  stockVariants,
  variantCount: getApiNumber(rawProduct.variantCount ?? rawProduct.variant_count, stockVariants.length || 1),
  stockQuantity: getApiNumber(rawProduct.stockQuantity ?? rawProduct.stock_quantity),
  inStock: apiProduct.inStock,
  isNew: apiProduct.isNew,
  isBestseller: apiProduct.isBestseller,
  product_type: apiProduct.product_type,
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
};

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
      const response: ProductsResponse = await api.getProducts(params);
      return {
        products: response.products.map(mapApiProduct),
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

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const apiProduct = await api.getProductById(id);
      return mapApiProduct(apiProduct);
    },
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 2,
  });
};
