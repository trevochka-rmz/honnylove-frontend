import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Package, Phone } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-playfair font-bold text-foreground">
                Заказ успешно оформлен!
              </h1>
              {orderNumber && (
                <p className="text-lg text-muted-foreground">
                  Номер заказа: <span className="font-semibold text-foreground">{orderNumber}</span>
                </p>
              )}
            </div>

            <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Менеджер свяжется с вами в ближайшее время для подтверждения заказа.
                </p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Package className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Вы можете отслеживать статус заказа в личном кабинете.
                </p>
              </div>
            </div>

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

            {orderId && (
              <Button
                onClick={() => navigate(`/order/${orderId}`)}
                variant="link"
                className="text-sm"
              >
                Посмотреть детали заказа
              </Button>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
