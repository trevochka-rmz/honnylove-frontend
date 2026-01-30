import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

// Helper to decode JWT and check expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 30 second buffer before expiration
    return payload.exp * 1000 < Date.now() + 30000;
  } catch {
    return true;
  }
};

export const useAuth = () => {
  const { accessToken, refreshToken, setAuth, logout } = useAuthStore();

  const getValidToken = async (): Promise<string | null> => {
    if (!accessToken || !refreshToken) return null;

    // If token is still valid, return it without refreshing
    if (!isTokenExpired(accessToken)) {
      return accessToken;
    }

    // Token is expired or about to expire, try to refresh
    try {
      const { accessToken: newToken } = await api.refreshToken(refreshToken);
      // Update the store with new access token
      const user = useAuthStore.getState().user;
      if (user) {
        setAuth(user, newToken, refreshToken);
      }
      return newToken;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      return null;
    }
  };

  return {
    accessToken,
    refreshToken,
    getValidToken,
    isAuthenticated: !!accessToken,
  };
};
