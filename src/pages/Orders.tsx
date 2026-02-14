import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/profile/OrderCard";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Package, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-playfair font-bold flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              Мои заказы
              {orders && <span className="text-base font-normal text-muted-foreground">({orders.length})</span>}
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Заказов пока нет</h2>
              <p className="text-muted-foreground mb-6">Перейдите в каталог, чтобы сделать первый заказ</p>
              <Button asChild>
                <Link to="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
