/**
 * Secure storage wrapper around expo-secure-store.
 * Use only for tokens and session-related data; never for general app data.
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  /** Hub / SIS token (path segment on prod-dataserv APIs). */
  SIS_TOKEN: 'sis_token',
} as const;

export const secureStorage = {
  async getSisToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.SIS_TOKEN);
  },
  async setSisToken(value: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.SIS_TOKEN, value);
  },
  async getAccessToken(): Promise<string | null> {
    const access = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    if (access) return access;
    return SecureStore.getItemAsync(KEYS.SIS_TOKEN);
  },
  async setAccessToken(value: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, value);
    await SecureStore.setItemAsync(KEYS.SIS_TOKEN, value);
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
    await SecureStore.deleteItemAsync(KEYS.SIS_TOKEN);
  },
};
