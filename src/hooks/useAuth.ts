import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { isAuthenticated } = useAuthStore();

  return {
    isAuthenticated,
  };
};
