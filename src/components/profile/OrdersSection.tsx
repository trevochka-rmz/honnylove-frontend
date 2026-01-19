import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Package } from 'lucide-react';

export const OrdersSection = () => {
  const { data: orders, isLoading, error } = useOrders();

  // Don't show anything while loading or on error
  if (isLoading || error) {
    return null;
  }

  // Don't show section if no orders
  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        Мои заказы
        <span className="text-sm font-normal text-muted-foreground">({orders.length})</span>
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
