import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getBrandById } from '@/api/brandApi';
import { getProducts } from '@/api/productApi';
import { Brand } from '@/data/brands';
import { Product } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Calendar,
    Sparkles,
} from 'lucide-react';

const BrandDetail = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [brandProducts, setBrandProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const brandData = await getBrandById(brandId || '');
                setBrand(brandData);

                // Get products for this brand
                const products = await getProducts({
                    brandId: brandId,
                    limit: 4,
                });
                setBrandProducts(products);
            } catch (err) {
                setError('Бренд не найден');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [brandId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <p>Загрузка бренда...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="font-playfair text-3xl font-bold mb-4">
                        Бренд не найден
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        К сожалению, такой бренд не существует.
                    </p>
                    <Button asChild>
                        <Link to="/brands">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Вернуться к брендам
                        </Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link
                        to="/"
                        className="hover:text-primary transition-colors"
                    >
                        Главная
                    </Link>
                    <span>/</span>
                    <Link
                        to="/brands"
                        className="hover:text-primary transition-colors"
                    >
                        Бренды
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{brand.name}</span>
                </nav>
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background rounded-3xl p-8 md:p-12 mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-background rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-lg">
                            {brand.logo}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                                {brand.name}
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                                {brand.fullDescription}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        {brand.country}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        С {brand.founded} года
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        {brand.philosophy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Highlights */}
                <section className="mb-12">
                    <h2 className="font-playfair text-2xl font-bold mb-6">
                        Преимущества бренда
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {brand.highlights.map((highlight, index) => (
                            <div
                                key={index}
                                className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors"
                            >
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-primary font-bold">
                                        {index + 1}
                                    </span>
                                </div>
                                <p className="text-foreground font-medium">
                                    {highlight}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Products Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-playfair text-2xl font-bold">
                            Товары бренда
                        </h2>
                        <Button asChild variant="outline">
                            <Link to={`/catalog?brand=${brand.name}`}>
                                Смотреть все
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    {brandProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {brandProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-secondary/20 rounded-2xl p-8 text-center">
                            <p className="text-muted-foreground mb-4">
                                Товары этого бренда скоро появятся в каталоге
                            </p>
                            <Button asChild>
                                <Link to="/catalog">Посмотреть все товары</Link>
                            </Button>
                        </div>
                    )}
                </section>
                {/* CTA Section */}
                <section className="bg-primary/10 rounded-3xl p-8 text-center">
                    <h2 className="font-playfair text-2xl font-bold mb-4">
                        Хотите увидеть все товары {brand.name}?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Перейдите в каталог, чтобы увидеть полный ассортимент
                        продукции этого бренда
                    </p>
                    <Button asChild size="lg">
                        <Link to={`/catalog?brand=${brand.name}`}>
                            Перейти в каталог
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BrandDetail;
