import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { products } from "@/data/products";
import { Heart, ShoppingBag } from "lucide-react";

const Favorites = () => {
  const { favorites, clearFavorites } = useFavoritesStore();
  
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">
              Избранное
            </h1>
            <p className="text-muted-foreground">
              {favoriteProducts.length > 0 
                ? `${favoriteProducts.length} ${favoriteProducts.length === 1 ? 'товар' : 'товаров'} в избранном`
                : 'Ваш список избранного пуст'
              }
            </p>
          </div>
          {favoriteProducts.length > 0 && (
            <Button variant="outline" onClick={clearFavorites}>
              Очистить всё
            </Button>
          )}
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              В избранном пока ничего нет
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Добавляйте товары в избранное, нажимая на сердечко ❤️ на карточке товара, 
              чтобы не потерять их
            </p>
            <Link to="/catalog">
              <Button className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Перейти в каталог
              </Button>
            </Link>
          </div>
        )}

        {favoriteProducts.length > 0 && (
          <div className="mt-12 bg-secondary/30 rounded-2xl p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">💡 Подсказка</h3>
            <p className="text-muted-foreground">
              Товары в избранном сохраняются автоматически. 
              Вы можете вернуться к ним в любое время!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
