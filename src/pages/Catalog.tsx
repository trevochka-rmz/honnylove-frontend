import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { useProducts, ProductsResult } from '@/hooks/useProducts';
import { useAllCategories, useCategory } from '@/hooks/useCategories';
import { useBrandsBrief } from '@/hooks/useBrandsBrief';
import { ProductsParams, ApiCategory } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, Loader2, ChevronRight, X } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 9;

// Subcategory card component with fixed dimensions
const SubcategoryCard = ({ category, onClick }: { category: ApiCategory; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center p-3 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-300 w-[100px] h-[100px] flex-shrink-0"
  >
    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 bg-secondary flex-shrink-0">
      <img
        src={category.image_url}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
    </div>
    <span className="text-xs font-medium text-center group-hover:text-primary transition-colors line-clamp-2 leading-tight">
      {category.name}
    </span>
  </button>
);

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryIdParam = searchParams.get('categoryId');
  const brandIdParam = searchParams.get('brandId');
  const newParam = searchParams.get('new');
  const bestsellerParam = searchParams.get('bestseller');
  const pageParam = searchParams.get('page');

  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>(
    brandIdParam ? [parseInt(brandIdParam)] : []
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryIdParam ? parseInt(categoryIdParam) : null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>('id_desc');

  // Fetch all categories for navigation
  const { data: allCategories = [] } = useAllCategories();
  
  // Fetch current category details for subcategories
  const { data: currentCategoryData } = useCategory(selectedCategoryId);

  // Fetch brands for filter display
  const { data: brandsBrief = [] } = useBrandsBrief();

  // Update from URL params
  useEffect(() => {
    if (categoryIdParam) {
      setSelectedCategoryId(parseInt(categoryIdParam));
      setCurrentPage(1);
    }
    if (brandIdParam) {
      setSelectedBrandIds([parseInt(brandIdParam)]);
      setCurrentPage(1);
    }
  }, [categoryIdParam, brandIdParam]);

  // Map frontend sort values to API sort values
  const getSortParam = (sort: string): ProductsParams['sort'] => {
    switch (sort) {
      case 'price-asc': return 'price_asc';
      case 'price-desc': return 'price_desc';
      case 'rating': return 'rating';
      case 'new': return 'new_random';
      case 'popular': return 'popularity';
      default: return 'id_desc';
    }
  };

  // Build API params
  const apiParams: ProductsParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sort: getSortParam(sortBy),
  };

  if (selectedCategoryId) {
    apiParams.categoryId = selectedCategoryId;
  }
  if (selectedBrandIds.length === 1) {
    apiParams.brandId = selectedBrandIds[0];
  }
  if (newParam === 'true') {
    apiParams.isNew = true;
  }
  if (bestsellerParam === 'true') {
    apiParams.isBestseller = true;
  }
  if (priceRange[0] > 0) {
    apiParams.minPrice = priceRange[0];
  }
  if (priceRange[1] < 10000) {
    apiParams.maxPrice = priceRange[1];
  }

  const { data, isLoading } = useProducts(apiParams);
  
  const result: ProductsResult = data || {
    products: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: ITEMS_PER_PAGE,
    hasMore: false,
  };

  const handleBrandChange = (brandId: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]
    );
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    if (categoryId) {
      setSearchParams({ categoryId: categoryId.toString() });
    } else {
      searchParams.delete('categoryId');
      setSearchParams(searchParams);
    }
  };

  const handleReset = () => {
    setSelectedBrandIds([]);
    setSelectedCategoryId(null);
    setPriceRange([0, 10000]);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleRemoveBrandFilter = (brandId: number) => {
    setSelectedBrandIds((prev) => prev.filter((b) => b !== brandId));
    setCurrentPage(1);
  };

  const handleRemoveCategoryFilter = () => {
    setSelectedCategoryId(null);
    searchParams.delete('categoryId');
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Get breadcrumb path for current category
  const getBreadcrumbPath = (): { name: string; categoryId: number }[] => {
    if (!selectedCategoryId || allCategories.length === 0) return [];
    
    const path: { name: string; categoryId: number }[] = [];
    
    const findCategory = (categories: ApiCategory[], targetId: number, currentPath: { name: string; categoryId: number }[]): boolean => {
      for (const cat of categories) {
        if (cat.id === targetId) {
          path.push(...currentPath, { name: cat.name, categoryId: cat.id });
          return true;
        }
        if (cat.children && cat.children.length > 0) {
          if (findCategory(cat.children, targetId, [...currentPath, { name: cat.name, categoryId: cat.id }])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findCategory(allCategories, selectedCategoryId, []);
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();
  const subcategories = currentCategoryData?.children || [];

  // Get selected brand names for filter display
  const getSelectedBrandNames = () => {
    return selectedBrandIds.map(id => {
      const brand = brandsBrief.find(b => b.id === id);
      return brand ? { id, name: brand.name } : null;
    }).filter(Boolean) as { id: number; name: string }[];
  };

  const selectedBrands = getSelectedBrandNames();
  const hasActiveFilters = selectedBrandIds.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000;

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

  // Handle product click to pass category path
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`, { 
      state: { categoryPath: breadcrumbPath }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const filterSidebar = (
    <FilterSidebar
      selectedBrandIds={selectedBrandIds}
      selectedCategoryId={selectedCategoryId}
      priceRange={priceRange}
      onBrandChange={handleBrandChange}
      onCategoryChange={handleCategorySelect}
      onPriceChange={setPriceRange}
      onReset={handleReset}
      categories={allCategories}
    />
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {breadcrumbPath.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap">
            <button 
              onClick={() => handleCategorySelect(null)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Каталог
            </button>
            {breadcrumbPath.map((cat, index) => (
              <div key={cat.categoryId} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => handleCategorySelect(cat.categoryId)}
                  className={`transition-colors ${
                    index === breadcrumbPath.length - 1 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              </div>
            ))}
          </nav>
        )}

        {/* Title Row */}
        <div className="mb-6">
          <h1 className="text-3xl font-playfair font-bold">
            {currentCategoryData?.name || 'Каталог'}
          </h1>
          <p className="text-muted-foreground font-roboto">
            Найдено товаров: {result.total}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">{filterSidebar}</div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Subcategories - aligned with products */}
            {subcategories.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {subcategories.map((subcat) => (
                    <SubcategoryCard
                      key={subcat.id}
                      category={subcat}
                      onClick={() => handleCategorySelect(subcat.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  {filterSidebar}
                </SheetContent>
              </Sheet>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {selectedBrands.map((brand) => (
                    <Badge
                      key={brand.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {brand.name}
                      <button
                        onClick={() => handleRemoveBrandFilter(brand.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                      {priceRange[0]} - {priceRange[1]} ₽
                      <button
                        onClick={() => setPriceRange([0, 10000])}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground"
                  >
                    Сбросить все
                  </Button>
                </div>
              )}

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-roboto text-muted-foreground hidden sm:inline">
                  Сортировка:
                </span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] font-roboto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id_desc">По умолчанию</SelectItem>
                    <SelectItem value="popular">По популярности</SelectItem>
                    <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="new">Сначала новые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {result.products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.products.map((product) => (
                    <div key={product.id} onClick={() => handleProductClick(product.id)}>
                      <ProductCard product={product} />
                    </div>
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
              <div className="text-center py-12">
                <p className="text-lg font-roboto text-muted-foreground">
                  Товары не найдены. Попробуйте изменить фильтры.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
