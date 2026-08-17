import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchShuttleLive } from '@/services/shuttle/shuttleLive';

/** Matches Concordia's own map timer. */
const LIVE_REFRESH_MS = 10_000;

export function useShuttleLive(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.shuttleLive,
    queryFn: fetchShuttleLive,
    enabled,
    refetchInterval: enabled ? LIVE_REFRESH_MS : false,
    staleTime: LIVE_REFRESH_MS / 2,
  });
}
