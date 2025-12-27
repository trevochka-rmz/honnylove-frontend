import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/data/products';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartApiStore } from '@/store/cartApiStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToWishlist, removeFromWishlist, isFavorite } = useWishlistStore();
  const { addToCart } = useCartApiStore();
  
  // Image hover state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  const isInFavorites = isFavorite(product.id);
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Get all images including main image
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (allImages.length <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segmentWidth = rect.width / allImages.length;
    const index = Math.min(Math.floor(x / segmentWidth), allImages.length - 1);
    setCurrentImageIndex(index);
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
      navigate('/auth');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const success = await addToCart(parseInt(product.id), 1);
      if (success) {
        toast.success('Товар добавлен в корзину');
      } else {
        toast.error('Не удалось добавить товар в корзину');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить в избранное');
      navigate('/auth');
      return;
    }
    
    setIsTogglingFavorite(true);
    try {
      if (isInFavorites) {
        const success = await removeFromWishlist(parseInt(product.id));
        if (success) {
          toast.success('Удалено из избранного');
        }
      } else {
        const success = await addToWishlist(parseInt(product.id));
        if (success) {
          toast.success('Добавлено в избранное');
        }
      }
    } catch (error) {
      toast.error('Ошибка при обновлении избранного');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Card className="group overflow-hidden border-border hover:shadow-soft transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div 
          className="relative overflow-hidden bg-muted aspect-square"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={allImages[currentImageIndex] || product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'w-4 bg-primary' 
                      : 'w-1 bg-background/60'
                  }`}
                />
              ))}
            </div>
          )}
          
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
            disabled={isTogglingFavorite}
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
            disabled={!product.inStock || isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};
