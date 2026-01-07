import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBrands, BrandsResult } from "@/hooks/useBrands";
import { BrandsParams } from "@/services/api";
import { Loader2, Search, ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 15;

const Brands = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  const apiParams: BrandsParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  };

  if (debouncedSearch.trim()) {
    apiParams.search = debouncedSearch.trim();
  }

  if (filterType !== "all") {
    apiParams.filter = filterType as 'featured' | 'popular' | 'new' | 'recommended';
  }

  const { data, isLoading } = useBrands(apiParams);
  
  const result: BrandsResult = data || {
    brands: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: ITEMS_PER_PAGE,
    hasMore: false,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const totalPages = result.pages;
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    
    return pages;
  };

  // Brand card skeleton for loading
  const BrandCardSkeleton = () => (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="text-center">
        <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-6 w-24 mx-auto mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mx-auto mb-3" />
        <Skeleton className="h-6 w-20 mx-auto rounded-full" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Наши бренды
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Мы тщательно отбираем лучшие бренды со всего мира
            </p>
          </div>
          
          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
            {[...Array(10)].map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Наши бренды
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мы тщательно отбираем лучшие бренды со всего мира, чтобы предложить вам 
            только качественную косметику и товары для дома
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск брендов..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все бренды</SelectItem>
              <SelectItem value="recommended">Рекомендуемые</SelectItem>
              <SelectItem value="popular">Популярные</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Total count */}
        <p className="text-muted-foreground text-center mb-6">
          Найдено брендов: {result.total}
        </p>

        {/* Brands Grid */}
        {result.brands.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {result.brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.id}`}
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
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <span className="text-4xl">🧴</span>
                      )}
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {brand.description}
                    </p>
                    <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                      {brand.productsCount} товаров
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {result.pages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {getPaginationNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
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
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary/50 rounded-full flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="font-playfair text-2xl font-semibold text-foreground mb-3">
              Бренды не найдены
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {searchInput 
                ? `По запросу "${searchInput}" ничего не найдено. Попробуйте изменить поисковый запрос.`
                : 'В данной категории пока нет брендов. Скоро здесь появятся новые бренды!'}
            </p>
            <Button variant="outline" onClick={() => { setSearchInput(''); setFilterType('all'); }}>
              Сбросить фильтры
            </Button>
          </div>
        )}

        {/* Why Choose Section */}
        <section className="mt-16 bg-secondary/30 rounded-3xl p-8 md:p-12">
          <h2 className="font-playfair text-3xl font-bold text-center mb-8">
            Почему наши бренды?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">100% Оригинал</h3>
              <p className="text-muted-foreground text-sm">
                Мы работаем только с официальными дистрибьюторами
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Эко-сознательность</h3>
              <p className="text-muted-foreground text-sm">
                Большинство брендов придерживаются принципов устойчивого развития
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Премиум качество</h3>
              <p className="text-muted-foreground text-sm">
                Только проверенные формулы и ингредиенты
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Brands;
