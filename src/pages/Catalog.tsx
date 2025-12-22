// src/pages/Catalog.tsx
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { getProducts, getBrands as getApiBrands } from '@/api/productApi'; // Изменено: импортируем API
import { Product } from '@/data/products'; // Интерфейс
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Catalog = () => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const newParam = searchParams.get('new');
    const bestsellerParam = searchParams.get('bestseller');

    const [products, setProducts] = useState<Product[]>([]); // Новое: state для fetched products
    const [brands, setBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(true); // Новое: loading state
    const [error, setError] = useState<string | null>(null); // Новое: error state
    const [page, setPage] = useState(1);
    const limit = 20; // Увеличили лимит

    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        categoryParam ? [categoryParam] : []
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [sortBy, setSortBy] = useState<string>('popular');

    // Загрузка продуктов с фильтрами
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                // Собираем фильтры для API
                const apiFilters = {
                    category: selectedCategories.join(','),
                    isNew: newParam === 'true' || undefined,
                    isBestseller: bestsellerParam === 'true' || undefined,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    brands: selectedBrands.join(','),
                    page,
                    limit,
                };
                const data = await getProducts(apiFilters);
                setProducts(data);
            } catch (err) {
                setError('Ошибка загрузки товаров');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [
        selectedBrands,
        selectedCategories,
        priceRange,
        sortBy,
        categoryParam,
        newParam,
        bestsellerParam,
        page,
    ]);

    // Загрузка брендов
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await getApiBrands();
                setBrands(data.map((b) => b.name).sort());
            } catch (err) {
                console.error('Ошибка загрузки брендов');
            }
        };
        loadBrands();
    }, []);

    const handleBrandChange = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand)
                ? prev.filter((b) => b !== brand)
                : [...prev, brand]
        );
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleReset = () => {
        setSelectedBrands([]);
        setSelectedCategories([]);
        setPriceRange([0, 5000]);
    };

    const filterSidebar = (
        <FilterSidebar
            selectedBrands={selectedBrands}
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            onBrandChange={handleBrandChange}
            onCategoryChange={handleCategoryChange}
            onPriceChange={setPriceRange}
            onReset={handleReset}
        />
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <p>Загрузка товаров...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <p className="text-red-500">{error}</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-playfair font-bold mb-2">
                        Каталог
                    </h1>
                    <p className="text-muted-foreground font-roboto">
                        Найдено товаров: {products.length}
                    </p>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block">{filterSidebar}</div>
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6 gap-4">
                            {/* Mobile Filter */}
                            <Sheet>
                                <SheetTrigger asChild className="lg:hidden">
                                    <Button variant="outline" size="sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Фильтры
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-80 overflow-y-auto"
                                >
                                    {filterSidebar}
                                </SheetContent>
                            </Sheet>
                            {/* Sort */}
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm font-roboto text-muted-foreground hidden sm:inline">
                                    Сортировка:
                                </span>
                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                >
                                    <SelectTrigger className="w-[180px] font-roboto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">
                                            По популярности
                                        </SelectItem>
                                        <SelectItem value="price-asc">
                                            Цена: по возрастанию
                                        </SelectItem>
                                        <SelectItem value="price-desc">
                                            Цена: по убыванию
                                        </SelectItem>
                                        <SelectItem value="rating">
                                            По рейтингу
                                        </SelectItem>
                                        <SelectItem value="new">
                                            Сначала новые
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Brands Section */}
                        <div className="mb-6">
                            <h2 className="text-xl mb-2">Бренды:</h2>
                            <p>{brands.join(', ')}</p>
                        </div>
                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-lg font-roboto text-muted-foreground">
                                    Товары не найдены. Попробуйте изменить
                                    фильтры.
                                </p>
                            </div>
                        )}
                        {/* Пагинация */}
                        <div className="mt-6 flex justify-center gap-4">
                            <Button
                                onClick={() => {
                                    if (page > 1) setPage(page - 1);
                                }}
                                disabled={page === 1}
                            >
                                Предыдущая
                            </Button>
                            <span className="py-2">Страница {page}</span>
                            <Button onClick={() => setPage(page + 1)}>
                                Следующая
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Catalog;
