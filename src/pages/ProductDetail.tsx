import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartApiStore } from '@/store/cartApiStore';
import { Heart, ShoppingCart, Star, ChevronLeft, Loader2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProductsData } = useProducts({ limit: 50 });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToWishlist, removeFromWishlist, isFavorite } = useWishlistStore();
  const { addToCart } = useCartApiStore();

  const allProducts = allProductsData?.products || [];

  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Get referrer category path from location state
  const referrerPath = location.state?.categoryPath || null;

  // Get all images
  const allImages = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];

  // Set initial variant when product loads
  useEffect(() => {
    if (product && !selectedVariant && product.variants?.[0]?.value) {
      setSelectedVariant(product.variants[0].value);
    }
  }, [product, selectedVariant]);

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-playfair font-bold mb-4">Товар не найден</h1>
          <Button asChild>
            <Link to="/catalog">Вернуться в каталог</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isInFavorites = isFavorite(product.id);

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Build category breadcrumb from product data
  const buildBreadcrumb = () => {
    const crumbs: { name: string; categoryId: number | null }[] = [];
    
    if (referrerPath && referrerPath.length > 0) {
      // Use referrer path if available
      return referrerPath;
    }
    
    // Build from product category data
    if (product.top_category_name && product.top_category_id) {
      crumbs.push({ name: product.top_category_name, categoryId: product.top_category_id });
    }
    if (product.parent_category_name && product.parent_category_id && product.category_level && product.category_level >= 2) {
      crumbs.push({ name: product.parent_category_name, categoryId: product.parent_category_id });
    }
    if (product.category_name && product.category_id && product.category_level && product.category_level >= 3) {
      crumbs.push({ name: product.category_name, categoryId: product.category_id });
    }
    
    return crumbs;
  };

  const breadcrumbPath = buildBreadcrumb();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
      navigate('/auth');
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart(parseInt(product.id), quantity);
      if (success) {
        toast.success(`Добавлено в корзину: ${quantity} шт.`);
      } else {
        toast.error('Не удалось добавить товар в корзину');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
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

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleBackToCatalog = () => {
    // Navigate back with preserved filters
    if (referrerPath && referrerPath.length > 0) {
      const lastCat = referrerPath[referrerPath.length - 1];
      navigate(`/catalog?categoryId=${lastCat.categoryId}`);
    } else if (product.category_id) {
      navigate(`/catalog?categoryId=${product.category_id}`);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-roboto text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">
            Главная
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-primary">
            Каталог
          </Link>
          {breadcrumbPath.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <Link 
                to={`/catalog?categoryId=${crumb.categoryId}`}
                className="hover:text-primary"
              >
                {crumb.name}
              </Link>
            </div>
          ))}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <Button variant="ghost" size="sm" onClick={handleBackToCatalog} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад к каталогу
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mx-auto"
                  onClick={handlePrevImage}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        index === selectedImageIndex
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mx-auto"
                  onClick={handleNextImage}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={allImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground font-roboto">
                  Новинка
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-roboto">
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-primary font-roboto mb-2">{product.brand}</p>
            <h1 className="text-3xl font-playfair font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-roboto">
                {product.rating} ({product.reviewCount} отзывов)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-roboto font-bold text-primary">
                    {product.discountPrice.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xl font-roboto text-muted-foreground line-through">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                </>
              ) : (
                <span className="text-3xl font-roboto font-bold">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <Label className="font-roboto mb-2 block">
                  {product.variants[0].name}:
                </Label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem key={variant.value} value={variant.value}>
                        {variant.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="font-roboto mb-2 block">Количество:</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-roboto font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                className="flex-1 font-roboto"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={isInFavorites ? 'text-primary border-primary' : ''}
              >
                <Heart className={`h-5 w-5 ${isInFavorites ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Description label */}
            <div className="border-t border-border pt-6">
              <h3 className="font-playfair font-semibold text-lg mb-3">Описание</h3>
              <p className="text-sm font-roboto text-foreground/80 leading-relaxed mb-4">
                {product.description}
              </p>
              {/* Skin Type */}
              {product.skin_type && (
                <p className="text-sm font-roboto text-foreground/80">
                  <span className="font-medium">Тип кожи:</span> {product.skin_type}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usage" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="usage">Применение</TabsTrigger>
            <TabsTrigger value="ingredients">Состав</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>
          <TabsContent value="usage" className="mt-6">
            <div className="prose max-w-none">
              {product.usage && (
                <div>
                  <h3 className="font-roboto font-semibold mb-2">Способ применения:</h3>
                  <p className="font-roboto text-foreground/80">{product.usage}</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="ingredients" className="mt-6">
            <p className="font-roboto text-foreground/80">
              {product.ingredients || 'Информация о составе временно недоступна.'}
            </p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-8">
              <p className="font-roboto text-muted-foreground">
                Отзывов пока нет. Будьте первым!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-playfair font-bold mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);

export default ProductDetail;
