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
  categoryId?: number;
  subcategoryId?: number;
  brandId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  sort?: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'new_random' | 'id_desc';
}

// Category types
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  display_order: number;
  product_count: string;
  parent_id?: number | null;
  children?: ApiCategory[];
}

export interface CategoriesAllResponse {
  success: boolean;
  data: ApiCategory[];
}

export interface CategoryDetailResponse {
  success: boolean;
  data: ApiCategory;
}

// Brand brief type for filters
export interface BrandBrief {
  id: number;
  slug: string;
  name: string;
  logo: string;
}

export interface BrandsBriefResponse {
  success: boolean;
  count: number;
  brands: BrandBrief[];
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

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  refresh_token?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Wishlist types
export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product: ApiProduct;
}

// Cart types
export interface CartItemApi {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: ApiProduct;
  inStock: boolean;
  availableQuantity: string;
  isLowStock: boolean;
  outOfStock: boolean;
  unitPrice: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemApi[];
  summary: {
    itemsTotal: number;
    subtotal: number;
    shipping: number;
    total: number;
  };
  hasItems: boolean;
}

export interface CartUpdateResponse {
  message: string;
  item: CartItemApi;
  cartSummary: {
    itemsTotal: number;
    subtotal: number;
    shipping: number;
    total: number;
  };
}

export const api = {
  async getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId.toString());
    if (params.brandId) searchParams.append('brandId', params.brandId.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString());
    if (params.isNew !== undefined) searchParams.append('isNew', params.isNew.toString());
    if (params.isBestseller !== undefined) searchParams.append('isBestseller', params.isBestseller.toString());
    if (params.isOnSale !== undefined) searchParams.append('isOnSale', params.isOnSale.toString());
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

  // Category endpoints
  async getAllCategories(): Promise<CategoriesAllResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/all`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getCategoryById(id: number): Promise<CategoryDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },

  async getBrandsBrief(): Promise<BrandsBriefResponse> {
    const response = await fetch(`${API_BASE_URL}/brands/brief`);
    if (!response.ok) throw new Error('Failed to fetch brands brief');
    return response.json();
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Неверный email или пароль');
    }
    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка регистрации');
    }
    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json();
  },

  // Wishlist endpoints
  async getWishlist(token: string): Promise<WishlistItem[]> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  },

  async addToWishlist(token: string, productId: number): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add to wishlist');
    }
    return response.json();
  },

  async removeFromWishlist(token: string, productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove from wishlist');
  },

  async clearWishlist(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to clear wishlist');
  },

  // Cart endpoints
  async getCart(token: string): Promise<CartResponse> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  async addToCart(token: string, productId: number, quantity: number = 1): Promise<CartItemApi> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add to cart');
    }
    return response.json();
  },

  async updateCartItem(token: string, cartItemId: number, quantity: number): Promise<CartUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },

  async removeFromCart(token: string, cartItemId: number): Promise<{ message: string; cartSummary: any }> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return response.json();
  },

  async clearCart(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to clear cart');
    return response.json();
  },
};
