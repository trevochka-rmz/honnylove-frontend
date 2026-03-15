import { useActiveOrders } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const OrdersSection = () => {
  const { data: orders, isLoading, error } = useActiveOrders(5);

  if (isLoading || error) return null;
  if (!orders || orders.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Активные заказы
          <span className="text-sm font-normal text-muted-foreground">({orders.length})</span>
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders" className="flex items-center gap-1">
            Все заказы
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
