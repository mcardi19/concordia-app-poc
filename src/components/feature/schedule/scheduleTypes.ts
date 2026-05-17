export type ScheduleViewMode = 'day' | 'week';

export type ScheduleEventStatus = 'past' | 'active' | 'future';

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
};
