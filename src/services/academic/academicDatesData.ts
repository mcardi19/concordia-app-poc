import type { AcademicDateCategory } from './academicDateTypes';

/**
 * Every dated row from Concordia's undergraduate academic dates page,
 * 2026-05 through 2027-06.
 *
 * Source: concordia.ca/students/undergraduate/undergraduate-academic-dates
 * Captured 2026-08-20. 103 rows on the page; 94 entries here, because the
 * nineteen rows that were "X begins" / "X ends" pairs are ten spans with an
 * `end` — no date is dropped, both endpoints are still in the record.
 *
 * Titles are rewritten to be scannable on a card. Everything the registrar's
 * wording carried past that — which session, which cohort, which application
 * deadline it pairs with — moves into `detail` rather than being lost.
 */
export type RawAcademicDate = {
  date: string;
  /** Inclusive last day of a span. */
  end?: string;
  category: AcademicDateCategory;
  title: string;
  detail?: string;
  actionable?: boolean;
  /** Overrides the category default where it ranks the entry wrong. */
  priority?: number;
};

/**
 * A refund deadline outranks its own category. It shares a day with the add
 * deadline four times over, and it is the one of the two with money attached.
 */
const REFUND_PRIORITY = 85;

export const RAW_ACADEMIC_DATES: RawAcademicDate[] = [
  // ── Summer 2026 ────────────────────────────────────────────────────────
  { date: '2026-05-03', category: 'exam', title: 'Examinations end', detail: 'Winter 2026 final examination period.' },
  { date: '2026-05-10', category: 'deadline', title: 'Last day to apply for DEF or MED notation', detail: 'Courses ending in April 2026.', actionable: true },
  { date: '2026-05-11', category: 'term', title: 'Classes begin', detail: 'First-term and two-term summer session.' },
  { date: '2026-05-12', category: 'registration', title: 'Last day to request CR/NC grading', detail: 'First-term and two-term summer session courses.', actionable: true },
  { date: '2026-05-15', category: 'deadline', title: 'Last day to apply for late completion', detail: 'Courses ending in April 2026.', actionable: true },
  { date: '2026-05-18', category: 'closure', title: 'Journée nationale des patriotes', detail: 'Victoria Day elsewhere in Canada. University closed.' },
  { date: '2026-05-19', category: 'registration', title: 'Last day to add courses', detail: 'First-term and two-term summer session.', actionable: true },
  { date: '2026-05-19', category: 'financial', title: 'Withdrawal with tuition refund (DNE)', detail: 'First-term and two-term summer session.', actionable: true, priority: REFUND_PRIORITY },
  { date: '2026-05-29', category: 'deadline', title: 'ACSD exam accommodation documentation due', detail: 'Summer 1 2026 final examination period.', actionable: true },
  { date: '2026-05-30', category: 'deadline', title: 'Late-completion work due', detail: 'Courses ending in April 2026. Application deadline was May 15.', actionable: true },

  { date: '2026-06-10', category: 'registration', title: 'Last day for academic withdrawal (DISC)', detail: 'First-term summer session courses.', actionable: true },
  { date: '2026-06-15', category: 'deadline', title: 'Last day to apply for supplemental examinations', detail: 'Courses taken during the regular session 2025-26.', actionable: true },
  { date: '2026-06-15', category: 'deadline', title: 'Last day to apply for re-evaluation', detail: 'Courses ending in April 2026.', actionable: true },
  { date: '2026-06-15', category: 'exam', title: 'Last day for instructor-scheduled tests', detail: 'First-term summer session courses.' },
  { date: '2026-06-22', category: 'term', title: 'Last day of classes', detail: 'First-term summer session.' },
  { date: '2026-06-23', end: '2026-06-30', category: 'exam', title: 'Final examinations', detail: 'First-term summer session.' },
  { date: '2026-06-23', end: '2026-06-30', category: 'term', title: 'Reading week', detail: 'Two-term summer session.' },
  { date: '2026-06-24', category: 'closure', title: 'Fête nationale', detail: 'University closed.' },

  { date: '2026-07-01', category: 'graduation', title: 'Last day to apply to graduate', detail: 'Completing in summer 2026, conferral fall 2026.', actionable: true },
  { date: '2026-07-01', category: 'closure', title: 'Canada Day', detail: 'University closed.' },
  { date: '2026-07-02', category: 'term', title: 'Classes begin', detail: 'Second-term summer session.' },
  { date: '2026-07-02', category: 'registration', title: 'Last day to request CR/NC grading', detail: 'Second-term summer session courses.', actionable: true },
  { date: '2026-07-09', category: 'registration', title: 'Last day to add courses', detail: 'Second-term summer session.', actionable: true },
  { date: '2026-07-09', category: 'financial', title: 'Withdrawal with tuition refund (DNE)', detail: 'Second-term summer session.', actionable: true, priority: REFUND_PRIORITY },
  { date: '2026-07-19', category: 'exam', title: 'Last day to report examination conflicts', actionable: true },
  { date: '2026-07-22', category: 'registration', title: 'Last day for academic withdrawal (DISC)', detail: 'Two-term summer session courses.', actionable: true },
  { date: '2026-07-24', category: 'deadline', title: 'ACSD exam accommodation documentation due', detail: 'Summer 2 2026 final examination period.', actionable: true },
  { date: '2026-07-29', category: 'registration', title: 'Registration opens — Independent students', detail: 'Returning and newly authorized, fall 2026 term.' },
  { date: '2026-07-31', category: 'registration', title: 'Last day for academic withdrawal (DISC)', detail: 'Second-term summer session courses.', actionable: true },

  { date: '2026-08-01', category: 'financial', title: 'Last day to apply for Quebec resident status', detail: 'Summer session 2026.', actionable: true },
  { date: '2026-08-05', category: 'exam', title: 'Last day for instructor-scheduled tests', detail: 'Two-term and second-term summer session courses.' },
  { date: '2026-08-12', category: 'term', title: 'Last day of classes', detail: 'Two-term and second-term summer session.' },
  { date: '2026-08-13', end: '2026-08-18', category: 'exam', title: 'Final examinations', detail: 'Two-term and second-term summer session.' },
  { date: '2026-08-17', category: 'registration', title: 'Registration opens — newly admitted students', detail: 'Winter 2027 term.' },
  { date: '2026-08-19', end: '2026-08-22', category: 'exam', title: 'Replacement and supplemental examinations', detail: 'Regular session 2025-26.' },
  { date: '2026-08-31', category: 'deadline', title: 'Last day to apply for DEF or MED notation', detail: 'Courses taken during the summer session 2026.', actionable: true },

  // ── Fall 2026 ──────────────────────────────────────────────────────────
  { date: '2026-09-01', category: 'deadline', title: 'Last day to apply for late completion', detail: 'Courses taken during the summer session 2026.', actionable: true },
  { date: '2026-09-07', category: 'closure', title: 'Labour Day', detail: 'University closed.' },
  { date: '2026-09-08', category: 'term', title: 'Classes begin', detail: 'Fall and fall/winter terms 2026-27.' },
  { date: '2026-09-14', category: 'registration', title: 'Last day to request CR/NC grading', detail: 'Fall-term and two-term courses.', actionable: true },
  { date: '2026-09-15', category: 'deadline', title: 'Late-completion work due', detail: 'Summer session 2026 courses. Application deadline was September 1.', actionable: true },
  { date: '2026-09-16', category: 'deadline', title: 'Last day to apply for supplemental examinations', detail: 'Courses taken during the summer session 2026.', actionable: true },
  { date: '2026-09-21', category: 'registration', title: 'Last day to add courses', detail: 'Fall-term and two-term courses.', actionable: true },
  { date: '2026-09-21', category: 'financial', title: 'Withdrawal with tuition refund (DNE)', detail: 'Fall-term and two-term courses.', actionable: true, priority: REFUND_PRIORITY },
  { date: '2026-09-26', category: 'exam', title: 'Replacement and supplemental examinations', detail: 'Summer session 2026 courses.' },

  { date: '2026-10-01', category: 'deadline', title: 'Last day to apply for re-evaluation', detail: 'Courses taken during the summer session 2026.', actionable: true },
  { date: '2026-10-05', category: 'closure', title: 'Quebec Election Day', detail: 'No classes held.' },
  { date: '2026-10-10', end: '2026-10-16', category: 'term', title: 'Reading week' },
  { date: '2026-10-12', category: 'closure', title: 'Thanksgiving Day', detail: 'University closed.' },
  { date: '2026-10-23', category: 'deadline', title: 'ACSD exam accommodation documentation due', detail: 'Fall 2026 final examination period.', actionable: true },

  { date: '2026-11-01', category: 'deadline', title: 'Last day to apply for admission', detail: 'Undergraduate programs, winter term 2027.', actionable: true },
  { date: '2026-11-01', category: 'graduation', title: 'Last day to apply to graduate', detail: 'Completing in fall 2026, conferral winter 2027.', actionable: true },
  { date: '2026-11-01', category: 'graduation', title: 'Last day to apply for degree transfer', detail: 'Winter term 2027.', actionable: true },
  { date: '2026-11-16', category: 'registration', title: 'Last day for academic withdrawal (DISC)', detail: 'Fall-term courses (/2).', actionable: true },
  { date: '2026-11-24', category: 'registration', title: 'Registration opens — Independent students', detail: 'Newly authorized, winter term 2027.' },
  { date: '2026-11-30', category: 'exam', title: 'Last day for instructor-scheduled tests' },

  { date: '2026-12-01', category: 'financial', title: 'Last day to apply for Quebec resident status', detail: 'Fall term 2026.', actionable: true },
  { date: '2026-12-07', category: 'term', title: 'Last day of classes', detail: 'Fall term.' },
  { date: '2026-12-08', category: 'term', title: 'Make-up day', detail: 'For classes cancelled by the Quebec provincial election on October 5.' },
  { date: '2026-12-09', end: '2026-12-22', category: 'exam', title: 'Final examinations', detail: 'Fall term.' },
  { date: '2026-12-22', category: 'financial', title: 'AFE end of funding', detail: 'Aide financière aux études, fall term.' },
  { date: '2026-12-24', end: '2027-01-05', category: 'closure', title: 'Holiday period', detail: 'University closed December 24 to January 5.' },

  // ── Winter 2027 ────────────────────────────────────────────────────────
  { date: '2027-01-11', category: 'term', title: 'Classes begin', detail: 'Winter term 2027.' },
  { date: '2027-01-11', category: 'term', title: 'Classes resume', detail: 'Fall/winter term 2026-27.' },
  { date: '2027-01-15', category: 'deadline', title: 'Last day to apply for DEF or MED notation', detail: 'Courses ending in December 2026.', actionable: true },
  { date: '2027-01-18', category: 'registration', title: 'Last day to request CR/NC grading', detail: 'Winter-term courses.', actionable: true },
  { date: '2027-01-25', category: 'registration', title: 'Last day to add courses', detail: 'Winter-term courses.', actionable: true },
  { date: '2027-01-25', category: 'financial', title: 'Withdrawal with tuition refund (DNE)', detail: 'Winter-term courses.', actionable: true, priority: REFUND_PRIORITY },

  { date: '2027-02-01', category: 'deadline', title: 'Last day to apply for supplemental examinations', detail: 'Courses ending in December 2026. Graduating students only.', actionable: true },
  { date: '2027-02-01', category: 'deadline', title: 'Last day to apply for re-evaluation', detail: 'Courses ending in December 2026.', actionable: true },
  { date: '2027-02-01', category: 'deadline', title: 'Last day to apply for late completion', detail: 'Courses ending in December 2026.', actionable: true },
  { date: '2027-02-15', category: 'deadline', title: 'Late-completion work due', detail: 'Courses ending in December 2026. Application deadline was February 1.', actionable: true },

  { date: '2027-03-01', category: 'term', title: 'Reading week', end: '2027-03-07' },
  { date: '2027-03-01', end: '2027-03-04', category: 'exam', title: 'Replacement examinations' },
  { date: '2027-03-01', end: '2027-03-04', category: 'exam', title: 'Supplemental examinations', detail: 'Courses ending in December 2026. Graduating students only.' },
  { date: '2027-03-01', category: 'graduation', title: 'Last day to apply to graduate', detail: 'Completing in winter 2027, conferral spring 2027.', actionable: true },
  { date: '2027-03-01', category: 'deadline', title: 'Last day to apply for admission', detail: 'Undergraduate programs, full-time regular session 2027-28.', actionable: true },
  { date: '2027-03-01', category: 'graduation', title: 'Last day to apply for degree transfer', detail: 'Fall term 2027.', actionable: true },
  { date: '2027-03-05', category: 'closure', title: "President's Holiday", detail: 'University closed.' },
  { date: '2027-03-05', category: 'deadline', title: 'ACSD exam accommodation documentation due', detail: 'Winter 2027 final examination period.', actionable: true },
  { date: '2027-03-22', category: 'registration', title: 'Last day for academic withdrawal (DISC)', detail: 'Two-term (/3) and winter-term (/4) courses.', actionable: true },
  { date: '2027-03-26', end: '2027-03-29', category: 'closure', title: 'Easter holidays', detail: 'University closed March 26 to March 29.' },

  { date: '2027-04-01', category: 'financial', title: 'Last day to apply for Quebec resident status', detail: 'Winter term 2027.', actionable: true },
  { date: '2027-04-05', category: 'exam', title: 'Last day for instructor-scheduled tests' },
  { date: '2027-04-12', category: 'term', title: 'Last day of classes', detail: 'Fall/winter and winter terms 2026-27.' },
  { date: '2027-04-13', category: 'term', title: 'Make-up day', detail: 'For classes scheduled on March 26 and 27.' },
  { date: '2027-04-15', end: '2027-05-02', category: 'exam', title: 'Final examinations', detail: 'Winter term.' },
  { date: '2027-04-30', category: 'financial', title: 'AFE end of funding', detail: 'Aide financière aux études, winter term.' },

  // ── Summer 2027 ────────────────────────────────────────────────────────
  { date: '2027-05-10', category: 'deadline', title: 'Last day to apply for DEF or MED notation', detail: 'Courses ending in April 2027.', actionable: true },
  { date: '2027-05-15', category: 'deadline', title: 'Last day to apply for late completion', detail: 'Courses ending in April 2027.', actionable: true },
  { date: '2027-05-24', category: 'closure', title: 'Journée nationale des patriotes', detail: 'Victoria Day elsewhere in Canada. University closed.' },
  { date: '2027-05-30', category: 'deadline', title: 'Late-completion work due', detail: 'Courses ending in April 2027. Application deadline was May 15.', actionable: true },

  { date: '2027-06-15', category: 'deadline', title: 'Last day to apply for supplemental examinations', detail: 'Courses taken during the regular session 2026-27.', actionable: true },
  { date: '2027-06-15', category: 'deadline', title: 'Last day to apply for re-evaluation', detail: 'Courses ending in April 2027.', actionable: true },
];
