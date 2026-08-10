import { useQuery } from '@tanstack/react-query';
import { fetchBuildings } from '@/api/buildings';
import { queryKeys } from '@/api/queryKeys';
import { BUILDING_FALLBACK } from '@/services/campus/buildingFallback';

export function useBuildings() {
  return useQuery({
    queryKey: queryKeys.buildings,
    queryFn: fetchBuildings,
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: BUILDING_FALLBACK,
  });
}
