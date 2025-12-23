import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Heart, 
  ShoppingBag, 
  Settings,
  Package
} from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-hero rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-playfair font-bold text-primary-foreground">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}
                </h1>
                <p className="text-primary-foreground/80">{user.email}</p>
                <p className="text-sm text-primary-foreground/60 mt-1">
                  Участник с {new Date(user.created_at).toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link 
              to="/favorites"
              className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-border"
            >
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{favoritesCount}</p>
              <p className="text-sm text-muted-foreground">Избранное</p>
            </Link>
            <Link 
              to="/cart"
              className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-border"
            >
              <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalCartItems}</p>
              <p className="text-sm text-muted-foreground">В корзине</p>
            </Link>
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Заказов</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <Settings className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">Скидка</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
            <h2 className="text-xl font-semibold mb-6">Личные данные</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Имя пользователя</p>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Телефон</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Адрес</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-xl font-semibold mb-6">Быстрые действия</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start gap-3 h-14" asChild>
                <Link to="/catalog">
                  <ShoppingBag className="w-5 h-5" />
                  Перейти в каталог
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-14" asChild>
                <Link to="/favorites">
                  <Heart className="w-5 h-5" />
                  Мои избранные
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-14" asChild>
                <Link to="/cart">
                  <Package className="w-5 h-5" />
                  Моя корзина
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                className="justify-start gap-3 h-14"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
