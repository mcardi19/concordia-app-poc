import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCampusServices, filterServices } from '@/api/campus';
import { queryKeys } from '@/api/queryKeys';
import type { CampusCode } from '@/types/campus';

export function useServicesSearch(campus: CampusCode, query: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.services(campus, ''),
    queryFn: () => fetchCampusServices(campus),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const results = useMemo(
    () => filterServices(data ?? [], query),
    [data, query]
  );

  return { results, isLoading, isError, refetch, totalCount: data?.length ?? 0 };
}
