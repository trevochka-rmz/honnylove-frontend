import { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartApiStore } from '@/store/cartApiStore';
import { useAuthStore } from '@/store/authStore';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, summary, isLoading, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartApiStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Selected items for checkout (only in-stock items can be selected)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      fetchCart();
    }
  }, [isAuthenticated, navigate, fetchCart]);

  // Items in stock
  const itemsInStock = useMemo(() => 
    items.filter(item => item.inStock && !item.outOfStock), 
    [items]
  );

  // Initialize selection with all in-stock items
  useEffect(() => {
    if (itemsInStock.length > 0 && selectedIds.length === 0) {
      setSelectedIds(itemsInStock.map(item => item.id));
    }
  }, [itemsInStock]);

  const hasOutOfStock = items.some(item => !item.inStock || item.outOfStock);

  const handleToggleItem = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === itemsInStock.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(itemsInStock.map(item => item.id));
    }
  };

  // Selected items for checkout
  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.includes(item.id) && item.inStock && !item.outOfStock),
    [items, selectedIds]
  );

  // Calculate totals based on selected items
  const selectedTotalPrice = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedItems]
  );
  const deliveryFee = selectedTotalPrice >= 3000 ? 0 : 300;
  const finalTotal = selectedTotalPrice + deliveryFee;

  if (!isAuthenticated) {
    return null;
  }

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

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
      setSelectedIds(prev => prev.filter(id => id !== cartItemId));
    } else {
      await updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    await removeFromCart(cartItemId);
    setSelectedIds(prev => prev.filter(id => id !== cartItemId));
  };

  const handleClearCart = async () => {
    await clearCart();
    setSelectedIds([]);
  };

  const handleCheckout = () => {
    // Store selected item IDs in sessionStorage for checkout page
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedIds));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-playfair font-bold">Корзина</h1>
          <Button variant="outline" onClick={handleClearCart}>
            Очистить корзину
          </Button>
        </div>

        {hasOutOfStock && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Некоторые товары недоступны для заказа. Они будут исключены при оформлении.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            {itemsInStock.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Checkbox 
                  id="select-all"
                  checked={selectedIds.length === itemsInStock.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-roboto cursor-pointer">
                  Выбрать все ({itemsInStock.length})
                </label>
              </div>
            )}

            {items.map((item) => {
              const isInStock = item.inStock && !item.outOfStock;
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <Card 
                  key={item.id} 
                  className={`${!isInStock ? 'opacity-60' : ''} ${isSelected ? 'border-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      {isInStock && (
                        <div className="flex items-center">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                        </div>
                      )}

                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        {!isInStock && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="destructive" className="text-xs">
                              Нет в наличии
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.product.id}`}
                          className="font-roboto font-medium mb-1 line-clamp-2 hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground font-roboto mb-1">
                          {item.product.brand}
                        </p>
                        {item.product.variants?.[0] && (
                          <p className="text-sm text-muted-foreground font-roboto">
                            {item.product.variants[0].value}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={!isInStock}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 text-sm font-roboto">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={!isInStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-roboto font-bold text-lg">
                          {item.subtotal.toLocaleString('ru-RU')} ₽
                        </div>
                        {item.product.discountPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {(parseFloat(item.product.price) * item.quantity).toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.unitPrice.toLocaleString('ru-RU')} ₽ / шт
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-playfair font-bold text-xl mb-6">Итого</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-roboto">
                    <span className="text-muted-foreground">
                      Выбрано товаров ({selectedItems.length} шт.):
                    </span>
                    <span className="font-medium">
                      {selectedTotalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex justify-between font-roboto">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span className="font-medium">
                      {selectedItems.length === 0 
                        ? '—' 
                        : deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                    </span>
                  </div>
                  {selectedTotalPrice > 0 && selectedTotalPrice < 3000 && (
                    <p className="text-xs text-muted-foreground font-roboto">
                      Добавьте товаров на {(3000 - selectedTotalPrice).toLocaleString('ru-RU')} ₽ для
                      бесплатной доставки
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-roboto">
                    <span className="font-semibold text-lg">К оплате:</span>
                    <span className="font-bold text-2xl text-primary">
                      {selectedItems.length === 0 ? '0' : finalTotal.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full font-roboto mb-3" 
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  Оформить заказ
                  {selectedItems.length > 0 && (
                    <span className="ml-2 text-xs">
                      ({selectedItems.length} товар{selectedItems.length === 1 ? '' : selectedItems.length < 5 ? 'а' : 'ов'})
                    </span>
                  )}
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
