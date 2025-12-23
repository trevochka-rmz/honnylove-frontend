import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-playfair font-bold mb-4">Корзина пуста</h1>
            <p className="text-muted-foreground font-roboto mb-8">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Button size="lg" asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 3000 ? 0 : 300;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair font-bold mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.variant}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-roboto font-medium mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground font-roboto">
                          {item.variant}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1, item.variant)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-sm font-roboto">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1, item.variant)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id, item.variant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-roboto font-bold text-lg">
                        {((item.discountPrice || item.price) * item.quantity).toLocaleString(
                          'ru-RU'
                        )}{' '}
                        ₽
                      </div>
                      {item.discountPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-playfair font-bold text-xl mb-6">Итого</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-roboto">
                    <span className="text-muted-foreground">Товары:</span>
                    <span className="font-medium">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex justify-between font-roboto">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                    </span>
                  </div>
                  {totalPrice < 3000 && (
                    <p className="text-xs text-muted-foreground font-roboto">
                      Добавьте товаров на {(3000 - totalPrice).toLocaleString('ru-RU')} ₽ для
                      бесплатной доставки
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-roboto">
                    <span className="font-semibold text-lg">К оплате:</span>
                    <span className="font-bold text-2xl text-primary">
                      {finalTotal.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <Button size="lg" className="w-full font-roboto mb-3" onClick={() => navigate('/checkout')}>
                  Оформить заказ
                </Button>

                <Button variant="outline" size="lg" className="w-full font-roboto" asChild>
                  <Link to="/catalog">Продолжить покупки</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
