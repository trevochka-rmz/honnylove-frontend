import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const isInFavorites = isFavorite(product.id);
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
      navigate('/auth');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.image,
      variant: product.variants?.[0]?.value,
    });
    toast.success('Товар добавлен в корзину');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить в избранное');
      navigate('/auth');
      return;
    }
    toggleFavorite(product.id);
    toast.success(isInFavorites ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  return (
    <Card className="group overflow-hidden border-border hover:shadow-soft transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-secondary text-secondary-foreground font-roboto">
                Новинка
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground font-roboto">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-background/80 hover:bg-background ${
              isInFavorites ? 'text-primary' : ''
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isInFavorites ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="text-xs text-muted-foreground font-roboto mb-1">{product.brand}</p>

          {/* Name */}
          <h3 className="font-roboto font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-roboto">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            {product.discountPrice ? (
              <>
                <span className="font-roboto font-bold text-lg text-primary">
                  {product.discountPrice.toLocaleString('ru-RU')} ₽
                </span>
                <span className="font-roboto text-sm text-muted-foreground line-through">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
              </>
            ) : (
              <span className="font-roboto font-bold text-lg">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full font-roboto"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};
