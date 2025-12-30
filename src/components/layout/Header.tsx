import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartApiStore } from '@/store/cartApiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { getTotalItems, fetchCart } = useCartApiStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cart and wishlist on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const totalItems = getTotalItems();
  const wishlistCount = wishlistItems.length;

  const navigation = [
    { name: 'Категории', href: '/catalog' },
    { name: 'Бренды', href: '/brands' },
    { name: 'Акции', href: '/sales' },
    { name: 'Доставка', href: '/delivery' },
    { name: 'Блог', href: '/blog' },
  ];

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
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">
              HonnyLove
            </h1>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="pl-10 font-roboto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    <p className="text-sm font-medium">{user?.username}</p>
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
                    onClick={logout}
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
        <div className="md:hidden mt-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск товаров..."
              className="pl-10 font-roboto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
