import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCartApiStore } from "@/store/cartApiStore";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Heart, 
  ShoppingBag, 
  Package,
  Edit,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { AddressDialog } from "@/components/profile/AddressDialog";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { OrdersSection } from "@/components/profile/OrdersSection";
import { EmailVerificationBanner } from "@/components/profile/EmailVerificationBanner";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const clearCartStore = useCartApiStore((state) => state.clearCart);
  const resetCartState = useCartApiStore.setState;
  const { data: profile, isLoading, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addressPromptShown, setAddressPromptShown] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Show address dialog if user doesn't have address
  useEffect(() => {
    if (profile && !profile.address && !addressPromptShown) {
      setShowAddressDialog(true);
      setAddressPromptShown(true);
    }
  }, [profile, addressPromptShown]);

  const handleLogout = async () => {
    // Call server logout to clear HttpOnly cookies
    try {
      const { api } = await import('@/services/api');
      await api.logout();
    } catch {}
    // Clear cart state before logout
    resetCartState({ items: [], summary: null });
    logout();
    navigate("/auth");
  };

  const handleAddressSave = async (addressData: { city: string; street: string; fullAddress: string }) => {
    try {
      await updateProfile.mutateAsync({ address: addressData.fullAddress });
      toast.success('Адрес успешно сохранён');
      setShowAddressDialog(false);
      refetch();
    } catch (error) {
      toast.error('Ошибка при сохранении адреса');
    }
  };

  const handleProfileSave = async (data: { first_name?: string; last_name?: string; phone?: string }) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Профиль успешно обновлён');
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handleEmailVerified = () => {
    refetch();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-hero rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-playfair font-bold text-primary-foreground">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : profile?.username}
                </h1>
                <p className="text-primary-foreground/80">{profile?.email}</p>
                <p className="text-sm text-primary-foreground/60 mt-1">
                  Участник с {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : ''}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="hidden md:flex"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </div>

          {/* Email Verification Banner */}
          {profile && profile.is_verified === false && (
            <EmailVerificationBanner 
              email={profile.email} 
              onVerified={handleEmailVerified}
            />
          )}

          {/* Address Banner - shown prominently if address exists */}
          {profile?.address && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Адрес доставки</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAddressDialog(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Quick Stats - Fixed to 3 columns */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Link 
              to="/favorites"
              className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-border"
            >
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.wishlistCount || 0}</p>
              <p className="text-sm text-muted-foreground">Избранное</p>
            </Link>
            <Link 
              to="/cart"
              className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-border"
            >
              <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.cartCount || 0}</p>
              <p className="text-sm text-muted-foreground">В корзине</p>
            </Link>
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.orderCount || 0}</p>
              <p className="text-sm text-muted-foreground">Заказов</p>
            </div>
          </div>

          {/* Orders Section */}
          <div className="mb-8">
            <OrdersSection />
          </div>

          {/* Profile Info */}
          <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Личные данные</h2>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Имя пользователя</p>
                  <p className="font-medium">{profile?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-medium">{profile?.phone || 'Не указан'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p className="font-medium">{profile?.address || 'Не указан'}</p>
                </div>
                {!profile?.address && (
                  <Button variant="link" size="sm" className="text-primary" onClick={() => setShowAddressDialog(true)}>
                    Добавить
                  </Button>
                )}
              </div>
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

      {/* Address Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onSave={handleAddressSave}
        isLoading={updateProfile.isPending}
        defaultCity={profile?.address?.split(',')[0] || ''}
        defaultStreet={profile?.address?.split(',').slice(1).join(',').trim() || ''}
      />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleProfileSave}
        isLoading={updateProfile.isPending}
        defaultFirstName={profile?.first_name || ''}
        defaultLastName={profile?.last_name || ''}
        defaultPhone={profile?.phone || ''}
      />
    </div>
  );
};

export default Profile;
