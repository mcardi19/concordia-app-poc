import { useQuery } from '@tanstack/react-query';
import { fetchSchedule } from '@/api/schedule';
import { queryKeys } from '@/api/queryKeys';

export function useSchedule(weekMondayYmd: string) {
  return useQuery({
    queryKey: queryKeys.schedule(weekMondayYmd),
    queryFn: () => fetchSchedule(weekMondayYmd),
    enabled: !!weekMondayYmd,
  });
}
