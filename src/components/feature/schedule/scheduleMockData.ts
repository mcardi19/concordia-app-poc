import type { ScheduleEvent } from './scheduleTypes';

/** Demo schedule aligned with the product mockup (Friday). */
export const MOCK_SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: 'mock-phil-210',
    courseCode: 'PHIL 210',
    title: 'Ethics and Society',
    startMinutes: 9 * 60,
    endMinutes: 10 * 60 + 15,
    dayKey: 'fri',
  },
  {
    id: 'mock-engl-342',
    courseCode: 'ENGL 342',
    title: 'The Modernist Novel',
    startMinutes: 14 * 60 + 30,
    endMinutes: 15 * 60 + 45,
    dayKey: 'fri',
  },
  {
    id: 'mock-hist-118',
    courseCode: 'HIST 118',
    title: 'Europe Since 1945',
    startMinutes: 11 * 60,
    endMinutes: 12 * 60 + 15,
    dayKey: 'fri',
  },
  {
    id: 'mock-study',
    courseCode: 'STUDY',
    title: 'Group session',
    startMinutes: 16 * 60,
    endMinutes: 17 * 60 + 30,
    dayKey: 'fri',
    kind: 'study',
  },
];
