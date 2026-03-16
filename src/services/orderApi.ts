import { API_BASE_URL as BASE_URL } from '@/config/api';
import { fetchWithCreds } from '@/services/api';

const API_URL = `${BASE_URL}/api`;

// Types
export interface CheckoutItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: string;
    discountPrice: string | null;
    image: string;
    brand: string;
  };
  unitPrice: number;
  subtotal: number;
  inStock: boolean;
  availableQuantity: number;
}

export interface SelectedItemsResponse {
  success: boolean;
  data: {
    items: CheckoutItem[];
    summary: {
      itemsTotal: number;
      subtotal: number;
      shipping: number;
      total: number;
    };
    hasItems: boolean;
  };
  selected_count: number;
}

export interface CheckoutRequest {
  selected_items: number[];
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: 'cash' | 'card' | 'sbp';
  notes?: string;
  shipping_cost: number;
  save_address: boolean;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: number;
      user_id: number;
      status: string;
      total_amount: string;
      shipping_address: string;
      payment_method: string;
      created_at: string;
    };
    order_number: string;
    items_count: number;
    needs_payment: boolean;
  };
}

export interface PaymentOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: number;
      status: string;
      total_amount: string;
    };
    order_number: string;
    payment: {
      payment_id: number;
      yookassa_payment_id: string;
      status: string;
      amount: string;
      confirmation_url: string;
    };
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  payment_status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  order_status: string;
  payment_details: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    payment_method?: {
      type: string;
      card?: {
        last4: string;
        card_type: string;
      };
    };
    captured_at?: string;
  };
}

export const orderApi = {
  async getSelectedItems(selectedItems: number[]): Promise<SelectedItemsResponse> {
    const response = await fetchWithCreds(`${API_URL}/cart/selected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_items: selectedItems }),
    });
    if (!response.ok) throw new Error('Failed to fetch selected items');
    return response.json();
  },

  async checkoutCash(data: CheckoutRequest): Promise<OrderResponse> {
    const response = await fetchWithCreds(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Ошибка оформления заказа');
    }
    return response.json();
  },

  async checkoutWithPayment(data: CheckoutRequest): Promise<PaymentOrderResponse> {
    const response = await fetchWithCreds(`${API_URL}/orders/checkout-with-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  async getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
    const response = await fetchWithCreds(`${API_URL}/payments/order/${orderId}/status`);
    if (!response.ok) throw new Error('Failed to fetch payment status');
    return response.json();
  },
};
