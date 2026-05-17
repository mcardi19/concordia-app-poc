/**
 * SIS API client – token in path (legacy mobile-app-main pattern).
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { secureStorage } from '@/services/secureStorage';

export async function getSisToken(): Promise<string> {
  const token = await secureStorage.getSisToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}

export async function sisGet<T>(path: string): Promise<T> {
  const token = await getSisToken();
  const url = `${API_CONFIG.sisBaseUrl}/${path}/${token}`;
  const { data } = await axios.get<T>(url, { timeout: 15000 });
  return data;
}

export async function sisGetWithParam<T>(path: string, param: string, fresh = false): Promise<T> {
  const token = await getSisToken();
  const suffix = fresh ? '/fresh' : '';
  const url = `${API_CONFIG.sisBaseUrl}/${path}/${token}/${param}${suffix}`;
  const { data } = await axios.get<T>(url, { timeout: 15000 });
  return data;
}
