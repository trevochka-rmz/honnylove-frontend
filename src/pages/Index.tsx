import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Star } from 'lucide-react';

const Index = () => {
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const saleProducts = products.filter((p) => p.discountPrice).slice(0, 4);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <HeroSlider />
        </section>

        {/* New Products */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-playfair font-bold">Новинки</h2>
            </div>
            <Button variant="outline" asChild className="font-roboto">
              <Link to="/catalog?new=true">Смотреть все</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Sale Products */}
        <section className="bg-accent/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-playfair font-bold">Акции</h2>
              </div>
              <Button variant="outline" asChild className="font-roboto">
                <Link to="/sales">Все акции</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-playfair font-bold">Бестселлеры</h2>
            </div>
            <Button variant="outline" asChild className="font-roboto">
              <Link to="/catalog?bestseller=true">Смотреть все</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories Banner */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-playfair font-bold text-center mb-8">
            Популярные категории
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Уход за лицом', link: '/catalog?category=face', emoji: '✨' },
              { name: 'Уход за телом', link: '/catalog?category=body', emoji: '💆' },
              { name: 'Декоративная косметика', link: '/catalog?category=makeup', emoji: '💄' },
              { name: 'Пижамы и халаты', link: '/catalog?category=pajamas', emoji: '🌙' },
              { name: 'Аксессуары', link: '/catalog?category=accessories', emoji: '🎀' },
              { name: 'Все товары', link: '/catalog', emoji: '🛍️' },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={cat.link}
                className="group relative aspect-square rounded-xl bg-gradient-card overflow-hidden hover:shadow-soft transition-all duration-300"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl mb-2">{cat.emoji}</span>
                  <h3 className="font-roboto font-medium text-sm md:text-base group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="font-roboto font-semibold mb-2">Быстрая доставка</h3>
                <p className="text-sm text-muted-foreground font-roboto">
                  Доставим ваш заказ в течение 1-3 дней
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4">
                  <span className="text-3xl">💝</span>
                </div>
                <h3 className="font-roboto font-semibold mb-2">Оригинальная продукция</h3>
                <p className="text-sm text-muted-foreground font-roboto">
                  Работаем только с официальными поставщиками
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/50 mb-4">
                  <span className="text-3xl">🎁</span>
                </div>
                <h3 className="font-roboto font-semibold mb-2">Подарки к заказу</h3>
                <p className="text-sm text-muted-foreground font-roboto">
                  Приятные сюрпризы в каждом заказе
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
