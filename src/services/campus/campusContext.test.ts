import { resolveCampusContext } from './campusContext';
import type { BuildingSummary } from '@/types/campus';

/**
 * Monday's mock timetable, which these cases are pinned to:
 *   PHIL 232  08:45–10:00  H-407
 *   HIST 210  10:15–11:30  H-302
 *   ENGL 369  13:15–15:30  LB-625
 */
const monday = (hours: number, minutes = 0) => new Date(2026, 3, 20, hours, minutes);

const HALL: BuildingSummary = {
  id: 'h',
  campusId: 'sgw',
  code: 'H',
  name: 'Henry F. Hall Building',
  lat: 45.4973,
  lng: -73.5788,
  amenities: [],
};

/**
 * A 15-minute walk from Hall at the app's 5 km/h — further than the 15
 * minutes available at 08:30, so the buffer is breached.
 */
const FAR = { latitude: 45.4863, longitude: -73.5788 };
/** A 9-minute walk: still comfortably inside the same 15 minutes. */
const MID = { latitude: 45.4908, longitude: -73.5762 };
/** Standing at the door. */
const NEAR = { latitude: 45.4973, longitude: -73.5788 };

const base = { buildings: [HALL], campusId: 'sgw' as const };

describe('resolveCampusContext', () => {
  it('says nothing when the next class is hours away', () => {
    expect(
      resolveCampusContext({ ...base, now: monday(6), coords: NEAR })
    ).toBeNull();
  });

  it('announces the next class once it is inside the window', () => {
    const card = resolveCampusContext({ ...base, now: monday(8), coords: NEAR });
    expect(card?.eyebrow).toBe('Up next · calendar');
    expect(card?.title).toBe('PHIL 232');
    expect(card?.building?.code).toBe('H');
  });

  it('escalates to leave-now when the walk no longer fits', () => {
    const card = resolveCampusContext({ ...base, now: monday(8, 30), coords: FAR });
    expect(card?.eyebrow).toBe('Time to go');
    expect(card?.title).toBe('Leave now to make it on time');
  });

  it('still says up next when the walk fits with room to spare', () => {
    // 9 min walk, 15 min until start — inside the buffer, so no escalation.
    const card = resolveCampusContext({ ...base, now: monday(8, 30), coords: MID });
    expect(card?.eyebrow).toBe('Up next · calendar');
    expect(card?.meta.time).toBe('9 min walk');
  });

  it('stays silent on leave-now without a location fix, rather than guessing', () => {
    const card = resolveCampusContext({ ...base, now: monday(8, 30), coords: null });
    expect(card?.eyebrow).toBe('Up next · calendar');
    // No walk to show, so it falls back to the start time.
    expect(card?.meta.time).toBe('8:45 AM');
  });

  it('says nothing once the day has no classes left', () => {
    expect(
      resolveCampusContext({ ...base, now: monday(21), coords: NEAR })
    ).toBeNull();
  });

  it('ignores a class already running — that is not somewhere to go', () => {
    const card = resolveCampusContext({ ...base, now: monday(9), coords: NEAR });
    expect(card?.title).not.toContain('PHIL 232');
  });

  it('carries no building when the room does not resolve to one', () => {
    const card = resolveCampusContext({
      ...base,
      buildings: [],
      now: monday(8),
      coords: NEAR,
    });
    expect(card?.building).toBeUndefined();
    // Still worth announcing; it just cannot point at anything.
    expect(card?.eyebrow).toBe('Up next · calendar');
  });
});
