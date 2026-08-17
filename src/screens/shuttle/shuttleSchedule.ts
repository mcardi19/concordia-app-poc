import {
  DEFAULT_SHUTTLE_TIMES,
  SHUTTLE_HOLIDAYS,
  type ShuttleTimes,
} from '@/services/shuttle/shuttleData';
import type { ShuttleCampus } from '@/types/campus';

/** Advertised door-to-door run time between the two campuses. */
export const SHUTTLE_TRIP_MINUTES = 28;

export const SHUTTLE_STOP_NAME: Record<ShuttleCampus, string> = {
  sgw: 'Mackay St.',
  loy: 'W. Broadway',
};

export const SHUTTLE_CAMPUS_NAME: Record<ShuttleCampus, string> = {
  sgw: 'SGW',
  loy: 'Loyola',
};

export type ShuttleDeparture = {
  /** "14:30" as published. */
  value: string;
  /** "2:30 PM" for display. */
  label: string;
  minutes: number;
  /** Already gone. */
  past: boolean;
  /** The first one still to come today. */
  next: boolean;
};

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function format(time: string): string {
  const [h24, m] = time.split(':').map(Number);
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

function weekdayKey(date: Date): 'monThu' | 'fri' | 'weekend' {
  const day = date.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return day === 5 ? 'fri' : 'monThu';
}

function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function shuttleRunsOn(date: Date): boolean {
  return !SHUTTLE_HOLIDAYS.includes(isoDate(date)) && weekdayKey(date) !== 'weekend';
}

/**
 * The full published run for one direction today, each departure marked with
 * whether it has gone and which is next.
 *
 * `getNextShuttleMinutes` answers "how long until the next one"; the tracker
 * needs the whole day so it can show what has been missed and what is left.
 */
export function shuttleDeparturesToday(
  campus: ShuttleCampus,
  now: Date,
  times: ShuttleTimes = DEFAULT_SHUTTLE_TIMES
): ShuttleDeparture[] {
  const weekday = weekdayKey(now);
  if (!shuttleRunsOn(now) || weekday === 'weekend') return [];

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const run = times[weekday][campus];
  const nextIndex = run.findIndex((time) => toMinutes(time) >= nowMinutes);

  return run.map((time, index) => ({
    value: time,
    label: format(time),
    minutes: toMinutes(time),
    past: toMinutes(time) < nowMinutes,
    next: index === nextIndex,
  }));
}
