import { getApiClient } from '@/api/client';

export function useApi() {
  return getApiClient();
}
