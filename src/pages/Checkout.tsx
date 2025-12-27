import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCartApiStore } from '@/store/cartApiStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Checkout = () => {
  const { items, summary, isLoading, fetchCart, clearCart } = useCartApiStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    comment: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchCart();
      // Pre-fill form with user data
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
        }));
      }
    }
  }, [isAuthenticated, navigate, fetchCart, user]);

  // Filter only in-stock items
  const availableItems = items.filter(item => item.inStock && !item.outOfStock);

  const totalPrice = availableItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = totalPrice >= 3000 ? 0 : 300;
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    toast.success('Заказ успешно оформлен!');
    await clearCart();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
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

  if (availableItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="font-roboto">
                      Имя <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-roboto">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-roboto">
                      Телефон <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Адрес доставки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="city" className="font-roboto">
                      Город <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="font-roboto">
                      Адрес <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="font-roboto">
                      Индекс
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment" className="font-roboto">
                      Комментарий к заказу
                    </Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="font-roboto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Способ оплаты</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="font-roboto cursor-pointer">
                        Банковская карта
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="font-roboto cursor-pointer">
                        Наличными при получении
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-playfair">Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-roboto line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground font-roboto">
                            {item.quantity} шт.
                          </p>
                        </div>
                        <div className="text-sm font-roboto font-medium">
                          {item.subtotal.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm font-roboto">
                      <span className="text-muted-foreground">Товары:</span>
                      <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm font-roboto">
                      <span className="text-muted-foreground">Доставка:</span>
                      <span>{deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-roboto">
                      <span className="font-semibold">Итого:</span>
                      <span className="font-bold text-xl text-primary">
                        {finalTotal.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full font-roboto">
                    Оформить заказ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
