/**
 * Auth service: login (OIDC), logout, refresh. Stub implementation.
 * Replace with real OIDC flow (expo-auth-session or react-native-app-auth).
 */

import { secureStorage } from '@/services/secureStorage';
import { useAuthStore } from '@/state/authStore';
import { logger } from '@/services/logger';

export const authService = {
  async login(): Promise<void> {
    // TODO: Hub SSO WebView → tp-set-custom-vars equivalent → store real SIS token.
    logger.info('Auth: login stub');
    await secureStorage.setSisToken('stub-sis-token');
    useAuthStore.getState().setUser({
      id: '401872231',
      email: 'maya.okonkwo@concordia.ca',
      name: 'Maya R. Okonkwo',
    });
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
