import type { ScheduleAllDayItem } from '@/components/feature/schedule';
import {
  ACADEMIC_CATEGORY_LABEL,
  academicDatesOn,
  type AcademicDateEntry,
} from '@/services/academic';

/** One academic date as the schedule's all-day view model. */
export function toAllDayItem(entry: AcademicDateEntry): ScheduleAllDayItem {
  return {
    id: entry.id,
    kind: ACADEMIC_CATEGORY_LABEL[entry.category],
    title: entry.title,
    detail: entry.detail,
    priority: entry.priority,
  };
}

/** Academic dates in force on `date`, already ordered for the stack. */
export function allDayItemsFor(date: Date): ScheduleAllDayItem[] {
  return academicDatesOn(date).map(toAllDayItem);
}

/**
 * Drawn at zero opacity on days with no academic dates, purely to hold the
 * slot's height. Without it the hour rail jumps as you page between a day
 * that has entries and one that does not.
 */
export const PLACEHOLDER_ALL_DAY: ScheduleAllDayItem[] = [
  { id: 'placeholder', kind: 'Placeholder', title: 'No academic dates' },
];
