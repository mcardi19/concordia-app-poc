/**
 * Academics flow content.
 *
 * Course, GPA and resource content is still design mock data. The dates are
 * not: they come from `@/services/academic`, the same registrar dataset the
 * Schedule's all-day section reads, so the two screens can never disagree
 * about what today is or what falls on it.
 */
import {
  ACADEMIC_DATES,
  academicDayKey,
  type AcademicDateCategory,
  type AcademicDateEntry,
} from '@/services/academic';

/**
 * The calendar's vocabulary is the dataset's — one set of names, not a
 * presentation copy that has to be kept in step with it.
 */
export type AcademicKind = AcademicDateCategory;

export type AcademicEvent = {
  /** `AcademicDateEntry.id`, so a row can open the detail screen. */
  id: string;
  /** ISO start, and inclusive end for anything with a duration. */
  date: string;
  endDate?: string;
  /** Day of month, unpadded, for the oversized date on a card. */
  day: string;
  /** Short weekday: Mon, Tue. */
  dow: string;
  /** Short month, uppercase: MAY, JUN. */
  monthShort: string;
  kind: AcademicKind;
  title: string;
  detail: string;
  /** Higher sorts first among same-day entries. See the dataset. */
  priority: number;
};

export type AcademicMonth = {
  /** "September 2026" — the heading. */
  month: string;
  /** "2026-09" — compared, so two Septembers never collide. */
  key: string;
  events: AcademicEvent[];
};

export type Course = {
  code: string;
  title: string;
  prof: string;
  grade: string;
  /** Null while the course has no posted average yet. */
  pct: number | null;
  color: string;
};

export type TermStat = { value: string; label: string };

export type AcademicResource = {
  id: string;
  label: string;
  subtitle: string;
  icon: 'moodle' | 'book' | 'chart' | 'exam';
};

/** Title only — the term and week beneath it are read off the dataset. */
export const ACADEMIC_TERM = {
  title: 'Academics',
};

export const TERM_STATS: TermStat[] = [
  { value: '3.62', label: 'Term GPA' },
  { value: '12', label: 'Credits' },
  { value: '4', label: 'Courses' },
  { value: 'A−', label: 'Avg grade' },
];

/** Course accent colours are literal design values, not semantic roles. */
export const COURSES: Course[] = [
  { code: 'ENGL 369', title: 'African-American Literature', prof: 'I. Ashwell', grade: 'A−', pct: 87, color: '#912238' },
  { code: 'PHIL 232', title: 'Introduction to Ethics', prof: 'O. Fenn', grade: 'B+', pct: 82, color: '#7a7a7c' },
  { code: 'HIST 210', title: 'Quebec since Confederation', prof: 'A. Moreau', grade: 'A', pct: 91, color: '#5a7a6a' },
  { code: 'FRAN 219', title: 'Initiation au français écrit', prof: 'J. Tremblay', grade: '—', pct: null, color: '#8a6a5a' },
];

export const ACADEMIC_RESOURCES: AcademicResource[] = [
  { id: 'moodle', label: 'My Moodle', subtitle: 'Courseware & submissions', icon: 'moodle' },
  { id: 'booklist', label: 'Booklist', subtitle: '7 required · 3 owned', icon: 'book' },
  { id: 'grades', label: 'Grade history', subtitle: 'Term & cumulative', icon: 'chart' },
  { id: 'exams', label: 'Exam schedule', subtitle: 'Rooms & seat assignments', icon: 'exam' },
];

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toEvent(entry: AcademicDateEntry): AcademicEvent {
  const date = parseDay(entry.date);
  return {
    id: entry.id,
    date: entry.date,
    endDate: entry.endDate,
    day: String(date.getDate()),
    dow: date.toLocaleDateString('en-CA', { weekday: 'short' }),
    monthShort: date.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase(),
    kind: entry.category,
    title: entry.title,
    detail: entry.detail ?? '',
    priority: entry.priority,
  };
}

/** Every registrar date, flattened for the calendar. */
export const ACADEMIC_EVENTS: AcademicEvent[] = ACADEMIC_DATES.map(toEvent);

/** Month key an event belongs to: `2026-09`. */
export function monthKeyOf(event: AcademicEvent): string {
  return event.date.slice(0, 7);
}

/**
 * Past means finished, not merely started — a reading week you are standing
 * in is not history. Spans stay current until their last day.
 */
export function isPastEvent(event: AcademicEvent, now: Date): boolean {
  return (event.endDate ?? event.date) < academicDayKey(now);
}

export function isEventToday(event: AcademicEvent, now: Date): boolean {
  const today = academicDayKey(now);
  return event.endDate
    ? today >= event.date && today <= event.endDate
    : event.date === today;
}

/** First entry starting strictly after today. */
export function nextEvent(now: Date): AcademicEvent | null {
  const today = academicDayKey(now);
  return ACADEMIC_EVENTS.find((event) => event.date > today) ?? null;
}

/**
 * The whole calendar, grouped by month in chronological order.
 *
 * Months are built from the data rather than declared, so adding a term to
 * the dataset adds it here with no second edit — and a month whose entries
 * are all in the past simply falls out once past entries are hidden.
 */
export function academicMonths(): AcademicMonth[] {
  const groups = new Map<string, AcademicEvent[]>();
  for (const event of ACADEMIC_EVENTS) {
    const key = monthKeyOf(event);
    const bucket = groups.get(key);
    if (bucket) bucket.push(event);
    else groups.set(key, [event]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, events]) => ({
      key,
      month: parseDay(`${key}-01`).toLocaleDateString('en-CA', {
        month: 'long',
        year: 'numeric',
      }),
      events,
    }));
}

/**
 * The next few dates for the Academics home carousel. The soonest is drawn
 * as the filled brand card, so anything in force today leads — a closure you
 * are inside matters more than the deadline after it.
 */
export function upcomingDates(now: Date, limit = 4): (AcademicEvent & { soon: boolean })[] {
  const today = academicDayKey(now);
  return ACADEMIC_EVENTS.filter((event) => (event.endDate ?? event.date) >= today)
    .slice(0, limit)
    .map((event, index) => ({ ...event, soon: index === 0 }));
}

/** Eyebrow label and accent per kind. Literal design values, not roles. */
export const KIND_META: Record<AcademicKind, { label: string; color: string }> = {
  registration: { label: 'Registration', color: '#3d5a80' },
  term: { label: 'Term', color: '#5a7a6a' },
  exam: { label: 'Examinations', color: '#912238' },
  deadline: { label: 'Deadline', color: '#b06a2a' },
  closure: { label: 'Closure', color: '#6A3FB0' },
  financial: { label: 'Fees', color: '#a03a4a' },
  graduation: { label: 'Graduation', color: '#8a6a3a' },
};

/** Filter chips across the top of the calendar. `null` matches every kind. */
export const CALENDAR_FILTERS: { id: string; label: string; kinds: AcademicKind[] | null }[] = [
  { id: 'all', label: 'All', kinds: null },
  { id: 'deadlines', label: 'Deadlines', kinds: ['deadline', 'registration'] },
  { id: 'exams', label: 'Exams', kinds: ['exam'] },
  { id: 'closures', label: 'Closures', kinds: ['closure'] },
  { id: 'fees', label: 'Fees', kinds: ['financial'] },
  { id: 'term', label: 'Term', kinds: ['term'] },
];
