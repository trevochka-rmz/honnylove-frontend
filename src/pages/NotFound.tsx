import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md space-y-6">
          <div className="text-8xl font-playfair font-bold text-primary/20">404</div>
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-foreground">
            Страница не найдена
          </h1>
          <p className="text-muted-foreground">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <Button onClick={() => navigate("/")}>
              <Home className="w-4 h-4" />
              На главную
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
