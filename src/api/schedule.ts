import type { ScheduleResponse } from '@/types/sis';
import { assertSisAuth, parseSisJson } from '@/utils/parseSisResponse';
import { sisGetWithParam } from './sisClient';

export async function fetchSchedule(weekMondayYmd: string, fresh = false): Promise<ScheduleResponse> {
  const raw = await sisGetWithParam<unknown>('Schedule', weekMondayYmd, fresh);
  const data = assertSisAuth(parseSisJson<ScheduleResponse>(raw));
  return data;
}

export function formatWeekMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function shiftWeekMonday(ymd: string, weeks: number): string {
  const y = Number(ymd.slice(0, 4));
  const m = Number(ymd.slice(4, 6)) - 1;
  const d = Number(ymd.slice(6, 8));
  const date = new Date(y, m, d);
  date.setDate(date.getDate() + weeks * 7);
  return formatWeekMonday(date);
}
