import { useState, useEffect, useMemo, useRef } from 'react';
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
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, MapPin, CreditCard, Banknote, Smartphone, Truck, Store } from 'lucide-react';
import { russianCities } from '@/data/cities';
import { orderApi, type CheckoutRequest } from '@/services/orderApi';

const formatPhoneMask = (digits: string): string => {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (!d) return '';
  let result = d.slice(0, 3);
  if (d.length > 3) result += '  ' + d.slice(3, 6);
  if (d.length > 6) result += '-' + d.slice(6, 8);
  if (d.length > 8) result += '-' + d.slice(8, 10);
  return result;
};

const Checkout = () => {
  const { items, summary, isLoading, fetchCart, clearCart } = useCartApiStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    comment: '',
    paymentMethod: 'sbp',
  });

  const [saveAddress, setSaveAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetched = useRef(false);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutItems');
    if (stored) {
      try {
        setSelectedIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCart();
    }
  }, [isAuthenticated, navigate]);

  // Check email verification
  useEffect(() => {
    if (profile && profile.is_verified === false) {
      toast.error('Для оформления заказа необходимо подтвердить email');
      navigate('/profile');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (profile) {
      const addressParts = profile.address?.split(',') || [];
      const city = addressParts[0]?.trim() || '';
      const street = addressParts.slice(1).join(',').trim() || '';
      
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone ? profile.phone.replace(/^\+7/, '') : '',
        city: city,
        street: street,
      }));
    }
  }, [profile]);

  const availableItems = useMemo(() => {
    const inStockItems = items.filter(item => item.inStock && !item.outOfStock);
    if (selectedIds.length > 0) {
      return inStockItems.filter(item => selectedIds.includes(item.id));
    }
    return inStockItems;
  }, [items, selectedIds]);

  const totalPrice = availableItems.reduce((sum, item) => sum + item.subtotal, 0);
  
  const isPickup = deliveryType === 'pickup';
  const isKyzyl = formData.city === 'Кызыл';
  const deliveryFee = isPickup ? 0 : (isKyzyl ? 0 : (totalPrice >= 3000 ? 0 : 300));
  const finalTotal = totalPrice + deliveryFee;

  const storeAddress = settings?.address || 'г. Кызыл, ул. Кочетова, д. 1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Введите корректный номер телефона (10 цифр)');
      return;
    }

    if (!isPickup && (!formData.street || !formData.city)) {
      toast.error('Пожалуйста, укажите адрес доставки');
      return;
    }

    if (availableItems.length === 0) {
      toast.error('Нет товаров для оформления');
      return;
    }

    setIsSubmitting(true);

    try {

      const shippingAddress = isPickup 
        ? `Самовывоз: ${storeAddress}`
        : `${formData.city}, ${formData.street}`;
      
      const selectedItemIds = availableItems.map(item => item.id);

      const checkoutData: CheckoutRequest = {
        selected_items: selectedItemIds,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_phone: `+7${formData.phone}`,
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod as 'cash' | 'card' | 'sbp',
        notes: formData.comment || undefined,
        shipping_cost: deliveryFee,
        save_address: !isPickup && saveAddress,
      };

      if (formData.paymentMethod === 'cash') {
        const response = await orderApi.checkoutCash(checkoutData);
        sessionStorage.removeItem('checkoutItems');
        await clearCart();
        navigate(`/order-success?order_id=${response.data.order.id}&order_number=${response.data.order_number}`);
      } else {
        const response = await orderApi.checkoutWithPayment(checkoutData);
        sessionStorage.removeItem('checkoutItems');
        await clearCart();
        if (response.data.payment?.confirmation_url) {
          window.location.href = response.data.payment.confirmation_url;
        } else {
          toast.error('Ошибка получения ссылки на оплату');
          navigate(`/order/${response.data.order.id}`);
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error?.message || 'Ошибка оформления заказа');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="font-roboto">
                        Имя <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="font-roboto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-roboto">
                        Фамилия <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="font-roboto"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-roboto">
                      Телефон <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-roboto">
                        +7
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="___  ___-__-__"
                        maxLength={15}
                        value={formData.phone ? formatPhoneMask(formData.phone) : ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: digits });
                        }}
                        className="font-roboto rounded-l-none tracking-wider"
                      />
                    </div>
                    {formData.phone && formData.phone.length < 10 && (
                      <p className="text-xs text-destructive mt-1">Введите 10 цифр номера</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Способ получения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) => setDeliveryType(value as 'delivery' | 'pickup')}
                    className="space-y-3"
                  >
                    <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      deliveryType === 'delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}>
                      <RadioGroupItem value="delivery" id="delivery-type" />
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="font-roboto flex-1">Доставка</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      deliveryType === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}>
                      <RadioGroupItem value="pickup" id="pickup-type" />
                      <Store className="h-5 w-5 text-primary" />
                      <span className="font-roboto flex-1">Самовывоз</span>
                    </label>
                  </RadioGroup>

                  {isPickup ? (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Store className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Адрес магазина</p>
                          <p className="text-sm text-muted-foreground mt-1">{storeAddress}</p>
                          <p className="text-xs text-primary mt-2 font-medium">Бесплатно</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      
                      {formData.city && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm">
                          <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                          {isKyzyl ? (
                            <span className="text-primary font-medium">Бесплатная доставка по г. Кызыл</span>
                          ) : totalPrice >= 3000 ? (
                            <span className="text-primary font-medium">Бесплатная доставка при заказе от 3000₽</span>
                          ) : (
                            <span className="text-muted-foreground">
                              Доставка: 300₽ (бесплатно при заказе от 3000₽)
                            </span>
                          )}
                        </div>
                      )}
                      
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
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-muted-foreground">Сохранить адрес в профиле</span>
                      </label>
                    </>
                  )}
                  
                  <div>
                    <Label htmlFor="comment" className="font-roboto">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="font-roboto"
                      placeholder="Удобное время доставки, код домофона, телеграм для связи и т.д."
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
                    <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      formData.paymentMethod === 'sbp' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}>
                      <RadioGroupItem value="sbp" id="sbp" />
                      <Smartphone className="h-5 w-5 text-primary" />
                      <span className="font-roboto flex-1">СБП (Система быстрых платежей)</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      formData.paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}>
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-roboto flex-1">Банковская карта</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      formData.paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}>
                      <RadioGroupItem value="cash" id="cash" />
                      <Banknote className="h-5 w-5 text-primary" />
                      <span className="font-roboto flex-1">Оплата при получении</span>
                    </label>
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
                      <span className="text-muted-foreground">
                        {isPickup ? 'Самовывоз:' : 'Доставка:'}
                      </span>
                      <span className={deliveryFee === 0 ? 'text-primary font-medium' : ''}>
                        {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                      </span>
                    </div>
                    {!isPickup && isKyzyl && deliveryFee === 0 && (
                      <p className="text-xs text-primary">* Бесплатная доставка по г. Кызыл</p>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-roboto">
                      <span className="font-semibold">Итого:</span>
                      <span className="font-bold text-xl text-primary">
                        {finalTotal.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full font-roboto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Оформление...
                      </>
                    ) : (
                      'Оформить заказ'
                    )}
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
