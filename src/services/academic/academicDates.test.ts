import {
  ACADEMIC_DATES,
  academicTermStatus,
  academicDatesOn,
  academicDayKey,
  relatedAcademicDates,
  upcomingAcademicDates,
} from './index';
import { ACADEMIC_CATEGORY_PRIORITY } from './academicDateTypes';
import { RAW_ACADEMIC_DATES } from './academicDatesData';

const day = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

describe('academic dates dataset', () => {
  it('keeps every row from the source page', () => {
    expect(ACADEMIC_DATES).toHaveLength(RAW_ACADEMIC_DATES.length);
  });

  it('gives every entry a unique id', () => {
    const ids = new Set(ACADEMIC_DATES.map((e) => e.id));
    expect(ids.size).toBe(ACADEMIC_DATES.length);
  });

  it('stores real dates, with spans that run forwards', () => {
    for (const entry of ACADEMIC_DATES) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
      if (entry.endDate) {
        expect(entry.endDate > entry.date).toBe(true);
      }
    }
  });

  it('sorts chronologically, then by priority within a day', () => {
    for (let i = 1; i < ACADEMIC_DATES.length; i += 1) {
      const prev = ACADEMIC_DATES[i - 1];
      const curr = ACADEMIC_DATES[i];
      if (prev.date === curr.date) {
        expect(prev.priority).toBeGreaterThanOrEqual(curr.priority);
      } else {
        expect(prev.date < curr.date).toBe(true);
      }
    }
  });

  it('resolves a priority for every entry, from the category by default', () => {
    for (const entry of ACADEMIC_DATES) {
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.priority).toBeLessThanOrEqual(100);
    }
    const labourDay = ACADEMIC_DATES.find((e) => e.title === 'Labour Day');
    expect(labourDay?.priority).toBe(ACADEMIC_CATEGORY_PRIORITY.closure);
  });

  it('derives the term from the date', () => {
    expect(ACADEMIC_DATES.find((e) => e.date === '2026-09-08')?.term).toBe('fall-2026');
    expect(ACADEMIC_DATES.find((e) => e.date === '2027-01-11')?.term).toBe('winter-2027');
    // Winter's exam period is printed under "Summer Term 2027" on the page.
    expect(ACADEMIC_DATES.find((e) => e.date === '2027-04-15')?.term).toBe('winter-2027');
  });
});

describe('academicDatesOn', () => {
  it('finds a single-day entry', () => {
    const found = academicDatesOn(day('2026-09-07'));
    expect(found.map((e) => e.title)).toEqual(['Labour Day']);
  });

  it('finds a span from inside it, not just on its endpoints', () => {
    const midweek = academicDatesOn(day('2026-10-14')).map((e) => e.title);
    expect(midweek).toContain('Reading week');
  });

  it('leads a stacked day with the highest-priority entry', () => {
    const stack = academicDatesOn(day('2026-09-21'));
    expect(stack).toHaveLength(2);
    // The refund deadline outranks the add deadline it shares the day with.
    expect(stack[0].title).toBe('Withdrawal with tuition refund (DNE)');
  });

  it('puts a closure above a reading week it falls inside', () => {
    const stack = academicDatesOn(day('2026-10-12'));
    expect(stack[0].title).toBe('Thanksgiving Day');
    expect(stack.map((e) => e.title)).toContain('Reading week');
  });

  it('returns nothing on a day with no academic dates', () => {
    expect(academicDatesOn(day('2026-09-09'))).toEqual([]);
  });

  it('spans a year boundary', () => {
    expect(academicDatesOn(day('2027-01-04')).map((e) => e.title)).toEqual(['Holiday period']);
  });
});

describe('helpers', () => {
  it('keys a local date without shifting time zone', () => {
    expect(academicDayKey(new Date(2026, 11, 24))).toBe('2026-12-24');
  });

  it('lists upcoming dates from a given day', () => {
    const next = upcomingAcademicDates(day('2026-09-09'), 2);
    expect(next.map((e) => e.date)).toEqual(['2026-09-14', '2026-09-15']);
  });

  it('relates an entry to its nearest neighbours, never itself', () => {
    const entry = ACADEMIC_DATES.find((e) => e.date === '2026-09-07')!;
    const related = relatedAcademicDates(entry, 3);
    expect(related).toHaveLength(3);
    expect(related.map((e) => e.id)).not.toContain(entry.id);
  });
});

describe('academicTermStatus', () => {
  it('names the term and counts the week from the data', () => {
    const status = academicTermStatus(day('2026-09-22'));
    expect(status.label).toBe('Fall 2026');
    // Classes begin Sep 8; Sep 22 is the third week.
    expect(status.week).toEqual({ current: 3, total: expect.any(Number) });
    expect(status.phase).toBe('Classes in session');
  });

  it('names a closure over the reading week it sits inside', () => {
    expect(academicTermStatus(day('2026-10-12')).phase).toBe('Thanksgiving Day');
    expect(academicTermStatus(day('2026-10-14')).phase).toBe('Reading week');
  });

  it('reports the examination period', () => {
    expect(academicTermStatus(day('2026-12-15')).phase).toBe('Examination period');
  });

  it('drops the week count outside the teaching weeks', () => {
    expect(academicTermStatus(day('2026-09-02')).week).toBeNull();
    expect(academicTermStatus(day('2026-09-02')).phase).toBe('Before classes begin');
  });
});
