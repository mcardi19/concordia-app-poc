/**
 * Course lookups against Concordia Open Data.
 *
 * @see docs/CONCORDIA_OPEN_DATA_DATA_SHAPES.md
 */

import { getConcordiaOpenDataClient } from './concordiaOpenDataClient';
import type {
  CourseCatalogRow,
  CourseDescriptionRow,
  CourseDetail,
  CourseEnrolment,
  CourseSectionRow,
} from '@/types/courses';

/** The API returns `[]` as `{}` on some paths; normalise both to an array. */
function asRows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

/**
 * Split a timetable code into the pair the API filters on.
 *
 * The schedule carries `"PHIL 232"`, but every course endpoint keys on either
 * a 6-digit id or a subject/catalog pair — so this is the first hop of the
 * two-hop lookup. Returns null for the non-course blocks in the timetable
 * ("Study", "Tutor"), which have no catalog entry to find.
 */
export function parseCourseCode(
  courseCode: string,
): { subject: string; catalog: string } | null {
  const match = courseCode.trim().match(/^([A-Za-z]{3,4})\s*([0-9]{3,4}[A-Za-z]?)$/);
  if (!match) return null;
  return { subject: match[1].toUpperCase(), catalog: match[2].toUpperCase() };
}

export async function fetchCourseCatalog(
  subject: string,
  catalog: string,
  career = '*',
): Promise<CourseCatalogRow[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get(
    `course/catalog/filter/${subject}/${catalog}/${career}`,
  );
  return asRows<CourseCatalogRow>(data);
}

export async function fetchCourseDescription(
  courseId: string,
): Promise<CourseDescriptionRow[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get(`course/description/filter/${courseId}`);
  return asRows<CourseDescriptionRow>(data);
}

export async function fetchCourseSections(
  subject: string,
  catalog: string,
): Promise<CourseSectionRow[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get(`course/section/filter/${subject}/${catalog}`);
  return asRows<CourseSectionRow>(data);
}

/**
 * Undo the CSV-ish escaping the calendar text arrives with.
 *
 * Descriptions come back wrapped in a quote and with every internal quote
 * doubled — `"Philosophical discussions … say ""Thats the right thing to do""`
 * — which renders as stray punctuation if passed straight to a Text node.
 *
 * Not fixed here: the source also has `-` where `?` belongs ("What should one
 * do-)"). That is mangled upstream and there is no rule that separates it from
 * a legitimate hyphen, so it is left alone rather than guessed at.
 */
function cleanDescription(value: string): string {
  let text = value.trim();
  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  } else if (text.startsWith('"')) {
    text = text.slice(1);
  }
  return text.replace(/""/g, '"').trim();
}

/** "" and whitespace both mean "none" on this API. */
function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Roll the section rows up to a course-level total.
 *
 * One row per section, so a course with a lecture and three tutorials returns
 * four. The overall* fields repeat the course total on every row, so the first
 * row carrying them wins; the per-class fields are summed only as a fallback
 * for courses where the overall figures come back empty.
 */
function summariseEnrolment(rows: CourseSectionRow[]): CourseEnrolment | null {
  if (rows.length === 0) return null;

  const overall = rows.find((row) => Number(row.overallEnrollCapacity) > 0);
  if (overall) {
    return {
      enrolled: Number(overall.overallEnrollments) || 0,
      capacity: Number(overall.overallEnrollCapacity) || 0,
      waitlisted: Number(overall.overallWaitlisTotal) || 0,
    };
  }

  const totals = rows.reduce(
    (acc, row) => ({
      enrolled: acc.enrolled + (Number(row.classEnrollments) || 0),
      capacity: acc.capacity + (Number(row.classEnrollCapacity) || 0),
      waitlisted: acc.waitlisted + (Number(row.classWaitlistTotal) || 0),
    }),
    { enrolled: 0, capacity: 0, waitlisted: 0 },
  );
  return totals.capacity > 0 ? totals : null;
}

/**
 * Everything the detail screen shows, for one timetable course code.
 *
 * Two hops: the catalog row resolves the id (and carries credits and
 * prerequisites), then the description is fetched by that id. Sections are
 * requested alongside the description rather than after it — they key on
 * subject/catalog, not the id, so they never had to wait.
 *
 * Description and sections are allowed to fail independently: a course with no
 * calendar entry should still show its credits.
 */
export async function fetchCourseDetail(courseCode: string): Promise<CourseDetail | null> {
  const parsed = parseCourseCode(courseCode);
  if (!parsed) return null;

  const { subject, catalog } = parsed;
  const catalogRows = await fetchCourseCatalog(subject, catalog);
  const course = catalogRows[0];
  if (!course) return null;

  const [description, sections] = await Promise.all([
    fetchCourseDescription(course.ID).catch(() => []),
    fetchCourseSections(subject, catalog).catch(() => []),
  ]);

  const credits = Number(course.classUnit);

  return {
    courseId: course.ID,
    title: course.title,
    subject: course.subject,
    catalog: course.catalog,
    description: (() => {
      const raw = textOrNull(description[0]?.description);
      return raw ? cleanDescription(raw) : null;
    })(),
    credits: Number.isFinite(credits) ? credits : null,
    prerequisites: textOrNull(course.prerequisites),
    crosslisted: textOrNull(course.crosslisted),
    enrolment: summariseEnrolment(sections),
  };
}
