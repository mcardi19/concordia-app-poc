import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedEvents } from '@/api/campus';
import { queryKeys } from '@/api/queryKeys';

export function useFeaturedEvents() {
  return useQuery({
    queryKey: queryKeys.featuredEvents,
    queryFn: fetchFeaturedEvents,
    staleTime: 30 * 60 * 1000,
  });
}
