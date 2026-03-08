import { useAuthStore } from '@/state/authStore';
import { authService } from '@/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setLoading } = useAuthStore();

  const login = async () => {
    setLoading(true);
    try {
      await authService.login();
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  return { user, isAuthenticated, isLoading, login, logout: doLogout };
}
