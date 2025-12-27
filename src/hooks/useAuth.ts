import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

export const useAuth = () => {
  const { accessToken, refreshToken, setAuth, logout } = useAuthStore();

  const getValidToken = async (): Promise<string | null> => {
    if (!accessToken || !refreshToken) return null;

    try {
      // Try to use current token first, if it fails, refresh it
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
