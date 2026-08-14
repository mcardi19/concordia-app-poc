import type { ShuttleCampus, ShuttleDepartureStatus } from '@/types/campus';
import { DEFAULT_SHUTTLE_TIMES, SHUTTLE_HOLIDAYS, type ShuttleTimes, type ShuttleWeekdayKey } from './shuttleData';

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function currentTimeHHmm(date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isoDate(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function weekdayKey(date = new Date()): ShuttleWeekdayKey | 'weekend' {
  const d = date.getDay();
  if (d === 0 || d === 6) return 'weekend';
  if (d === 5) return 'fri';
  return 'monThu';
}

function findNextDeparture(times: string[], now: string): string | null {
  for (const t of times) {
    if (now <= t) return t;
  }
  return null;
}

function formatDeparture(time: string): string {
  return time.startsWith('0') ? time.slice(1) : time;
}

export function getShuttleDepartureStatus(
  busTimes = DEFAULT_SHUTTLE_TIMES,
  date = new Date()
): ShuttleDepartureStatus {
  const fullDate = isoDate(date);
  const weekday = weekdayKey(date);
  const now = currentTimeHHmm(date);

  if (SHUTTLE_HOLIDAYS.includes(fullDate)) {
    return {
      loyMessage: 'No service during holidays',
      sgwMessage: '',
      isHoliday: true,
      isWeekend: false,
    };
  }

  if (weekday === 'weekend') {
    return {
      loyMessage: 'No service during the weekend',
      sgwMessage: '',
      isHoliday: false,
      isWeekend: true,
    };
  }

  const dayTimes = busTimes[weekday];
  const lastLoy = dayTimes.loy[dayTimes.loy.length - 1];
  const lastSgw = dayTimes.sgw[dayTimes.sgw.length - 1];

  let loyMessage = '';
  let sgwMessage = '';

  if (now > lastLoy || now < '05:00') {
    loyMessage = 'No more service from Loyola';
  } else {
    const next = findNextDeparture(dayTimes.loy, now);
    loyMessage = next
      ? `${formatDeparture(next)} from Loyola campus`
      : 'No more service from Loyola';
  }

  if (now > lastSgw || now < '05:00') {
    sgwMessage = 'No more service from SGW';
  } else {
    const next = findNextDeparture(dayTimes.sgw, now);
    sgwMessage = next
      ? `${formatDeparture(next)} from SGW campus`
      : 'No more service from SGW';
  }

  if (
    loyMessage === 'No more service from Loyola' &&
    sgwMessage === 'No more service from SGW'
  ) {
    return {
      loyMessage: 'No service during the night',
      sgwMessage: '',
      isHoliday: false,
      isWeekend: false,
    };
  }

  return {
    loyMessage,
    sgwMessage,
    isHoliday: false,
    isWeekend: false,
  };
}

/** Minutes until the next departure from `campus`, or null when there is no service. */
export function getNextShuttleMinutes(
  campus: ShuttleCampus,
  busTimes: ShuttleTimes = DEFAULT_SHUTTLE_TIMES,
  date = new Date()
): number | null {
  const weekday = weekdayKey(date);
  if (SHUTTLE_HOLIDAYS.includes(isoDate(date)) || weekday === 'weekend') {
    return null;
  }

  const times = busTimes[weekday][campus];
  const last = times[times.length - 1];
  const now = currentTimeHHmm(date);
  if (!last || now > last || now < '05:00') {
    return null;
  }

  const next = findNextDeparture(times, now);
  if (!next) {
    return null;
  }

  const [hours, minutes] = next.split(':').map(Number);
  const departure = new Date(date);
  departure.setHours(hours, minutes, 0, 0);
  return Math.max(1, Math.round((departure.getTime() - date.getTime()) / 60_000));
}
