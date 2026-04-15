import { useState, useRef, TouchEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartApiStore } from '@/store/cartApiStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToWishlist, removeFromWishlist, isFavorite } = useWishlistStore();
  const { addToCart } = useCartApiStore();
  
  // Image state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Touch handling for mobile swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  const isInFavorites = isFavorite(product.id);
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Get all images including main image
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || allImages.length <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segmentWidth = rect.width / allImages.length;
    const index = Math.min(Math.floor(x / segmentWidth), allImages.length - 1);
    setCurrentImageIndex(index);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setCurrentImageIndex(0);
    }
  };

  // Mobile touch handlers for swipe
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || allImages.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || allImages.length <= 1) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile || allImages.length <= 1) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next image
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      } else {
        // Swipe right - previous image
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    }
  };

  // Build product URL with category path
  const getProductUrl = () => {
    if (product.slug && product.top_category_slug) {
      let path = `/catalog/${product.top_category_slug}`;
      if (product.parent_category_slug) {
        path += `/${product.parent_category_slug}`;
      }
      if (product.category_slug && product.category_level && product.category_level >= 3) {
        path += `/${product.category_slug}`;
      }
      return `${path}/product/${product.slug}`;
    }
    return `/product/${product.slug || product.id}`;
  };

  const hasMultipleVariants = (product.variantCount || 1) > 1;
  const cartItems = useCartApiStore((state) => state.items);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasMultipleVariants) {
      navigate(getProductUrl());
      toast.info('Выберите вариант товара');
      return;
    }
    
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
    e.stopPropagation();
    
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

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const cardContent = (
    <Card className="group overflow-hidden border-border hover:shadow-soft transition-all duration-300">
      <div 
        className="relative overflow-hidden bg-muted aspect-square"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        )}
        
        {/* Error state */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground">
            <ImageOff className="h-12 w-12 mb-2" />
            <span className="text-xs">Фото недоступно</span>
          </div>
        ) : (
          <img
            src={allImages[currentImageIndex] || product.image}
            alt={product.name}
            className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
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

        {/* Category */}
        {product.category_name && (
          <p className="text-xs text-muted-foreground font-roboto mb-3">
            {product.category_name}
          </p>
        )}

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
          {!product.inStock ? 'Нет в наличии' : 'В корзину'}
        </Button>
      </CardContent>
    </Card>
  );

  const productUrl = getProductUrl();

  // On mobile, buttons don't navigate; on desktop, the whole card navigates
  if (isMobile) {
    return (
      <div onClick={() => navigate(productUrl)}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={productUrl}>
      {cardContent}
    </Link>
  );
};

// Skeleton component for loading state
export const ProductCardSkeleton = () => (
  <Card className="overflow-hidden border-border">
    <Skeleton className="aspect-square w-full" />
    <CardContent className="p-4">
      <Skeleton className="h-3 w-16 mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-6 w-24 mb-3" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);