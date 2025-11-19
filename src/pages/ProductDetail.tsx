import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { Heart, ShoppingCart, Star, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]?.value || '');
  const [quantity, setQuantity] = useState(1);

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

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.image,
        variant: selectedVariant,
      });
    }
    toast.success(`Добавлено в корзину: ${quantity} шт.`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-roboto text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Главная
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary">
            Каталог
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/catalog">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад к каталогу
          </Link>
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
              <img
                src={product.image}
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
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.success('Добавлено в избранное')}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm font-roboto text-foreground/80 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="ingredients">Состав</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="font-roboto text-foreground/80">{product.description}</p>
              {product.usage && (
                <div className="mt-4">
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
