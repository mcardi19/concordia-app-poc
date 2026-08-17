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

/**
 * The published Fall 2024 run, ported from the legacy app's
 * shuttle-bus-next-departures.
 *
 * The two directions are genuinely different timetables — a bus leaving
 * Loyola is not the same bus leaving SGW, and the runs differ in both count
 * and minutes. The placeholder this replaces had the two directions identical
 * and Friday identical to Mon–Thu, which made the direction toggle appear to
 * do nothing.
 */
export const DEFAULT_SHUTTLE_TIMES: ShuttleTimes = {
  monThu: {
    loy: [
      '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00',
      '11:15', '11:30', '11:45', '12:30', '12:45', '13:00', '13:15', '13:30',
      '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30',
      '15:45', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00',
      '18:15', '18:30',
    ],
    sgw: [
      '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15',
      '11:30', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
      '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '16:00',
      '16:15', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15',
      '18:30',
    ],
  },
  fri: {
    loy: [
      '09:15', '09:30', '09:45', '10:15', '10:45', '11:00', '11:15', '12:00',
      '12:15', '12:45', '13:00', '13:15', '13:45', '14:15', '14:30', '14:45',
      '15:15', '15:30', '15:45', '16:45', '17:15', '17:45', '18:15',
    ],
    sgw: [
      '09:45', '10:00', '10:15', '10:45', '11:15', '11:30', '12:15', '12:30',
      '12:45', '13:15', '13:45', '14:00', '14:15', '14:45', '15:00', '15:15',
      '15:45', '16:00', '16:45', '17:15', '17:45', '18:15',
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
