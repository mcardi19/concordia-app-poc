/**
 * Academics flow content, from the design canvas ("Concordia mobile app" →
 * Academics flow · Overview & calendar). Static for now, the way the other
 * flows carry their mock data until an API exists.
 */

export type AcademicKind =
  | 'registration'
  | 'classes'
  | 'exam'
  | 'deadline'
  | 'holiday'
  | 'fees'
  | 'convocation';

export type AcademicEvent = {
  day: string;
  dow: string;
  kind: AcademicKind;
  title: string;
  detail: string;
};

export type AcademicMonth = {
  month: string;
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

export const ACADEMIC_TERM = {
  title: 'Academics',
  term: 'Spring term, ’26',
  week: 'Week 11 of 13',
};

export const TERM_STATS: TermStat[] = [
  { value: '3.62', label: 'Term GPA' },
  { value: '12', label: 'Credits' },
  { value: '4', label: 'Courses' },
  { value: 'A−', label: 'Avg grade' },
];

/** Course accent colours are literal design values, not semantic roles. */
export const COURSES: Course[] = [
  { code: 'ENGL 369', title: 'Modernism in English Literature', prof: 'I. Ashwell', grade: 'A−', pct: 87, color: '#912238' },
  { code: 'PHIL 232', title: 'Philosophy of Mind', prof: 'O. Fenn', grade: 'B+', pct: 82, color: '#7a7a7c' },
  { code: 'HIST 287', title: 'History of Quebec since 1867', prof: 'A. Moreau', grade: 'A', pct: 91, color: '#5a7a6a' },
  { code: 'FRAN 200', title: 'Production écrite I', prof: 'J. Tremblay', grade: '—', pct: null, color: '#8a6a5a' },
];

export const ACADEMIC_RESOURCES: AcademicResource[] = [
  { id: 'moodle', label: 'My Moodle', subtitle: 'Courseware & submissions', icon: 'moodle' },
  { id: 'booklist', label: 'Booklist', subtitle: '7 required · 3 owned', icon: 'book' },
  { id: 'grades', label: 'Grade history', subtitle: 'Term & cumulative', icon: 'chart' },
  { id: 'exams', label: 'Exam schedule', subtitle: 'Rooms & seat assignments', icon: 'exam' },
];

/** The design's canvas is dated to this day; "Today" and "Next up" derive from it. */
export const ACADEMIC_TODAY = { month: 'May 2026', day: '18' };

export const ACADEMIC_MONTHS: AcademicMonth[] = [
  {
    month: 'May 2026',
    events: [
      { day: '03', dow: 'Sun', kind: 'exam', title: 'Winter examination period ends', detail: 'Final exams conclude · Grades by May 17' },
      { day: '11', dow: 'Mon', kind: 'classes', title: 'Summer session begins', detail: 'First day of classes · Sessions A & C' },
      { day: '18', dow: 'Mon', kind: 'holiday', title: 'Victoria Day', detail: 'University closed' },
      { day: '25', dow: 'Mon', kind: 'deadline', title: 'Last day to add Session A', detail: 'Via Student Hub' },
    ],
  },
  {
    month: 'June 2026',
    events: [
      { day: '08', dow: 'Mon', kind: 'convocation', title: 'Spring Convocation begins', detail: '11 ceremonies · Place des Arts' },
      { day: '15', dow: 'Mon', kind: 'fees', title: 'Summer fees due', detail: 'Pay via Student Hub · Late fee $50' },
      { day: '17', dow: 'Wed', kind: 'deadline', title: 'Last day to drop with refund', detail: 'Session A · Tuition refund window' },
      { day: '24', dow: 'Wed', kind: 'holiday', title: 'Saint-Jean-Baptiste', detail: 'Fête nationale · closed' },
    ],
  },
  {
    month: 'July 2026',
    events: [
      { day: '01', dow: 'Wed', kind: 'holiday', title: 'Canada Day', detail: 'University closed' },
      { day: '06', dow: 'Mon', kind: 'classes', title: 'Session B begins', detail: 'First day of classes' },
      { day: '15', dow: 'Wed', kind: 'registration', title: 'Fall registration opens', detail: 'Priority window by year · 8 a.m.' },
    ],
  },
];

export const KIND_META: Record<AcademicKind, { label: string; color: string }> = {
  registration: { label: 'Registration', color: '#3d5a80' },
  classes: { label: 'Classes', color: '#5a7a6a' },
  exam: { label: 'Examinations', color: '#912238' },
  deadline: { label: 'Deadline', color: '#b06a2a' },
  holiday: { label: 'Holiday', color: '#6A3FB0' },
  fees: { label: 'Fees', color: '#a03a4a' },
  convocation: { label: 'Convocation', color: '#8a6a3a' },
};

/** Filter chips across the top of the calendar. `null` matches every kind. */
export const CALENDAR_FILTERS: { id: string; label: string; kinds: AcademicKind[] | null }[] = [
  { id: 'all', label: 'All', kinds: null },
  { id: 'deadlines', label: 'Deadlines', kinds: ['deadline'] },
  { id: 'exams', label: 'Exams', kinds: ['exam'] },
  { id: 'holidays', label: 'Holidays', kinds: ['holiday'] },
  { id: 'fees', label: 'Fees', kinds: ['fees'] },
];

/**
 * The four dates surfaced on the Academics home carousel — the next few
 * chronologically, with the soonest rendered as the filled brand card.
 */
export const UPCOMING_DATES: (AcademicEvent & { monthShort: string; soon?: boolean })[] = [
  { day: '18', monthShort: 'MAY', dow: 'Mon', kind: 'holiday', title: 'Victoria Day', detail: 'University closed', soon: true },
  { day: '25', monthShort: 'MAY', dow: 'Mon', kind: 'registration', title: 'Last day to add Session A', detail: 'Registration' },
  { day: '15', monthShort: 'JUN', dow: 'Mon', kind: 'fees', title: 'Summer fees due', detail: 'Fees' },
  { day: '17', monthShort: 'JUN', dow: 'Wed', kind: 'deadline', title: 'Last day to drop · refund', detail: 'Registration' },
];

/** True when the event falls before today within the current month. */
export function isPastEvent(month: string, event: AcademicEvent): boolean {
  return month === ACADEMIC_TODAY.month && Number(event.day) < Number(ACADEMIC_TODAY.day);
}

export function isToday(month: string, event: AcademicEvent): boolean {
  return month === ACADEMIC_TODAY.month && event.day === ACADEMIC_TODAY.day;
}

/** First event strictly after today, in chronological order. */
export function nextEvent(): { month: string; event: AcademicEvent } | null {
  for (const m of ACADEMIC_MONTHS) {
    for (const e of m.events) {
      if (m.month === ACADEMIC_TODAY.month && Number(e.day) <= Number(ACADEMIC_TODAY.day)) continue;
      return { month: m.month, event: e };
    }
  }
  return null;
}
