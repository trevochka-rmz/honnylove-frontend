import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/config/api";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(errorParam);
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // Backend has set HttpOnly cookies, just fetch user profile
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          credentials: 'include',
        });

        if (response.ok) {
          const user = await response.json();
          setAuth(user);
          navigate('/profile');
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err) {
        setError('Ошибка авторизации. Попробуйте снова.');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    if (!isAuthenticated) {
      handleCallback();
    } else {
      navigate('/profile');
    }
  }, [searchParams, setAuth, navigate, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Авторизация...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
