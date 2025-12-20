import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/data/products";
import { brands } from "@/data/brands";

// Count products for each brand
const brandsWithCounts = brands.map(brand => ({
  ...brand,
  productsCount: products.filter(p => p.brand.toLowerCase().replace(/\s/g, '') === brand.id).length
}));

const Brands = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Наши бренды
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мы тщательно отбираем лучшие бренды со всего мира, чтобы предложить вам 
            только качественную косметику и товары для дома
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brandsWithCounts.map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              className="group bg-card rounded-2xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {brand.logo}
                </div>
                <h3 className="font-playfair text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {brand.description}
                </p>
                <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  {brand.productsCount} товаров
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Why Choose Section */}
        <section className="mt-16 bg-secondary/30 rounded-3xl p-8 md:p-12">
          <h2 className="font-playfair text-3xl font-bold text-center mb-8">
            Почему наши бренды?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">100% Оригинал</h3>
              <p className="text-muted-foreground text-sm">
                Мы работаем только с официальными дистрибьюторами
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Эко-сознательность</h3>
              <p className="text-muted-foreground text-sm">
                Большинство брендов придерживаются принципов устойчивого развития
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Премиум качество</h3>
              <p className="text-muted-foreground text-sm">
                Только проверенные формулы и ингредиенты
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Brands;
