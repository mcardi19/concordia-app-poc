/**
 * Shuttle timetable data ported from mobile-app-main shuttle-bus-next-departures.
 * Update seasonally when Concordia publishes new times.
 */

export type ShuttleWeekdayKey = 'monThu' | 'fri';

export type ShuttleTimes = Record<
  ShuttleWeekdayKey,
  { loy: string[]; sgw: string[] }
> & {
  monThuGap?: { loy: string[]; sgw: string[] };
  friGap?: { loy: string[]; sgw: string[] };
};

/** Default schedule (fallback / late summer pattern from legacy app). */
export const DEFAULT_SHUTTLE_TIMES: ShuttleTimes = {
  monThu: {
    loy: [
      '09:30', '10:00', '10:30', '11:00', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:30', '17:00', '17:30', '18:00', '18:30',
    ],
    sgw: [
      '09:30', '10:00', '10:30', '11:00', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:30', '17:00', '17:30', '18:00', '18:30',
    ],
  },
  fri: {
    loy: [
      '09:30', '10:00', '10:30', '11:00', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:30', '17:00', '17:30', '18:00', '18:30',
    ],
    sgw: [
      '09:30', '10:00', '10:30', '11:00', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:30', '17:00', '17:30', '18:00', '18:30',
    ],
  },
  monThuGap: { loy: [], sgw: [] },
  friGap: { loy: [], sgw: [] },
};

export const SHUTTLE_HOLIDAYS = [
  '2024-05-20',
  '2024-06-24',
  '2024-07-01',
  '2024-09-02',
  '2024-10-14',
  '2024-12-24',
  '2024-12-25',
  '2024-12-26',
  '2024-12-27',
  '2024-12-30',
  '2024-12-31',
  '2025-01-01',
  '2025-01-02',
  '2025-01-03',
];
