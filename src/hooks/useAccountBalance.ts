import { useQuery } from '@tanstack/react-query';
import { fetchAccountBalance } from '@/api/balance';
import { queryKeys } from '@/api/queryKeys';

export function useAccountBalance() {
  return useQuery({
    queryKey: queryKeys.balance,
    queryFn: () => fetchAccountBalance(),
  });
}
