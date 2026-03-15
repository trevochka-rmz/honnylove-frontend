import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAllOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/profile/OrderCard";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Package, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAllOrders(page, 10);

  const orders = data?.orders;
  const pagination = data?.pagination;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('ellipsis');
    if (total > 1) pages.push(total);

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {current > 1 && (
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(current - 1); }} />
            </PaginationItem>
          )}
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === current}
                  onClick={(e) => { e.preventDefault(); setPage(p); }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          {current < total && (
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(current + 1); }} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

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
              {pagination && <span className="text-base font-normal text-muted-foreground">({pagination.total})</span>}
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
            <>
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
