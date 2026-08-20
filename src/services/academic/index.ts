import {
  ACADEMIC_CATEGORY_PRIORITY,
  type AcademicDateEntry,
  type AcademicTerm,
} from './academicDateTypes';
import { RAW_ACADEMIC_DATES, type RawAcademicDate } from './academicDatesData';

export {
  ACADEMIC_CATEGORY_LABEL,
  ACADEMIC_CATEGORY_PRIORITY,
  type AcademicDateCategory,
  type AcademicDateEntry,
  type AcademicTerm,
} from './academicDateTypes';

/** `YYYY-MM-DD` for a local date — never `toISOString`, which shifts to UTC. */
export function academicDayKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Term windows. Derived from the date rather than stored, because the page's
 * own grouping is by calendar month and disagrees with itself — the winter
 * exam period runs to May 2 but is printed under "Summer Term 2027". A span
 * takes the term its first day falls in.
 */
const TERM_WINDOWS: { term: AcademicTerm; from: string; to: string }[] = [
  { term: 'summer-2026', from: '2026-05-01', to: '2026-08-31' },
  { term: 'fall-2026', from: '2026-09-01', to: '2026-12-31' },
  { term: 'winter-2027', from: '2027-01-01', to: '2027-04-30' },
  { term: 'summer-2027', from: '2027-05-01', to: '2027-08-31' },
];

export function academicTermFor(date: string): AcademicTerm {
  const window = TERM_WINDOWS.find((w) => date >= w.from && date <= w.to);
  // Only the Dec 24 closure runs past its window's end, and it starts in fall.
  return window?.term ?? 'fall-2026';
}

/** `2026-09-21` + "Last day to add courses" → `2026-09-21-last-day-to-add-courses`. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function build(raw: RawAcademicDate[]): AcademicDateEntry[] {
  const used = new Set<string>();
  return raw
    .map((row) => {
      const base = `${row.date}-${slugify(row.title)}`;
      /*
        Two rows can share a date and a title — the same deadline stated once
        per session. Suffix rather than collapse: they are separate facts with
        separate details.
      */
      let id = base;
      for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
      used.add(id);

      return {
        id,
        date: row.date,
        endDate: row.end,
        category: row.category,
        title: row.title,
        detail: row.detail,
        priority: row.priority ?? ACADEMIC_CATEGORY_PRIORITY[row.category],
        actionable: row.actionable ?? false,
        term: academicTermFor(row.date),
      };
    })
    .sort((a, b) => (a.date === b.date ? b.priority - a.priority : a.date < b.date ? -1 : 1));
}

/** The whole dataset, chronological, highest-priority first within a day. */
export const ACADEMIC_DATES: AcademicDateEntry[] = build(RAW_ACADEMIC_DATES);

function coversDay(entry: AcademicDateEntry, dayKey: string): boolean {
  return entry.endDate
    ? dayKey >= entry.date && dayKey <= entry.endDate
    : dayKey === entry.date;
}

/**
 * Every entry in force on a given day, the one that should lead first.
 *
 * "In force" rather than "starting": a Tuesday in the middle of reading week
 * is still reading week, and that is what the day's card should say.
 */
export function academicDatesOn(date: Date): AcademicDateEntry[] {
  const dayKey = academicDayKey(date);
  return ACADEMIC_DATES.filter((entry) => coversDay(entry, dayKey)).sort(
    /*
      Re-sort: the dataset's own order is chronological by start date, which
      is the wrong order for one day's stack. A span that began on the 10th
      would otherwise lead over a closure on the 12th that falls inside it —
      and on that day the closure is the thing you need to know.
    */
    (a, b) => (a.priority === b.priority ? (a.date < b.date ? -1 : 1) : b.priority - a.priority),
  );
}

/** Next `limit` entries starting on or after `date`, for upcoming lists. */
export function upcomingAcademicDates(date: Date, limit = 5): AcademicDateEntry[] {
  const dayKey = academicDayKey(date);
  return ACADEMIC_DATES.filter((entry) => entry.date >= dayKey).slice(0, limit);
}

export function academicDateById(id: string): AcademicDateEntry | undefined {
  return ACADEMIC_DATES.find((entry) => entry.id === id);
}

/**
 * Entries near `entry` in time, excluding itself — the "Related dates" list.
 * Nearest by start date in either direction, which keeps a deadline's
 * neighbours (the thing before it, the consequence after it) together.
 */
export function relatedAcademicDates(entry: AcademicDateEntry, limit = 3): AcademicDateEntry[] {
  const target = Date.parse(entry.date);
  return ACADEMIC_DATES.filter((other) => other.id !== entry.id)
    .map((other) => ({ other, gap: Math.abs(Date.parse(other.date) - target) }))
    .sort((a, b) => (a.gap === b.gap ? b.other.priority - a.other.priority : a.gap - b.gap))
    .slice(0, limit)
    .map((row) => row.other);
}


/** Display name per term. */
export const ACADEMIC_TERM_LABEL: Record<AcademicTerm, string> = {
  'summer-2026': 'Summer 2026',
  'fall-2026': 'Fall 2026',
  'winter-2027': 'Winter 2027',
  'summer-2027': 'Summer 2027',
};

export type AcademicTermStatus = {
  term: AcademicTerm;
  /** "Fall 2026". */
  label: string;
  /** Null outside the teaching weeks — reading break included, breaks count. */
  week: { current: number; total: number } | null;
  /** "Classes in session", "Reading week", "Labour Day". */
  phase: string;
};

const MS_PER_WEEK = 604_800_000;

function covers(entry: AcademicDateEntry, dayKey: string): boolean {
  return coversDay(entry, dayKey);
}

/**
 * Where the student is in the term right now — the calendar masthead.
 *
 * Every part is read off the dataset rather than written down, because a
 * hand-written "Week 11 of 13" is wrong the week after it is typed. The week
 * count spans the term's own "Classes begin" and "Last day of classes", so a
 * term with two sessions is measured end to end.
 */
export function academicTermStatus(now: Date): AcademicTermStatus {
  const dayKey = academicDayKey(now);
  const term = academicTermFor(dayKey);
  const inTerm = ACADEMIC_DATES.filter((entry) => entry.term === term);

  const begins = inTerm.find((e) => e.category === 'term' && e.title === 'Classes begin');
  const ends = [...inTerm].reverse().find(
    (e) => e.category === 'term' && e.title === 'Last day of classes',
  );

  let week: AcademicTermStatus['week'] = null;
  if (begins && ends && dayKey >= begins.date && dayKey <= ends.date) {
    const from = Date.parse(begins.date);
    const elapsed = Date.parse(dayKey) - from;
    const span = Date.parse(ends.date) - from;
    week = {
      current: Math.floor(elapsed / MS_PER_WEEK) + 1,
      total: Math.ceil(span / MS_PER_WEEK) + 1,
    };
  }

  /*
    Phase reads from most specific to least: a closure inside reading week is
    still the closure, and that is the thing worth naming.
  */
  const today = ACADEMIC_DATES.filter((entry) => covers(entry, dayKey));
  const closure = today.find((e) => e.category === 'closure');
  const reading = today.find((e) => e.category === 'term' && e.title === 'Reading week');
  const exams = today.find((e) => e.category === 'exam' && e.endDate);

  let phase = 'Between terms';
  if (closure) phase = closure.title;
  else if (reading) phase = 'Reading week';
  else if (exams) phase = 'Examination period';
  else if (week) phase = 'Classes in session';
  else if (begins && dayKey < begins.date) phase = 'Before classes begin';

  return { term, label: ACADEMIC_TERM_LABEL[term], week, phase };
}
