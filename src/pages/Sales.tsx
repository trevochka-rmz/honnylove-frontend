import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Sales = () => {
  const [sortBy, setSortBy] = useState("discount");

  const saleProducts = useMemo(() => {
    const filtered = products.filter(p => p.discountPrice && p.discountPrice < p.price);
    
    switch (sortBy) {
      case "discount":
        return [...filtered].sort((a, b) => {
          const discountA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
          const discountB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
          return discountB - discountA;
        });
      case "price-asc":
        return [...filtered].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      case "price-desc":
        return [...filtered].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      default:
        return filtered;
    }
  }, [sortBy]);

  const totalSavings = saleProducts.reduce((acc, product) => {
    return acc + (product.discountPrice ? product.price - product.discountPrice : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🎉</div>
            <div className="absolute bottom-4 right-4 text-6xl">💝</div>
            <div className="absolute top-1/2 left-1/4 text-4xl">✨</div>
          </div>
          <div className="relative z-10 text-center text-primary-foreground">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm mb-4">
              Ограниченное предложение
            </span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Распродажа 🔥
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Скидки до 30% на любимые товары
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white/20 rounded-xl px-6 py-3">
                <div className="text-3xl font-bold">{saleProducts.length}</div>
                <div className="text-sm opacity-80">товаров со скидкой</div>
              </div>
              <div className="bg-white/20 rounded-xl px-6 py-3">
                <div className="text-3xl font-bold">до 30%</div>
                <div className="text-sm opacity-80">максимальная скидка</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer Banner */}
        <div className="bg-accent/20 rounded-2xl p-4 mb-8 text-center">
          <p className="text-foreground">
            ⏰ Акция действует до конца месяца! Успейте купить по выгодным ценам
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="font-playfair text-2xl font-semibold">
            Товары со скидкой ({saleProducts.length})
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Сортировка:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">По размеру скидки</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {saleProducts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🛍️</span>
            <h3 className="text-xl font-semibold mb-2">Нет товаров со скидкой</h3>
            <p className="text-muted-foreground">
              Следите за обновлениями — скоро появятся новые акции!
            </p>
          </div>
        )}

        {/* Benefits */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">🚚</span>
            <h3 className="font-semibold mb-2">Бесплатная доставка</h3>
            <p className="text-muted-foreground text-sm">При заказе от 3000₽</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">💯</span>
            <h3 className="font-semibold mb-2">Гарантия качества</h3>
            <p className="text-muted-foreground text-sm">Только оригинальная продукция</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">↩️</span>
            <h3 className="font-semibold mb-2">Возврат 14 дней</h3>
            <p className="text-muted-foreground text-sm">Если товар не подошёл</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sales;
