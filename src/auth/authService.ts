/**
 * Auth service: login (OIDC), logout, refresh. Stub implementation.
 * Replace with real OIDC flow (expo-auth-session or react-native-app-auth).
 */

import { secureStorage } from '@/services/secureStorage';
import { useAuthStore } from '@/state/authStore';
import { logger } from '@/services/logger';

export const authService = {
  async login(): Promise<void> {
    // TODO: Open OIDC discovery, auth request with PKCE, store tokens.
    logger.info('Auth: login stub');
    useAuthStore.getState().setUser({ id: 'stub-user', email: 'user@example.com', name: 'Test User' });
  },

  async logout(): Promise<void> {
    await secureStorage.clearTokens();
    useAuthStore.getState().logout();
    logger.info('Auth: logout');
  },

  async refreshToken(): Promise<boolean> {
    const refresh = await secureStorage.getRefreshToken();
    if (!refresh) return false;
    // TODO: call token endpoint, store new access token.
    return true;
  },
};
