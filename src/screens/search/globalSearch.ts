import type { MsIconDefinition } from 'material-symbols-react-native';
import { msLocationOn, msMenuBook, msSchool, msSupportAgent } from '@/components/icons';
import type { BuildingSummary, ServiceSearchResult } from '@/types/campus';
import { matchServiceRecord } from '@/data/campusServiceRecords';
import type { ScheduleEvent } from '@/components/feature/schedule/scheduleTypes';
import type { CuratedBook, LibraryLoan } from '@/components/feature/library/libraryData';

export type SearchCategory = 'course' | 'building' | 'library' | 'service';

export type SearchHit = {
  /** Set on service hits that resolve to a seeded record. */
  recordId?: string;
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  /** Short trailing marker — room, campus code, availability. */
  meta?: string;
};

export const CATEGORY_LABEL: Record<SearchCategory, string> = {
  course: 'Courses',
  building: 'Buildings',
  library: 'Library',
  service: 'Services',
};

/** Display order of the result groups. Courses first — the likeliest target. */
/** Row icon per category, so a result reads as its kind at a glance. */
export function categoryIcon(category: SearchCategory): MsIconDefinition {
  return {
    course: msSchool,
    building: msLocationOn,
    library: msMenuBook,
    service: msSupportAgent,
  }[category];
}

export const CATEGORY_ORDER: SearchCategory[] = ['course', 'building', 'library', 'service'];

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return fields.some((f) => f != null && f.toLowerCase().includes(q));
}

/**
 * One entry per course rather than per meeting: the week's events repeat the
 * same course across days, and four identical rows for PHIL 232 is noise.
 */
export function searchCourses(events: ScheduleEvent[], query: string): SearchHit[] {
  const seen = new Set<string>();
  const hits: SearchHit[] = [];

  for (const event of events) {
    if (event.kind === 'study') continue;
    if (seen.has(event.courseCode)) continue;
    if (!matches(query, event.courseCode, event.title, event.professor)) continue;

    seen.add(event.courseCode);
    hits.push({
      id: `course-${event.courseCode}`,
      category: 'course',
      title: event.courseCode,
      subtitle: event.title,
      meta: event.room,
    });
  }

  return hits;
}

export function searchBuildings(buildings: BuildingSummary[], query: string): SearchHit[] {
  return buildings
    .filter((b) => matches(query, b.code, b.name, b.longName, b.address))
    .map((b) => ({
      id: `building-${b.id}`,
      category: 'building' as const,
      title: `${b.code} · ${b.name}`,
      subtitle: b.address ?? b.longName ?? '',
      meta: b.campusId.toUpperCase(),
    }));
}

export function searchLibrary(
  loans: LibraryLoan[],
  curated: CuratedBook[],
  query: string,
): SearchHit[] {
  const fromLoans = loans
    .filter((l) => matches(query, l.title, l.author))
    .map((l) => ({
      id: `loan-${l.id}`,
      category: 'library' as const,
      title: l.title,
      subtitle: l.author,
      meta: l.dueLabel,
    }));

  const fromCurated = curated
    .filter((b) => matches(query, b.title, b.author))
    .map((b) => ({
      id: `book-${b.id}`,
      category: 'library' as const,
      title: b.title,
      subtitle: b.author,
      meta: b.available ? 'Available' : 'On loan',
    }));

  return [...fromLoans, ...fromCurated];
}

export function searchServices(services: ServiceSearchResult[], query: string): SearchHit[] {
  return services
    .filter((s) => matches(query, s.label, s.buildingName))
    .map((s) => ({
      id: `service-${s.id}`,
      category: 'service' as const,
      title: s.label,
      subtitle: s.buildingName,
      meta: s.kind === 'department' ? 'Dept.' : undefined,
      // Present only where a seeded record exists; the row is a dead end
      // without one, so the screen uses this to decide whether it opens.
      recordId: matchServiceRecord(s.label)?.id,
    }));
}

export function groupHits(hits: SearchHit[]): { category: SearchCategory; hits: SearchHit[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    hits: hits.filter((h) => h.category === category),
  })).filter((group) => group.hits.length > 0);
}
