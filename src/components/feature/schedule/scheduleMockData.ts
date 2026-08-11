import type { ScheduleAllDayItem, ScheduleEvent } from './scheduleTypes';
import { scheduleTheme } from './scheduleTheme';

const BRAND = '#912338';

const hm = (h: number, m = 0) => h * 60 + m;

/**
 * One demo week, keyed by day. Friday is "today" in the design, so it carries
 * the in-session block and the completed morning classes; the other days give
 * the 3-day planner something to lay out.
 */
export const MOCK_WEEK_EVENTS: ScheduleEvent[] = [
  // ── Monday ──
  { id: 'mon-phil', dayKey: 'mon', courseCode: 'PHIL 232', title: 'Philosophy of Mind', startMinutes: hm(8, 45), endMinutes: hm(10), room: 'H-407', professor: 'Dr. O. Fenn', mode: 'P', tint: '#B8A090' },
  { id: 'mon-hist', dayKey: 'mon', courseCode: 'HIST 287', title: 'History of Quebec since 1867', startMinutes: hm(10, 15), endMinutes: hm(11, 30), room: 'H-302', professor: 'Dr. A. Moreau', mode: 'P', tint: '#C9B0A0' },
  { id: 'mon-engl', dayKey: 'mon', courseCode: 'ENGL 369', title: 'Modernism in English Literature', startMinutes: hm(13, 15), endMinutes: hm(15, 30), room: 'LB-625', professor: 'Prof. I. Ashwell', mode: 'B', tint: BRAND },
  { id: 'mon-study', dayKey: 'mon', courseCode: 'Study', title: 'Group session', startMinutes: hm(16), endMinutes: hm(17, 30), room: 'LB-322', kind: 'study', tint: scheduleTheme.tintStudy },

  // ── Tuesday ──
  { id: 'tue-fran', dayKey: 'tue', courseCode: 'FRAN 200', title: 'Production écrite I', startMinutes: hm(10), endMinutes: hm(11, 15), room: 'Online', professor: 'Dr. J. Tremblay', mode: 'OL', tint: '#7A7A7C' },
  { id: 'tue-phil', dayKey: 'tue', courseCode: 'PHIL 232', title: 'Philosophy of Mind', startMinutes: hm(13), endMinutes: hm(14, 15), room: 'H-407', professor: 'Dr. O. Fenn', mode: 'P', tint: '#B8A090' },
  { id: 'tue-tutor', dayKey: 'tue', courseCode: 'Tutor', title: 'TA hours', startMinutes: hm(18), endMinutes: hm(19, 30), room: 'TA hrs', kind: 'study', tint: scheduleTheme.tintStudy },

  // ── Wednesday ──
  { id: 'wed-phil', dayKey: 'wed', courseCode: 'PHIL 232', title: 'Philosophy of Mind', startMinutes: hm(8, 45), endMinutes: hm(10), room: 'H-407', professor: 'Dr. O. Fenn', mode: 'P', tint: '#B8A090' },
  { id: 'wed-hist', dayKey: 'wed', courseCode: 'HIST 287', title: 'History of Quebec since 1867', startMinutes: hm(10, 15), endMinutes: hm(11, 30), room: 'H-302', professor: 'Dr. A. Moreau', mode: 'P', tint: '#C9B0A0' },
  { id: 'wed-engl', dayKey: 'wed', courseCode: 'ENGL 369', title: 'Modernism in English Literature', startMinutes: hm(13, 15), endMinutes: hm(15, 30), room: 'LB-625', professor: 'Prof. I. Ashwell', mode: 'B', tint: BRAND },
  { id: 'wed-club', dayKey: 'wed', courseCode: 'Club', title: 'Debate Society', startMinutes: hm(19), endMinutes: hm(20, 30), room: 'H-110', kind: 'study', tint: scheduleTheme.tintStudy },

  // ── Thursday ──
  { id: 'thu-fran', dayKey: 'thu', courseCode: 'FRAN 200', title: 'Production écrite I', startMinutes: hm(10), endMinutes: hm(11, 15), room: 'Online', professor: 'Dr. J. Tremblay', mode: 'OL', tint: '#7A7A7C' },
  { id: 'thu-office', dayKey: 'thu', courseCode: 'Office hrs', title: 'Advisor drop-in', startMinutes: hm(14), endMinutes: hm(16), room: 'Adv.', kind: 'study', tint: scheduleTheme.tintStudy },

  // ── Friday — "today" ──
  { id: 'fri-phil', dayKey: 'fri', courseCode: 'PHIL 232', title: 'Philosophy of Mind', startMinutes: hm(8, 45), endMinutes: hm(10), room: 'H-407', professor: 'Dr. O. Fenn', mode: 'P', tint: '#B8A090', done: true },
  { id: 'fri-hist', dayKey: 'fri', courseCode: 'HIST 287', title: 'History of Quebec since 1867', startMinutes: hm(10, 15), endMinutes: hm(11, 30), room: 'H-302', professor: 'Dr. A. Moreau', mode: 'P', tint: '#C9B0A0', done: true },
  { id: 'fri-engl', dayKey: 'fri', courseCode: 'ENGL 369', title: 'Modernism in English Literature', startMinutes: hm(13, 15), endMinutes: hm(15, 30), room: 'LB-625', professor: 'Prof. I. Ashwell', mode: 'B', tint: BRAND, now: true },
  { id: 'fri-study', dayKey: 'fri', courseCode: 'Study', title: 'Group session — Ch. 4 response', startMinutes: hm(16), endMinutes: hm(17, 30), room: 'LB-322', professor: 'Noor, Kenji, Theo', kind: 'study', tint: scheduleTheme.tintStudy },
  { id: 'fri-fran', dayKey: 'fri', courseCode: 'FRAN 200', title: 'Production écrite I', startMinutes: hm(18), endMinutes: hm(20), room: 'Online', professor: 'Dr. J. Tremblay', mode: 'OL', tint: '#7A7A7C' },

  // ── Saturday ──
  { id: 'sat-read', dayKey: 'sat', courseCode: 'Reading', title: 'Final project kickoff', startMinutes: hm(11), endMinutes: hm(13), room: 'LB-322', kind: 'study', tint: scheduleTheme.tintStudy },
];

/** Institutional entries pinned above the hour rail. */
export const MOCK_ALL_DAY_ITEMS: ScheduleAllDayItem[] = [
  { id: 'exams-end', kind: 'University', title: 'Examinations end' },
];

/** "Now" marker position in the design — Friday 2:42 PM. */
export const MOCK_NOW_MINUTES = hm(14, 42);

/** @deprecated Use MOCK_WEEK_EVENTS. Kept so older imports keep resolving. */
export const MOCK_SCHEDULE_EVENTS = MOCK_WEEK_EVENTS.filter((e) => e.dayKey === 'fri');
