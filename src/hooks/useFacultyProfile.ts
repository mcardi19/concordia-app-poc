import { useQuery } from '@tanstack/react-query';
import { fetchFacultyProfile, type FacultyProfileId } from '@/api/facultyProfile';
import { queryKeys } from '@/api/queryKeys';

/**
 * A faculty profile by slug. Profiles change on the order of a term, so this
 * caches hard — the photo and appointment are not live data.
 */
export function useFacultyProfile(fpid: FacultyProfileId | undefined) {
  return useQuery({
    queryKey: queryKeys.facultyProfile(fpid ?? ''),
    queryFn: () => fetchFacultyProfile(fpid as FacultyProfileId),
    enabled: Boolean(fpid),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
