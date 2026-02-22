import { API_BASE_URL as BASE_URL } from '@/config/api';

const API_BASE_URL = `${BASE_URL}/api`;

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
  brandIds?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  sort?: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'new_random' | 'newest' | 'id_desc';
}

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
  slug?: string;
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
  filter?: 'featured' | 'popular' | 'new' | 'recommended';
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
}

export interface AuthResponse {
  user: AuthUser;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product: ApiProduct;
}

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

// Track if a refresh is already in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const tryRefreshToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

const forceLogout = () => {
  const { useAuthStore } = require('@/store/authStore');
  const state = useAuthStore.getState();
  if (state.isAuthenticated) {
    state.logout();
    window.location.href = '/auth';
  }
};

// Helper for all fetch calls - always include credentials for HttpOnly cookies
export const fetchWithCreds = async (url: string, options: RequestInit = {}, _isRetry = false): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { ...options.headers },
  });

  if (response.status === 401 && !_isRetry) {
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    if (!isAuthEndpoint) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the original request with the new cookie-based token
        return fetchWithCreds(url, options, true);
      }
      forceLogout();
    }
  }

  return response;
};

export const api = {
  async getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId.toString());
    if (params.brandId) searchParams.append('brandId', params.brandId.toString());
    if (params.brandIds) searchParams.append('brandId', params.brandIds);
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
    
    const response = await fetchWithCreds(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductById(id: string): Promise<ApiProduct> {
    const response = await fetchWithCreds(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async searchProducts(query: string): Promise<ApiProduct[]> {
    const response = await fetchWithCreds(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
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
    
    const response = await fetchWithCreds(url);
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  },

  async getBrandById(id: string | number): Promise<ApiBrand> {
    const response = await fetchWithCreds(`${API_BASE_URL}/brands/${id}`);
    if (!response.ok) throw new Error('Failed to fetch brand');
    return response.json();
  },

  async getAllCategories(): Promise<CategoriesAllResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/categories/all`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getCategoryById(id: number): Promise<CategoryDetailResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },

  async getBrandsBrief(): Promise<BrandsBriefResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/brands/brief`);
    if (!response.ok) throw new Error('Failed to fetch brands brief');
    return response.json();
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Неверный email или пароль');
    }
    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Ошибка регистрации');
    }
    return response.json();
  },

  async logout(): Promise<void> {
    await fetchWithCreds(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  // Wishlist endpoints
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await fetchWithCreds(`${API_BASE_URL}/wishlist`);
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  },

  async addToWishlist(productId: number): Promise<WishlistItem> {
    const response = await fetchWithCreds(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add to wishlist');
    }
    return response.json();
  },

  async removeFromWishlist(productId: number): Promise<void> {
    const response = await fetchWithCreds(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from wishlist');
  },

  async clearWishlist(): Promise<void> {
    const response = await fetchWithCreds(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear wishlist');
  },

  // Cart endpoints
  async getCart(): Promise<CartResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/cart`);
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  async addToCart(productId: number, quantity: number = 1): Promise<CartItemApi> {
    const response = await fetchWithCreds(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add to cart');
    }
    return response.json();
  },

  async updateCartItem(cartItemId: number, quantity: number): Promise<CartUpdateResponse> {
    const response = await fetchWithCreds(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },

  async removeFromCart(cartItemId: number): Promise<{ message: string; cartSummary: any }> {
    const response = await fetchWithCreds(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return response.json();
  },

  async clearCart(): Promise<{ message: string }> {
    const response = await fetchWithCreds(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear cart');
    return response.json();
  },
};
