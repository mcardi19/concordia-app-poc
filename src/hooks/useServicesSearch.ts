import { useMemo } from 'react';
import { filterServices } from '@/api/campus';
import { getCampusServices } from '@/data/buildings';
import type { CampusCode } from '@/types/campus';

export function useServicesSearch(campus: CampusCode, query: string) {
  const all = useMemo(() => getCampusServices(campus), [campus]);
  const results = useMemo(() => filterServices(all, query), [all, query]);

  return {
    results,
    isLoading: false,
    isError: false,
    refetch: () => {},
    totalCount: all.length,
  };
}
