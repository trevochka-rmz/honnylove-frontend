import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/config/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isAuthenticated) {
    navigate("/profile");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Заполните все обязательные поля");
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.username) {
        toast.error("Введите имя пользователя");
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Длина пароля не менее 6 символов");
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Пароли не совпадают");
        setIsLoading(false);
        return;
      }
      if (!formData.agreeToTerms) {
        toast.error("Необходимо согласиться с условиями");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const response = await api.login(formData.email, formData.password);
        setAuth(response.user);
        toast.success("Добро пожаловать!");
        navigate("/profile");
      } else {
        const response = await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setAuth(response.user);
        toast.success("Регистрация успешна!");
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="font-playfair text-3xl font-bold text-primary">
                HonnyLove
              </h1>
            </Link>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
            </p>
          </div>

          <div className="flex mb-8 bg-secondary rounded-xl p-1">
            <button
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                !isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">Длина пароля не менее 6 символов</p>
              )}
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                    Я даю согласие на обработку персональных данных в соответствии с{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      политикой о конфиденциальности
                    </Link>
                  </Label>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">Запомнить меня</Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Забыли пароль?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
            </Button>
          </form>

          {/* Google OAuth */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">
                  или войдите через
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleGoogleAuth}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Войти через Google
              </Button>
            </div>
          </div>

          <div className="mt-10 p-6 bg-secondary/50 rounded-2xl">
            <h3 className="font-semibold mb-4 text-center">Преимущества аккаунта</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Отслеживание заказов в реальном времени
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Персональные скидки и акции
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Сохранение избранных товаров
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Быстрое оформление заказов
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
