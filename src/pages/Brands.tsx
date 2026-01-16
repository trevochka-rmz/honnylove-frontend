import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useBrands } from '@/hooks/useBrands';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Star, Award, Shield, Heart, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 10;

const Brands = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Use debounced search value for API calls only
  const debouncedSearch = useDebounce(searchInput, 300);

  // Only use debounced value for API params
  const apiParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    filter: filterType !== 'all' ? (filterType as 'featured' | 'popular' | 'new' | 'recommended') : undefined,
  };

  const { data: result, isLoading } = useBrands(apiParams);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search input change - don't reset page on every keystroke
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    // Only reset page when starting a new search (not on every character)
    if (value.length === 1) {
      setCurrentPage(1);
    }
  }, []);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const getPaginationNumbers = () => {
    if (!result) return [];
    const totalPages = result.pages;
    const current = currentPage;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push('ellipsis-start');
      }
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Brand card skeleton component
  const BrandCardSkeleton = () => (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="text-center">
        <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-5 w-24 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Always visible */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Наши бренды
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мы тщательно отбираем лучшие бренды со всего мира, чтобы вы получали только качественные продукты
          </p>
        </div>

        {/* Search and Filter - Always visible, not affected by loading */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск брендов..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 font-roboto"
            />
          </div>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Все бренды" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все бренды</SelectItem>
              <SelectItem value="popular">Популярные</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="recommended">Рекомендуемые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brands Grid - Shows skeleton or content */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <BrandCardSkeleton key={i} />
              ))}
            </div>
          ) : !result?.brands || result.brands.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold mb-2">Бренды не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить параметры поиска
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className="text-primary hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {result.brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brands/${brand.slug}`}
                    className="group bg-card rounded-2xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-secondary rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-2xl font-playfair font-bold text-primary">${brand.name.charAt(0)}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-playfair font-bold text-primary">
                            {brand.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-playfair font-semibold text-foreground group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      {brand.productsCount !== undefined && brand.productsCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {brand.productsCount} товаров
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {result.pages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {getPaginationNumbers().map((page, idx) => (
                        <PaginationItem key={idx}>
                          {typeof page === 'string' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < result.pages && handlePageChange(currentPage + 1)}
                          className={currentPage === result.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 pt-16 border-t border-border">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-center mb-12">
            Почему выбирают наши бренды
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-playfair font-semibold text-lg mb-2">Премиум качество</h3>
              <p className="text-muted-foreground text-sm">
                Только проверенные бренды с высоким стандартом качества
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-playfair font-semibold text-lg mb-2">Сертифицировано</h3>
              <p className="text-muted-foreground text-sm">
                Вся продукция имеет необходимые сертификаты
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-playfair font-semibold text-lg mb-2">Оригинальность</h3>
              <p className="text-muted-foreground text-sm">
                Гарантия подлинности каждого продукта
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-playfair font-semibold text-lg mb-2">С заботой о коже</h3>
              <p className="text-muted-foreground text-sm">
                Безопасные формулы для любого типа кожи
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
