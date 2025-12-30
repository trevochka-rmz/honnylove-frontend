import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts, ProductsResult } from "@/hooks/useProducts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 9;

const Sales = () => {
  const [sortBy, setSortBy] = useState("discount");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useProducts({
    isOnSale: true,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const result: ProductsResult = data || {
    products: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: ITEMS_PER_PAGE,
    hasMore: false,
  };

  // Client-side sorting for discount percentage
  const sortedProducts = [...result.products].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        const discountA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
        const discountB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
        return discountB - discountA;
      case "price-asc":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-desc":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      default:
        return 0;
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🎉</div>
            <div className="absolute bottom-4 right-4 text-6xl">💝</div>
            <div className="absolute top-1/2 left-1/4 text-4xl">✨</div>
          </div>
          <div className="relative z-10 text-center text-primary-foreground">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm mb-4">
              Ограниченное предложение
            </span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Распродажа 🔥
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Скидки до 30% на любимые товары
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white/20 rounded-xl px-6 py-3">
                <div className="text-3xl font-bold">{result.total}</div>
                <div className="text-sm opacity-80">товаров со скидкой</div>
              </div>
              <div className="bg-white/20 rounded-xl px-6 py-3">
                <div className="text-3xl font-bold">до 30%</div>
                <div className="text-sm opacity-80">максимальная скидка</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer Banner */}
        <div className="bg-accent/20 rounded-2xl p-4 mb-8 text-center">
          <p className="text-foreground">
            ⏰ Акция действует до конца месяца! Успейте купить по выгодным ценам
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="font-playfair text-2xl font-semibold">
            Товары со скидкой ({result.total})
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Сортировка:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">По размеру скидки</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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

        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🛍️</span>
            <h3 className="text-xl font-semibold mb-2">Нет товаров со скидкой</h3>
            <p className="text-muted-foreground">
              Следите за обновлениями — скоро появятся новые акции!
            </p>
          </div>
        )}

        {/* Benefits */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">🚚</span>
            <h3 className="font-semibold mb-2">Бесплатная доставка</h3>
            <p className="text-muted-foreground text-sm">При заказе от 3000₽</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">💯</span>
            <h3 className="font-semibold mb-2">Гарантия качества</h3>
            <p className="text-muted-foreground text-sm">Только оригинальная продукция</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="text-4xl mb-3 block">↩️</span>
            <h3 className="font-semibold mb-2">Возврат 14 дней</h3>
            <p className="text-muted-foreground text-sm">Если товар не подошёл</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sales;
