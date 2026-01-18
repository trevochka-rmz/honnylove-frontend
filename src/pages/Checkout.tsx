import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCartApiStore } from '@/store/cartApiStore';
import { useAuthStore } from '@/store/authStore';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, MapPin, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { russianCities } from '@/data/cities';

const Checkout = () => {
  const { items, summary, isLoading, fetchCart, clearCart } = useCartApiStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    comment: '',
    paymentMethod: 'sbp',
  });

  const [saveAddress, setSaveAddress] = useState(true);
  
  // Get selected item IDs from sessionStorage
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutItems');
    if (stored) {
      try {
        setSelectedIds(JSON.parse(stored));
      } catch {
        // If parsing fails, use all items
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchCart();
    }
  }, [isAuthenticated, navigate, fetchCart]);

  // Pre-fill form with profile data
  useEffect(() => {
    if (profile) {
      const addressParts = profile.address?.split(',') || [];
      const city = addressParts[0]?.trim() || '';
      const street = addressParts.slice(1).join(',').trim() || '';
      
      setFormData(prev => ({
        ...prev,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
        email: profile.email,
        phone: profile.phone || '',
        city: city,
        street: street,
      }));
    }
  }, [profile]);

  // Filter only selected in-stock items
  const availableItems = useMemo(() => {
    const inStockItems = items.filter(item => item.inStock && !item.outOfStock);
    
    // If we have selected IDs, filter by them
    if (selectedIds.length > 0) {
      return inStockItems.filter(item => selectedIds.includes(item.id));
    }
    
    // Otherwise return all in-stock items
    return inStockItems;
  }, [items, selectedIds]);

  const totalPrice = availableItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = totalPrice >= 3000 ? 0 : 300;
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.street || !formData.city) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Save address to profile if checkbox is checked
    if (saveAddress && formData.city && formData.street) {
      const fullAddress = `${formData.city}, ${formData.street}`;
      try {
        await updateProfile.mutateAsync({ address: fullAddress });
      } catch (error) {
        // Silent fail - order will still go through
      }
    }

    toast.success('Заказ успешно оформлен!');
    sessionStorage.removeItem('checkoutItems');
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
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Адрес доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="city" className="font-roboto">
                      Город <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите город" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {russianCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="street" className="font-roboto">
                      Улица, дом, квартира <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="street"
                      required
                      placeholder="ул. Примерная, д. 1, кв. 1"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
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
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">Сохранить адрес в профиле</span>
                  </label>
                  
                  <div>
                    <Label htmlFor="comment" className="font-roboto">
                      Комментарий к заказу
                    </Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="font-roboto"
                      placeholder="Удобное время доставки, код домофона и т.д."
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
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="sbp" id="sbp" />
                      <div className="flex items-center gap-2 flex-1">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <Label htmlFor="sbp" className="font-roboto cursor-pointer flex-1">
                          СБП (Система быстрых платежей)
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex items-center gap-2 flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <Label htmlFor="card" className="font-roboto cursor-pointer flex-1">
                          Банковская карта
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <div className="flex items-center gap-2 flex-1">
                        <Banknote className="h-5 w-5 text-primary" />
                        <Label htmlFor="cash" className="font-roboto cursor-pointer flex-1">
                          Наличными при получении
                        </Label>
                      </div>
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
