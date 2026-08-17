import { deriveTodaySession } from './todaySession';

/**
 * The mock timetable's Monday, which these cases are pinned to:
 *   PHIL 232  08:45–10:00  H-407
 *   HIST 287  10:15–11:30  H-302
 *   ENGL 369  13:15–15:30  LB-625
 *   Study     16:00–17:30  (kind: 'study' — never the card's subject)
 */
const monday = (hours: number, minutes = 0) =>
  new Date(2026, 3, 20, hours, minutes); // Mon 20 Apr 2026

const saturday = (hours: number) => new Date(2026, 3, 25, hours);

describe('deriveTodaySession', () => {
  it('reports the class that is running', () => {
    const session = deriveTodaySession(monday(9, 12));
    expect(session.state).toBe('inSession');
    expect(session.courseCode).toBe('PHIL 232');
    expect(session.statusLabel).toBe('In session · 48 min left');
    // "Ends" only while it runs.
    expect(session.timeLabel).toBe('Ends');
    expect(session.timeValue).toBe('10:00 AM');
    expect(session.room).toBe('H-407');
  });

  it('counts down to a class that is close', () => {
    const session = deriveTodaySession(monday(8, 35));
    expect(session.state).toBe('imminent');
    expect(session.statusLabel).toBe('Starts in 10 min');
    expect(session.timeLabel).toBe('Starts');
    expect(session.timeValue).toBe('8:45 AM');
  });

  it('counts down in hours when the next class is further out', () => {
    const session = deriveTodaySession(monday(11, 45));
    expect(session.state).toBe('upcoming');
    expect(session.courseCode).toBe('ENGL 369');
    expect(session.statusLabel).toBe('Starts in 1 h 30 min');
  });

  it('skips study blocks — the gap after the last class is not a class', () => {
    const session = deriveTodaySession(monday(16, 30));
    expect(session.state).not.toBe('inSession');
    expect(session.courseCode).not.toBe('Study');
  });

  it('rolls to the next teaching day once the day is over', () => {
    const session = deriveTodaySession(monday(21));
    expect(session.state).toBe('tomorrow');
    expect(session.statusLabel).toBe('Done for today · next Tuesday');
  });

  it('says so when the day has no classes at all', () => {
    const session = deriveTodaySession(saturday(11));
    expect(session.state).toBe('tomorrow');
    expect(session.statusLabel).toMatch(/^No classes today · next /);
  });

  it('is exclusive at the end boundary — a class that just ended is not in session', () => {
    const session = deriveTodaySession(monday(10, 0));
    expect(session.state).not.toBe('inSession');
    expect(session.courseCode).toBe('HIST 287');
  });
});
