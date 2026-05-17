import { useQuery } from '@tanstack/react-query';
import { fetchGrades } from '@/api/grades';
import { queryKeys } from '@/api/queryKeys';
import type { GradesEndpointType } from '@/types/sis';

export function useGrades(type: GradesEndpointType) {
  return useQuery({
    queryKey: queryKeys.grades(type),
    queryFn: () => fetchGrades(type),
  });
}
