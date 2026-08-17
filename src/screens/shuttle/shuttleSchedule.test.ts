import { DEFAULT_SHUTTLE_TIMES } from '@/services/shuttle/shuttleData';
import { shuttleDeparturesToday, shuttleRunsOn } from './shuttleSchedule';

const monday = (h: number, m = 0) => new Date(2026, 3, 20, h, m);
const friday = (h: number, m = 0) => new Date(2026, 3, 24, h, m);
const saturday = (h: number) => new Date(2026, 3, 25, h);

describe('shuttle timetable', () => {
  /*
    The bug this guards: the placeholder had both directions and both weekday
    patterns identical, so switching direction changed nothing on screen and
    the two buses were indistinguishable.
  */
  it('publishes a different run in each direction', () => {
    const { loy, sgw } = DEFAULT_SHUTTLE_TIMES.monThu;
    expect(loy).not.toEqual(sgw);
  });

  it('publishes a different run on Friday', () => {
    expect(DEFAULT_SHUTTLE_TIMES.fri.loy).not.toEqual(DEFAULT_SHUTTLE_TIMES.monThu.loy);
  });

  it('gives each direction its own departures for the same moment', () => {
    const fromSgw = shuttleDeparturesToday('sgw', monday(9, 20));
    const fromLoy = shuttleDeparturesToday('loy', monday(9, 20));
    expect(fromSgw.map((d) => d.value)).not.toEqual(fromLoy.map((d) => d.value));
  });

  it('marks exactly one next departure, and only ahead of now', () => {
    const run = shuttleDeparturesToday('loy', monday(13, 0));
    expect(run.filter((d) => d.next)).toHaveLength(1);
    const next = run.find((d) => d.next);
    expect(next?.past).toBe(false);
    expect(next!.minutes).toBeGreaterThanOrEqual(13 * 60);
  });

  it('marks earlier departures as gone rather than hiding them', () => {
    const run = shuttleDeparturesToday('loy', monday(13, 0));
    expect(run.some((d) => d.past)).toBe(true);
    // The whole day is still there — "have I missed it" needs the misses.
    expect(run).toHaveLength(DEFAULT_SHUTTLE_TIMES.monThu.loy.length);
  });

  it('has nothing left to mark after the last bus', () => {
    const run = shuttleDeparturesToday('loy', monday(23));
    expect(run.every((d) => d.past)).toBe(true);
    expect(run.some((d) => d.next)).toBe(false);
  });

  it('uses the Friday run on a Friday', () => {
    expect(shuttleDeparturesToday('loy', friday(12))).toHaveLength(
      DEFAULT_SHUTTLE_TIMES.fri.loy.length
    );
  });

  it('does not run at weekends', () => {
    expect(shuttleRunsOn(saturday(12))).toBe(false);
    expect(shuttleDeparturesToday('loy', saturday(12))).toHaveLength(0);
  });
});
