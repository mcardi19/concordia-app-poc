/** Agenda = chronological list, day = live timeline, week = 3-day planner. */
export type ScheduleViewMode = 'agenda' | 'day' | 'week';

export type ScheduleEventStatus = 'past' | 'active' | 'future';

/** Delivery mode: in person, blended, online. */
export type ScheduleDeliveryMode = 'P' | 'B' | 'OL';

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
  room?: string;
  professor?: string;
  mode?: ScheduleDeliveryMode;
  /** Accent rail colour. Falls back to brand for classes, grey for study. */
  tint?: string;
  /** Already finished — rendered dimmed. */
  done?: boolean;
  /** In session right now — rendered as the emphasised card. */
  now?: boolean;
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
