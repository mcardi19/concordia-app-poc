import { useMemo } from 'react';
import { useNow } from '@/hooks';
import { useAppearance } from '@/design-system/theme';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { getDayKey, WEEK_ORDER_KEYS } from '@/components/feature/schedule/scheduleUtils';
import {
  SESSION_COMPONENT_LABEL,
  type ScheduleEvent,
} from '@/components/feature/schedule/scheduleTypes';
import { sessionHeroImage, type TodaySession } from './todayData';

/**
 * Where the student is in their teaching day. The design's contextual states
 * turn on exactly this — the card's job changes from "get there" to "you are
 * here" to "you are done", and only the status line and its tone carry it.
 */
export type TodaySessionState = 'inSession' | 'imminent' | 'upcoming' | 'tomorrow' | 'done';

/** Under this many minutes and the card stops counting down and says "leave". */
const IMMINENT_MINUTES = 15;

/** Tones from the design's status pills. */
const TONE_LIGHT = {
  live: '#2F8F5B',
  soon: '#C2683A',
  later: '#D1A020',
  rest: '#2F77C4',
} as const;

const TONE_DARK = {
  live: '#3FAE72',
  soon: '#D97A4F',
  later: '#E0B23A',
  rest: '#4A8FDB',
} as const;

function getTodayStatusTones(scheme: 'light' | 'dark') {
  return scheme === 'dark' ? TONE_DARK : TONE_LIGHT;
}

/**
 * Default status tone for badges rendered without an explicit one — shared
 * so a stray badge doesn't invent its own, inconsistent "live" green.
 */
export const DEFAULT_STATUS_TONE = TONE_LIGHT.live;

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "1 h 20 min" / "45 min" — the countdown the status pill shows. */
function formatGap(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Classes only — a study block or a club is not what these cards announce.
 * Exported so the Campus map's contextual cards select the same set; two
 * definitions of "a class" would let Home and the map disagree.
 */
export function classesOn(dayKey: string): ScheduleEvent[] {
  return MOCK_WEEK_EVENTS.filter(
    (event) => event.dayKey === dayKey && event.kind !== 'study',
  ).sort((a, b) => a.startMinutes - b.startMinutes);
}

function nextTeachingDay(
  fromDayKey: string,
): { dayKey: string; event: ScheduleEvent; daysAhead: number } | null {
  const start = (WEEK_ORDER_KEYS as readonly string[]).indexOf(fromDayKey);
  if (start < 0) return null;
  // A week at most — a timetable with nothing in it should end, not loop.
  for (let step = 1; step <= WEEK_ORDER_KEYS.length; step += 1) {
    const dayKey = WEEK_ORDER_KEYS[(start + step) % WEEK_ORDER_KEYS.length];
    const [event] = classesOn(dayKey);
    if (event) return { dayKey, event, daysAhead: step };
  }
  return null;
}

/**
 * Names the day the next class is on.
 *
 * "next" and "tomorrow" do not go together — nobody says "next tomorrow" —
 * so the whole tail changes rather than just the day word: tomorrow gets the
 * relative form, anything further out gets "next" and a weekday.
 */
function nextDayPhrase(dayKey: string, daysAhead: number): string {
  return daysAhead === 1 ? 'tomorrow' : `next ${DAY_NAME[dayKey] ?? ''}`.trim();
}

const DAY_NAME: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function fromEvent(
  event: ScheduleEvent,
  state: TodaySessionState,
  statusLabel: string,
  statusTone: string,
): TodaySession {
  const inSession = state === 'inSession';
  return {
    courseCode: event.courseCode,
    componentLabel: event.component ? SESSION_COMPONENT_LABEL[event.component] : undefined,
    title: event.title,
    statusLabel,
    statusTone,
    state,
    // "Ends" only makes sense while it is running; before that the useful
    // number is when to be there.
    timeLabel: inSession ? 'Ends' : 'Starts',
    timeValue: formatClock(inSession ? event.endMinutes : event.startMinutes),
    mode: event.mode,
    room: event.room ?? 'Room TBA',
    professor: event.professor ?? '—',
    professorFpid: event.professorFpid,
    eventId: event.id,
    image: sessionHeroImage,
  };
}

/**
 * The Home session card, derived from the timetable rather than a fixed mock.
 *
 * One source of truth: the card and the Schedule tab now read the same events,
 * so a class cannot show as "in session" on Home while the timetable disagrees.
 * Recomputed off `useNow`, which ticks once a minute — the same clock the
 * schedule's now-marker uses.
 */
export function deriveTodaySession(now: Date, scheme: 'light' | 'dark' = 'light'): TodaySession {
  const TONE = getTodayStatusTones(scheme);
  const dayKey = getDayKey(now);
  const minutes = toMinutes(now);
  const today = classesOn(dayKey);

  const current = today.find(
    (event) => minutes >= event.startMinutes && minutes < event.endMinutes,
  );
  if (current) {
    const left = current.endMinutes - minutes;
    return fromEvent(current, 'inSession', `In session · ${formatGap(left)} left`, TONE.live);
  }

  const next = today.find((event) => event.startMinutes > minutes);
  if (next) {
    const gap = next.startMinutes - minutes;
    return gap <= IMMINENT_MINUTES
      ? fromEvent(next, 'imminent', `Starts in ${formatGap(gap)}`, TONE.soon)
      : fromEvent(next, 'upcoming', `Starts in ${formatGap(gap)}`, TONE.later);
  }

  /*
    Nothing left today. The design's "day complete" state is its own layout;
    until that exists, the honest and still-useful thing is the next class on
    the timetable, labelled as the other day it is on — rather than a card
    that keeps announcing a lecture that already finished.
  */
  const upcoming = nextTeachingDay(dayKey);
  if (upcoming) {
    if (upcoming.daysAhead === 1) {
      return fromEvent(upcoming.event, 'tomorrow', 'Next class · Tomorrow', TONE.rest);
    }
    const label = today.length > 0 ? 'Done for today' : 'No classes today';
    const when = nextDayPhrase(upcoming.dayKey, upcoming.daysAhead);
    return fromEvent(upcoming.event, 'tomorrow', `${label} · ${when}`, TONE.rest);
  }

  return {
    courseCode: '',
    title: "You're done for today",
    statusLabel: 'Day complete',
    statusTone: TONE.live,
    state: 'done',
    timeLabel: 'Classes',
    timeValue: `${today.length} of ${today.length}`,
    room: '—',
    professor: '—',
    image: sessionHeroImage,
  };
}

export function useTodaySession(): TodaySession {
  const now = useNow();
  const { scheme } = useAppearance();
  return useMemo(() => deriveTodaySession(now, scheme), [now, scheme]);
}
