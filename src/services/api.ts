const API_BASE_URL = 'http://localhost:3050/api';

export interface ApiProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: string;
  discountPrice: string | null;
  image: string;
  images: string[];
  description: string;
  ingredients: string;
  usage: string;
  rating: string;
  reviewCount: number;
  variants: { name: string; value: string }[];
  inStock: boolean;
  isNew: boolean;
  isBestseller: boolean;
  brand_id: number;
  subcategory_id: number;
  isFeatured: boolean;
}

export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategoryId?: number;
  brandId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  sort?: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'new_random' | 'id_desc';
}

export interface ApiBrand {
  id: number | string;
  name: string;
  description: string;
  website?: string | null;
  logo_url?: string | null;
  logo?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  full_description?: string;
  fullDescription?: string;
  country?: string;
  founded?: string;
  philosophy?: string;
  highlights?: string[];
  productsCount?: string | number;
}

export interface BrandsResponse {
  brands: ApiBrand[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface BrandsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  filter?: 'featured' | 'popular' | 'new';
}

export const api = {
  async getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId.toString());
    if (params.brandId) searchParams.append('brandId', params.brandId.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString());
    if (params.isNew !== undefined) searchParams.append('isNew', params.isNew.toString());
    if (params.isBestseller !== undefined) searchParams.append('isBestseller', params.isBestseller.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductById(id: string): Promise<ApiProduct> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async searchProducts(query: string): Promise<ApiProduct[]> {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
  },

  async getBrands(params: BrandsParams = {}): Promise<BrandsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.filter) searchParams.append('filter', params.filter);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/brands${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  },

  async getBrandById(id: string | number): Promise<ApiBrand> {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`);
    if (!response.ok) throw new Error('Failed to fetch brand');
    return response.json();
  },
};
