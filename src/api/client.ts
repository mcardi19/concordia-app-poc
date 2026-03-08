/**
 * Single API client factory. Base URL from env; interceptors for auth and token refresh.
 * All endpoints should go through this client.
 */

import axios, { type AxiosInstance } from 'axios';
import { secureStorage } from '@/services/secureStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com';

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // TODO: attempt refresh token, then retry; on failure clear storage and redirect to login.
      }
      return Promise.reject(error);
    }
  );

  return client;
}

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = createApiClient();
  }
  return apiClient;
}
