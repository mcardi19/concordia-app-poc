/**
 * Secure storage wrapper around expo-secure-store.
 * Use only for tokens and session-related data; never for general app data.
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const secureStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(value: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, value);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(value: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, value);
  },
  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },
};
