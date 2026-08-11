import type { SisScheduleClass } from '@/types/sis';
import type { ScheduleEvent, ScheduleEventStatus } from './scheduleTypes';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const TIMELINE_START_HOUR = 8;
export const TIMELINE_END_HOUR = 19;
export const HOUR_ROW_HEIGHT = 72;

export function parseYmd(ymd: string): Date {
  const y = Number(ymd.slice(0, 4));
  const m = Number(ymd.slice(4, 6)) - 1;
  const d = Number(ymd.slice(6, 8));
  return new Date(y, m, d);
}

export function toYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function getWeekDates(weekMondayYmd: string): Date[] {
  const monday = parseYmd(weekMondayYmd);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getDayKey(date: Date): string {
  return DAY_KEYS[date.getDay()];
}

export function getDayLetter(date: Date): string {
  return DAY_LETTERS[date.getDay()];
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseClassMinutes(hours: string, minutes: string): number {
  return Number(hours) * 60 + Number(minutes);
}

export function mapSisClassToEvent(item: SisScheduleClass, index: number): ScheduleEvent {
  return {
    id: `${item.SUBJECT}-${item.CATALOG_NBR}-${item.CLASS_SECTION}-${item.DAY_OF_WEEK}-${index}`,
    courseCode: `${item.SUBJECT} ${item.CATALOG_NBR}`.trim(),
    title: item.XLATLONGNAME?.trim() || 'Class',
    startMinutes: parseClassMinutes(item.START_HOURS, item.START_MINUTES),
    endMinutes: parseClassMinutes(item.END_HOURS, item.END_MINUTES),
    dayKey: item.DAY_OF_WEEK.toLowerCase(),
  };
}

export function filterEventsForDay(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const key = getDayKey(date);
  return events
    .filter((e) => e.dayKey === key)
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

export function formatWeekMeta(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  const month = date.getMonth();
  let term = 'Fall term';
  if (month >= 0 && month <= 4) term = 'Spring term';
  else if (month >= 5 && month <= 7) term = 'Summer term';
  return `Week ${week} · ${term}`;
}

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatDayHeading(date: Date): { main: string; suffix: string } {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  return {
    main: `${weekday}, ${month} ${day}`,
    suffix: ordinalSuffix(day),
  };
}

export function formatTimelineHour(hour: number): string {
  if (hour === 0) return '12a';
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return '12p';
  return `${hour - 12}p`;
}

export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  const fmt = (total: number) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  return `${fmt(startMinutes)}–${fmt(endMinutes)}`;
}

export function formatNowLabel(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `Now · ${h}:${String(m).padStart(2, '0')}`;
}

export function getEventStatus(
  event: ScheduleEvent,
  now: Date,
  selectedDate: Date
): ScheduleEventStatus {
  if (!isSameDay(selectedDate, now)) {
    const selectedStart = startOfDay(selectedDate).getTime();
    const todayStart = startOfDay(now).getTime();
    return selectedStart < todayStart ? 'past' : 'future';
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes >= event.endMinutes) return 'past';
  if (nowMinutes >= event.startMinutes && nowMinutes < event.endMinutes) return 'active';
  return 'future';
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getTimelineHeight(): number {
  return (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_ROW_HEIGHT;
}

export function minutesToTop(minutes: number): number {
  const start = TIMELINE_START_HOUR * 60;
  return ((minutes - start) / 60) * HOUR_ROW_HEIGHT;
}

export function eventBlockHeight(startMinutes: number, endMinutes: number): number {
  return Math.max(((endMinutes - startMinutes) / 60) * HOUR_ROW_HEIGHT - 8, 56);
}

export function getNowLineTop(now: Date): number | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = TIMELINE_START_HOUR * 60;
  const end = TIMELINE_END_HOUR * 60;
  if (minutes < start || minutes > end) return null;
  return minutesToTop(minutes);
}

export function dayHasEvents(events: ScheduleEvent[], date: Date): boolean {
  return events.some((e) => e.dayKey === getDayKey(date));
}

/**
 * Monday-first ordering for the agenda and planner. Distinct from the
 * Sunday-first DAY_KEYS above, which exists to index Date.getDay().
 */
export const WEEK_ORDER_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const WEEKDAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/**
 * Clock label for the agenda rail. Start times carry the meridiem, end times
 * drop it — the design leans on that asymmetry to keep the rail scannable.
 */
export function formatClock(minutes: number, withMeridiem = false): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const time = `${h12}:${String(m).padStart(2, '0')}`;
  return withMeridiem ? `${time} ${h24 >= 12 ? 'PM' : 'AM'}` : time;
}

export type ScheduleDayGroup = {
  dayKey: string;
  weekdayLabel: string;
  /** e.g. "Apr 17" */
  dateLabel: string;
  events: ScheduleEvent[];
};

/**
 * Groups events into day sections for the agenda, in week order and sorted by
 * start time. Days with nothing on them are dropped — the agenda is a
 * chronological list, not a calendar.
 */
export function groupEventsByDay(
  events: ScheduleEvent[],
  weekDates?: Date[]
): ScheduleDayGroup[] {
  return WEEK_ORDER_KEYS.map((dayKey, index) => {
    const dayEvents = events
      .filter((e) => e.dayKey === dayKey)
      .sort((a, b) => a.startMinutes - b.startMinutes);
    const date = weekDates?.[index];
    return {
      dayKey,
      weekdayLabel: WEEKDAY_LABELS[dayKey] ?? dayKey,
      dateLabel: date
        ? date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
        : '',
      events: dayEvents,
    };
  }).filter((group) => group.events.length > 0);
}
