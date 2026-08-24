/** Agenda = chronological list, day = live timeline, week = 3-day planner. */
export type ScheduleViewMode = 'agenda' | 'day' | 'week';

export type ScheduleEventStatus = 'past' | 'active' | 'future';

/** Delivery mode: in person, blended, online. */
export type ScheduleDeliveryMode = 'P' | 'B' | 'OL';

/**
 * The teaching component a meeting belongs to. A course is the enrolment —
 * ENGL 369 — while the thing in the timetable is one of its components, and
 * which one changes what you bring: a lab is not a lecture.
 */
export type SessionComponent = 'lecture' | 'tutorial' | 'lab' | 'seminar';

export const SESSION_COMPONENT_LABEL: Record<SessionComponent, string> = {
  lecture: 'Lecture',
  tutorial: 'Tutorial',
  lab: 'Lab',
  seminar: 'Seminar',
};

export type ScheduleEvent = {
  id: string;
  courseCode: string;
  title: string;
  /** Minutes from midnight */
  startMinutes: number;
  endMinutes: number;
  /** Lowercase three-letter day key: mon, tue, … */
  dayKey: string;
  kind?: 'class' | 'study';
  /** Which component of the course this meeting is. Unset on study blocks. */
  component?: SessionComponent;
  room?: string;
  professor?: string;
  mode?: ScheduleDeliveryMode;
  /**
   * Accent rail colour. Falls back to brand for classes, grey for study.
   *
   * Note there is no `done` or `now` here. Both used to be stored, frozen to
   * the design canvas's Friday 2:42 PM, which meant a Friday morning class
   * read as finished at 9am and a lecture read as live on the wrong day.
   * `eventStatus` derives both from the clock instead.
   */
  tint?: string;
};

/**
 * Institutional all-day entries (exam periods, holidays, deadlines). Shown as
 * a stacked banner above the hour rail rather than as timed blocks.
 */
export type ScheduleAllDayItem = {
  id: string;
  /** "Closure", "Deadline", "Examinations" — rendered as the eyebrow. */
  kind: string;
  title: string;
  /** The registrar's qualification, shown once the stack is expanded. */
  detail?: string;
  /** Higher leads the stack. See `ACADEMIC_CATEGORY_PRIORITY`. */
  priority?: number;
};
