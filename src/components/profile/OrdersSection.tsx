import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Package, Loader2 } from 'lucide-react';

export const OrdersSection = () => {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Мои заказы
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show section if there's an error
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Мои заказы
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">У вас пока нет заказов</p>
          <p className="text-sm text-muted-foreground mt-1">Самое время сделать первую покупку!</p>
        </div>
      </div>
    );
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
