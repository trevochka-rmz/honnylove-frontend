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
      // Check if there's an error in the URL
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(errorParam);
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // Check if tokens are in URL params (backend may send them this way)
      const accessToken = searchParams.get('accessToken') || searchParams.get('access_token');
      const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Tokens in URL - fetch user data and store
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const user = await response.json();
            setAuth(user, accessToken, refreshToken);
            navigate('/profile');
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (err) {
          setError('Ошибка авторизации. Попробуйте снова.');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else {
        // No tokens in URL - try to fetch user info using cookies
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user && data.accessToken && data.refreshToken) {
              setAuth(data.user, data.accessToken, data.refreshToken);
              navigate('/profile');
            } else if (data.user) {
              // Cookies-only mode - store user data with placeholder tokens
              setAuth(data.user, 'cookie-auth', 'cookie-auth');
              navigate('/profile');
            } else {
              throw new Error('No user data received');
            }
          } else {
            // If /api/auth/me fails, try to get profile directly (cookies might already be set)
            const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
              credentials: 'include',
            });
            
            if (profileResponse.ok) {
              const user = await profileResponse.json();
              setAuth(user, 'cookie-auth', 'cookie-auth');
              navigate('/profile');
            } else {
              throw new Error('Failed to authenticate');
            }
          }
        } catch (err) {
          setError('Ошибка авторизации. Попробуйте снова.');
          setTimeout(() => navigate('/auth'), 3000);
        }
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
