import { useQuery } from '@tanstack/react-query';
import { fetchCourseDetail, parseCourseCode } from '@/api/courses';
import { queryKeys } from '@/api/queryKeys';
import { isConcordiaOpenDataConfigured } from '@/config/concordiaOpenData';

/**
 * Catalog detail for a timetable course code ("PHIL 232").
 *
 * Disabled for codes that are not courses — the timetable's "Study" and
 * "Tutor" blocks have no catalog entry — and when Open Data credentials are
 * absent, so a misconfigured build shows the offline copy rather than
 * throwing on every session opened.
 *
 * Cached for a day: the catalog is a daily SIS export, so anything shorter is
 * just repeat traffic for the same answer.
 */
export function useCourseDetail(courseCode: string | undefined) {
  const canQuery =
    courseCode != null &&
    parseCourseCode(courseCode) != null &&
    isConcordiaOpenDataConfigured();

  return useQuery({
    queryKey: queryKeys.courseDetail(courseCode ?? ''),
    queryFn: () => fetchCourseDetail(courseCode as string),
    enabled: canQuery,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
