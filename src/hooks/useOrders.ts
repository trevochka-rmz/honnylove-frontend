import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';
import { fetchWithCreds } from '@/services/api';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image: string;
  quantity: number;
  price: number;
  discount_price: number | null;
  line_total: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'completed';
  total_amount: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  shipping_cost: string;
  tax_amount: string;
  discount_amount: string;
  tracking_number: string | null;
  notes: string | null;
  items_count: string;
  total_items_quantity: string;
  items: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface OrderDetailResponse {
  success: boolean;
  order: Order;
}

const API_URL = `${API_BASE_URL}/api`;

// Active orders for profile (pending, paid, processing, shipped, delivered)
export const useActiveOrders = (limit = 5) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['orders', 'active', limit],
    queryFn: async (): Promise<Order[]> => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      ['pending', 'paid', 'processing', 'shipped', 'delivered'].forEach(s => params.append('status', s));
      const response = await fetchWithCreds(`${API_URL}/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data: OrdersResponse = await response.json();
      return data.orders || [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// All orders with pagination
export const useAllOrders = (page = 1, limit = 10) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['orders', 'all', page, limit],
    queryFn: async () => {
      const response = await fetchWithCreds(`${API_URL}/orders?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data: OrdersResponse = await response.json();
      return {
        orders: data.orders || [],
        pagination: data.pagination,
      };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// Keep legacy hook for backward compatibility
export const useOrders = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetchWithCreds(`${API_URL}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data: OrdersResponse = await response.json();
      return data.orders || [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrderDetail = (orderId: number | null) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const response = await fetchWithCreds(`${API_URL}/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data: OrderDetailResponse = await response.json();
      return data.order;
    },
    enabled: isAuthenticated && !!orderId,
    staleTime: 2 * 60 * 1000,
  });
};

export const getOrderStatusInfo = (status: Order['status']) => {
  const statusMap: Record<Order['status'], { label: string; color: string; bgColor: string; icon: string; step: number }> = {
    pending: { label: 'Ожидает обработки', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: '⏳', step: 1 },
    paid: { label: 'Оплачен', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '💳', step: 2 },
    processing: { label: 'В обработке', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '📦', step: 3 },
    shipped: { label: 'Отправлен', color: 'text-cyan-600', bgColor: 'bg-cyan-50', icon: '🚚', step: 4 },
    delivered: { label: 'Доставлен', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: '✅', step: 5 },
    completed: { label: 'Завершён', color: 'text-green-600', bgColor: 'bg-green-50', icon: '🎉', step: 6 },
    cancelled: { label: 'Отменён', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌', step: 0 },
    returned: { label: 'Возвращён', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: '↩️', step: 0 },
  };
  
  return statusMap[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-50', icon: '📋', step: 0 };
};
