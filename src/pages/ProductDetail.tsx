import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { VariantSelector } from '@/components/product/VariantSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartApiStore } from '@/store/cartApiStore';
import { StockVariant } from '@/services/api';
import { Heart, ShoppingCart, Star, ChevronLeft, Loader2, ChevronUp, ChevronDown, ChevronRight, ImageOff } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading, refetch, isFetching } = useProduct(productSlug || '');
  const { data: allProductsData } = useProducts({ limit: 50 });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToWishlist, removeFromWishlist, isFavorite } = useWishlistStore();
  const { addToCart } = useCartApiStore();

  const allProducts = allProductsData?.products || [];

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const variantRefetchAttempts = useRef<Record<string, number>>({});

  const referrerPath = location.state?.categoryPath || null;

  const stockVariants = product?.stockVariants || [];
  const expectedVariantCount = Math.max(product?.variantCount || 1, stockVariants.length || 0);
  const hasMultipleVariants = expectedVariantCount > 1;
  const variantsAreIncomplete = hasMultipleVariants && stockVariants.length < expectedVariantCount;
  const isClothing = product?.product_type === 'clothing' || stockVariants.some((variant) => Boolean(variant.options?.['Цвет'] && variant.options?.['Размер']));

  const selectedVariant = useMemo(() => {
    return stockVariants.find(v => v.id === selectedVariantId) || null;
  }, [stockVariants, selectedVariantId]);

  // Current display price/images based on selected variant
  const displayPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.price;
    return product?.price || 0;
  }, [selectedVariant, product]);

  const displayDiscountPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.discountPrice || undefined;
    return product?.discountPrice;
  }, [selectedVariant, product]);

  const displayImages = useMemo(() => {
    if (selectedVariant) {
      return [selectedVariant.image, ...(selectedVariant.images || [])].filter(Boolean).filter(img => img && img.trim() !== '' && !img.includes('undefined'));
    }
    if (!product) return [];
    return [product.image, ...(product.images || [])].filter(Boolean).filter(img => img && img.trim() !== '' && !img.includes('undefined'));
  }, [selectedVariant, product]);

  const displayInStock = selectedVariant ? selectedVariant.inStock : (product?.inStock || false);

  // Set initial variant
  useEffect(() => {
    if (product && stockVariants.length > 0 && (!selectedVariantId || !stockVariants.some((variant) => variant.id === selectedVariantId))) {
      const firstInStock = stockVariants.find(v => v.inStock) || stockVariants[0];
      setSelectedVariantId(firstInStock.id);
    }
  }, [product, stockVariants, selectedVariantId]);

  // Reset on product change
  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantId(null);
    setQuantity(1);
    variantRefetchAttempts.current = {};
  }, [productSlug]);

  // Safeguard: if backend says there are more variants than it returned, refetch without cache.
  useEffect(() => {
    if (!product || !variantsAreIncomplete || isFetching) return;
    const attempts = variantRefetchAttempts.current[product.id] || 0;
    if (attempts < 2) {
      variantRefetchAttempts.current[product.id] = attempts + 1;
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, variantsAreIncomplete, isFetching]);

  // Reset image when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantId]);

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

  const discount = displayDiscountPrice
    ? Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100)
    : 0;

  const buildBreadcrumb = () => {
    const crumbs: { name: string; categoryId: number | null }[] = [];
    if (referrerPath && referrerPath.length > 0) return referrerPath;
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

  const handleSelectVariant = (variant: StockVariant) => {
    setSelectedVariantId(variant.id);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
      navigate('/auth');
      return;
    }

    if (hasMultipleVariants && !selectedVariantId) {
      toast.info('Пожалуйста, выберите вариант товара');
      return;
    }

    setIsAddingToCart(true);
    try {
      const variantId = hasMultipleVariants ? selectedVariantId || undefined : undefined;
      const success = await addToCart(parseInt(product.id), quantity, variantId ?? undefined);
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
        if (success) toast.success('Удалено из избранного');
      } else {
        const success = await addToWishlist(parseInt(product.id));
        if (success) toast.success('Добавлено в избранное');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении избранного');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  const handleBackToCatalog = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-roboto text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-primary">Каталог</Link>
          {breadcrumbPath.map((crumb: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <Link to={`/catalog?categoryId=${crumb.categoryId}`} className="hover:text-primary">
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
            {displayImages.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
                <Button variant="ghost" size="icon" className="h-8 w-8 mx-auto" onClick={handlePrevImage}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 mx-auto" onClick={handleNextImage}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-muted">
              {displayImages.length > 0 ? (
                <img
                  src={displayImages[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="object-contain w-full h-full p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30';
                    placeholder.innerHTML = `
                      <div class="p-4 rounded-full bg-secondary/50 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><line x1="13.5" x2="6" y1="13.5" y2="21"></line><path d="m18 12 2 2 2-2"></path><path d="M21 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path></svg>
                      </div>
                      <span class="text-sm text-muted-foreground font-medium">Изображение скоро появится</span>
                    `;
                    (e.target as HTMLImageElement).parentElement?.appendChild(placeholder);
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30">
                  <div className="p-4 rounded-full bg-secondary/50 mb-3">
                    <ImageOff className="h-8 w-8 text-primary/50" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Изображение скоро появится</span>
                </div>
              )}
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground font-roboto">Новинка</Badge>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-roboto">-{discount}%</Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.brand && <p className="text-sm text-primary font-roboto mb-2">{product.brand}</p>}
            <h1 className="text-3xl font-playfair font-bold mb-4">{product.name}</h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-roboto">
                  {product.rating} ({product.reviewCount} отзывов)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              {displayDiscountPrice ? (
                <>
                  <span className="text-3xl font-roboto font-bold text-primary">
                    {displayDiscountPrice.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xl font-roboto text-muted-foreground line-through">
                    {displayPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </>
              ) : (
                <span className="text-3xl font-roboto font-bold">
                  {displayPrice.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {stockVariants.length > 0 && !variantsAreIncomplete && (
              <VariantSelector
                variants={stockVariants}
                selectedVariantId={selectedVariantId}
                onSelectVariant={handleSelectVariant}
                isClothing={isClothing}
              />
            )}
            {variantsAreIncomplete && (
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground font-roboto">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Загружаем варианты товара...
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="font-roboto mb-2 block">Количество:</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
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
                disabled={!displayInStock || isAddingToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {displayInStock ? 'Добавить в корзину' : 'Нет в наличии'}
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

            {/* Description */}
            <div className="border-t border-border pt-6">
              <h3 className="font-playfair font-semibold text-lg mb-3">Описание</h3>
              <p className="text-sm font-roboto text-foreground/80 leading-relaxed mb-4">
                {product.description}
              </p>
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
              <p className="font-roboto text-muted-foreground">Отзывов пока нет. Будьте первым!</p>
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

export default ProductDetail;
