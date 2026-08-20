/**
 * Academic dates — the shape the app stores them in.
 *
 * Deliberately not the shape of the registrar's web page. That page groups by
 * calendar month inside term headings, repeats a term's name in every row's
 * prose, and splits anything with a duration across two rows ("Reading week
 * begins" / "Reading week ends"). None of that survives contact with a
 * calendar UI, which needs to ask one question: what applies on this day?
 *
 * So each entry here is one fact with a machine-readable span. A period is a
 * single entry with `endDate`, which means a query for a Tuesday in reading
 * week finds it — where the page's two rows would have matched only the
 * Saturday it began and the Friday it ended.
 */

/**
 * What kind of thing the date is. Chosen so that every entry lands in exactly
 * one, and so that a student can filter by the question they are asking:
 * "is campus open", "when do I write", "what do I have to do".
 */
export type AcademicDateCategory =
  /** University closed, or classes cancelled. Changes whether you show up. */
  | 'closure'
  /** Term structure: classes begin/end, reading week, make-up days. */
  | 'term'
  /** Examination periods and the rules around them. */
  | 'exam'
  /** Add, drop, withdraw, and when registration opens. */
  | 'registration'
  /** Money: refund deadlines, resident status, government aid. */
  | 'financial'
  /** Applications and paperwork with a cut-off. */
  | 'deadline'
  /** Graduating: degree conferral and degree transfer. */
  | 'graduation';

/** Academic terms this dataset covers, derived from the date. */
export type AcademicTerm =
  | 'summer-2026'
  | 'fall-2026'
  | 'winter-2027'
  | 'summer-2027';

export type AcademicDateEntry = {
  /** Stable slug: date plus a slug of the title. */
  id: string;
  /** ISO `YYYY-MM-DD`, local civil date — these have no time zone. */
  date: string;
  /** Inclusive last day, for anything with a duration. Absent = single day. */
  endDate?: string;
  category: AcademicDateCategory;
  /** Short enough to read in a stacked card. */
  title: string;
  /** The registrar's qualification — which session, which cohort. */
  detail?: string;
  /**
   * 0–100, higher first. Resolved at build time from the category, or from a
   * per-entry override where the category's default reads wrong.
   *
   * Used to pick which entry leads a day's all-day stack, and kept general on
   * purpose: the same weight decides what a notification is worth waking
   * someone for, and what a crowded month view can afford to drop.
   */
  priority: number;
  /** The student has to do something by this date, not just know about it. */
  actionable: boolean;
  term: AcademicTerm;
};

/**
 * Default weight per category.
 *
 * Ordered by what changes a student's day if they miss it. A closure means do
 * not come in — nothing outranks that. Term structure and exams reshape a
 * week. Registration and money deadlines are recoverable but expensive.
 * Paperwork deadlines matter to the subset they apply to, and graduation
 * dates to a smaller subset still.
 */
export const ACADEMIC_CATEGORY_PRIORITY: Record<AcademicDateCategory, number> = {
  closure: 100,
  term: 80,
  exam: 75,
  registration: 70,
  financial: 65,
  deadline: 45,
  graduation: 40,
};

/** Eyebrow label per category, for cards and list rows. */
export const ACADEMIC_CATEGORY_LABEL: Record<AcademicDateCategory, string> = {
  closure: 'Closure',
  term: 'Term',
  exam: 'Examinations',
  registration: 'Registration',
  financial: 'Fees',
  deadline: 'Deadline',
  graduation: 'Graduation',
};
