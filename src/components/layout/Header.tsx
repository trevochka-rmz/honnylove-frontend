import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartApiStore } from '@/store/cartApiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSearchProducts } from '@/hooks/useSearchProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';

export const Header = () => {
  const { getTotalItems, fetchCart } = useCartApiStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchProducts(debouncedQuery);

  // Fetch cart and wishlist on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  // Close search dropdown when clicking outside (handle both mouse and touch)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideDesktop = searchRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const totalItems = getTotalItems();
  const wishlistCount = wishlistItems.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Build product URL with category path for search results
  const getProductUrl = (product: any) => {
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

  const handleProductClick = (product: any) => {
    navigate(getProductUrl(product));
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const navigation = [
    { name: 'Категории', href: '/catalog' },
    { name: 'Бренды', href: '/brands' },
    { name: 'Акции', href: '/sales' },
    { name: 'Доставка', href: '/delivery' },
    { name: 'Блог', href: '/blog' },
  ];

  const SearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isSearching ? (
        <div className="p-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Поиск...</p>
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="py-2">
          {searchResults.slice(0, 6).map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleProductClick(product);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleProductClick(product);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
              <div className="text-sm font-medium text-primary">
                {product.discountPrice ? (
                  <>
                    <span className="text-destructive">{product.discountPrice.toLocaleString('ru-RU')} ₽</span>
                  </>
                ) : (
                  <span>{product.price.toLocaleString('ru-RU')} ₽</span>
                )}
              </div>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSearchSubmit(e as any);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleSearchSubmit(e as any);
            }}
            className="w-full px-4 py-2 text-sm text-primary hover:bg-muted transition-colors text-center font-medium"
          >
            Показать все результаты ({searchResults.length})
          </button>
        </div>
      ) : debouncedQuery.length >= 2 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          Товары не найдены
        </div>
      ) : null}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar */}
      <div className="bg-gradient-hero py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-primary-foreground font-roboto">
            ✨ Бесплатная доставка при заказе от 3000₽
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-roboto hover:text-primary transition-colors"
                    onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 text-center">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary leading-none">
              HonnyLove
            </h1>
            <span className="text-[10px] md:text-xs font-roboto text-muted-foreground tracking-[0.2em] uppercase">
              ХонниЛав
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="pl-10 font-roboto"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(e.target.value.length >= 2);
                }}
                onFocus={() => setIsSearchOpen(searchQuery.length >= 2)}
              />
              {isSearchOpen && <SearchDropdown />}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
              <Link to={isAuthenticated ? "/favorites" : "/auth"}>
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.first_name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Избранное
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await api.logout();
                      } catch {}
                      logout();
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to={isAuthenticated ? "/cart" : "/auth"}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-roboto font-medium">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="md:hidden mt-4" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск товаров..."
              className="pl-10 font-roboto"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.length >= 2);
              }}
              onFocus={() => setIsSearchOpen(searchQuery.length >= 2)}
            />
            {isSearchOpen && <SearchDropdown />}
          </form>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:block border-t border-border">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className="text-sm font-roboto font-medium hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};
