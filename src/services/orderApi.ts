import { API_BASE_URL as BASE_URL } from '@/config/api';

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
  shipping_address: string;
  payment_method: 'cash' | 'card' | 'sbp';
  notes?: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
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
  // Get selected items details for checkout
  async getSelectedItems(token: string, selectedItems: number[]): Promise<SelectedItemsResponse> {
    const response = await fetch(`${API_URL}/cart/selected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ selected_items: selectedItems }),
    });
    if (!response.ok) throw new Error('Failed to fetch selected items');
    return response.json();
  },

  // Checkout with cash payment
  async checkoutCash(token: string, data: CheckoutRequest): Promise<OrderResponse> {
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  // Checkout with card/sbp payment (YooKassa)
  async checkoutWithPayment(token: string, data: CheckoutRequest): Promise<PaymentOrderResponse> {
    const response = await fetch(`${API_URL}/orders/checkout-with-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  // Get payment status for an order
  async getPaymentStatus(token: string, orderId: number): Promise<PaymentStatusResponse> {
    const response = await fetch(`${API_URL}/payments/order/${orderId}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch payment status');
    return response.json();
  },
};
