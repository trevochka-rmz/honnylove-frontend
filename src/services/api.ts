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

export interface ApiBrand {
  id: number;
  name: string;
  description: string;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_description?: string;
  country?: string;
  founded?: string;
  philosophy?: string;
  highlights?: string[];
  productsCount?: string;
}

export const api = {
  async getProducts(): Promise<ApiProduct[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
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

  async getBrands(): Promise<ApiBrand[]> {
    const response = await fetch(`${API_BASE_URL}/brands`);
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  },

  async getBrandById(id: string | number): Promise<ApiBrand> {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`);
    if (!response.ok) throw new Error('Failed to fetch brand');
    return response.json();
  },
};
