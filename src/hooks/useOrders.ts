import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  discountPrice: number | null;
  subtotal: number;
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
  items: OrderItem[];
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

const API_URL = `${API_BASE_URL}/api`;

export const useOrders = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch(`${API_URL}/orders/orders`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data: OrdersResponse = await response.json();
      return data.data || [];
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrderDetail = (orderId: number | null) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data: OrderDetailResponse = await response.json();
      return data.data;
    },
    enabled: !!accessToken && !!orderId,
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
