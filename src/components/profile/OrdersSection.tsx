import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MAX_VISIBLE_ORDERS = 3;

export const OrdersSection = () => {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading || error) return null;
  if (!orders || orders.length === 0) return null;

  const visibleOrders = orders.slice(0, MAX_VISIBLE_ORDERS);
  const hasMore = orders.length > MAX_VISIBLE_ORDERS;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Мои заказы
          <span className="text-sm font-normal text-muted-foreground">({orders.length})</span>
        </h2>
        {hasMore && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders" className="flex items-center gap-1">
              Все заказы
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link to="/orders">
              Посмотреть все заказы ({orders.length})
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
