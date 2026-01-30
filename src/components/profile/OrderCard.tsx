import { useState } from 'react';
import { Order, getOrderStatusInfo } from '@/hooks/useOrders';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = getOrderStatusInfo(order.status);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: string | number) => {
    return Number(price).toLocaleString('ru-RU') + ' ₽';
  };

  // Progress steps for active orders
  const progressSteps = ['Оформлен', 'Оплачен', 'Собирается', 'Отправлен', 'Доставлен'];
  const currentStep = statusInfo.step;

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Банковская карта';
      case 'cash': return 'Наличные при получении';
      case 'sbp': return 'СБП';
      default: return method;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Order Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${statusInfo.bgColor}`}>
              {statusInfo.icon}
            </div>
            <div>
              <p className="font-semibold">Заказ №{order.id}</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold">{formatPrice(order.total_amount)}</p>
              <p className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Progress Bar - only show for active orders */}
        {currentStep > 0 && currentStep <= 5 && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              {progressSteps.map((step, index) => (
                <div 
                  key={step} 
                  className={`text-xs ${index < currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Товары в заказе ({order.items_count})
            </h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} шт. × {formatPrice(item.discount_price || item.price)}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.line_total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Адрес доставки</p>
              <p className="font-medium">{order.shipping_address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Способ оплаты</p>
              <p className="font-medium">{paymentMethodLabel(order.payment_method)}</p>
            </div>
            {order.tracking_number && (
              <div>
                <p className="text-sm text-muted-foreground">Номер отслеживания</p>
                <p className="font-medium">{order.tracking_number}</p>
              </div>
            )}
            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Комментарий</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="pt-4 border-t border-border space-y-2">
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Скидка</span>
                <span className="text-primary">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Доставка</span>
              <span>{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : 'Бесплатно'}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>Итого</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
