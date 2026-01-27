import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { orderApi, PaymentStatusResponse } from '@/services/orderApi';
import { useOrderDetail, getOrderStatusInfo } from '@/hooks/useOrders';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard,
  Package,
  Truck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const OrderStatus = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { getValidToken } = useAuth();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orderIdNum = orderId ? parseInt(orderId, 10) : null;
  const { data: orderDetail, isLoading: orderLoading, refetch: refetchOrder } = useOrderDetail(orderIdNum);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);

  const fetchPaymentStatus = async () => {
    if (!orderIdNum) return;
    
    try {
      const token = await getValidToken();
      if (!token) {
        navigate('/auth');
        return;
      }
      
      const status = await orderApi.getPaymentStatus(token, orderIdNum);
      setPaymentStatus(status);
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [orderIdNum]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPaymentStatus(), refetchOrder()]);
    setIsRefreshing(false);
    toast.success('Статус обновлён');
  };

  if (!isAuthenticated) return null;

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const getPaymentStatusUI = () => {
    if (!paymentStatus) {
      return {
        icon: <Clock className="w-12 h-12 text-amber-500" />,
        title: 'Ожидание оплаты',
        description: 'Статус платежа пока недоступен',
        bgColor: 'bg-amber-50',
      };
    }

    switch (paymentStatus.payment_status) {
      case 'succeeded':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
          title: 'Оплата успешна!',
          description: 'Ваш заказ оплачен и передан в обработку',
          bgColor: 'bg-green-50',
        };
      case 'canceled':
        return {
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          title: 'Оплата отменена',
          description: 'Платёж был отменён или не прошёл',
          bgColor: 'bg-red-50',
        };
      case 'waiting_for_capture':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600" />,
          title: 'Обработка платежа',
          description: 'Платёж обрабатывается, подождите немного',
          bgColor: 'bg-blue-50',
        };
      default:
        return {
          icon: <Clock className="w-12 h-12 text-amber-500" />,
          title: 'Ожидание оплаты',
          description: 'Платёж ожидает завершения',
          bgColor: 'bg-amber-50',
        };
    }
  };

  const statusUI = getPaymentStatusUI();
  const orderStatusInfo = orderDetail ? getOrderStatusInfo(orderDetail.status) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Payment Status Card */}
          <Card>
            <CardContent className="p-8">
              <div className={`rounded-2xl ${statusUI.bgColor} p-6 text-center space-y-4`}>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {statusUI.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-playfair font-bold">{statusUI.title}</h1>
                  <p className="text-muted-foreground">{statusUI.description}</p>
                </div>

                {paymentStatus?.payment_details && (
                  <div className="pt-4 border-t border-border/50 space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {paymentStatus.payment_details.payment_method?.type === 'bank_card' 
                          ? `Карта •••• ${paymentStatus.payment_details.payment_method.card?.last4}`
                          : paymentStatus.payment_details.payment_method?.type === 'sbp'
                          ? 'СБП'
                          : 'Онлайн оплата'}
                      </span>
                    </div>
                    <p className="font-semibold text-lg">
                      {parseFloat(paymentStatus.payment_details.amount.value).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="mt-4"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Обновить статус
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderDetail && (
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Заказ #{orderDetail.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Status */}
                {orderStatusInfo && (
                  <div className={`rounded-lg p-3 ${orderStatusInfo.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{orderStatusInfo.icon}</span>
                      <span className={`font-medium ${orderStatusInfo.color}`}>
                        {orderStatusInfo.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="font-medium">Товары:</h3>
                  {orderDetail.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} шт.</p>
                      </div>
                      <p className="text-sm font-medium">
                        {item.subtotal.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span>{parseFloat(orderDetail.shipping_cost) === 0 ? 'Бесплатно' : `${parseFloat(orderDetail.shipping_cost).toLocaleString('ru-RU')} ₽`}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Итого:</span>
                    <span className="text-primary">
                      {parseFloat(orderDetail.total_amount).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Адрес доставки:</p>
                      <p className="text-sm text-muted-foreground">{orderDetail.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="flex-1"
            >
              Мои заказы
            </Button>
            <Button
              onClick={() => navigate('/catalog')}
              className="flex-1"
            >
              Продолжить покупки
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderStatus;
