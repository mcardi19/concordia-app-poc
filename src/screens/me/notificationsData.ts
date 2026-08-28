import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msCalendarMonth,
  msMenuBook,
  msPayments,
  msSchool,
  msScheduleClock,
  msWorkspacePremium,
} from '@/components/icons';

/** Which filter chip a notification answers to. */
export type NotificationCategory = 'academic' | 'campus' | 'library' | 'money' | 'system';

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  icon: MsIconDefinition;
  title: string;
  body: string;
  /** Clock time for today, weekday for older entries. */
  time: string;
  unread?: boolean;
  /** Inline call to action on the one item that can be acted on here. */
  action?: string;
};

export type NotificationGroup = {
  id: string;
  label: string;
  items: NotificationItem[];
};

/**
 * The inbox, grouped by recency rather than by category — the chips do
 * category, and a student opening this is asking "what did I miss", which is
 * a time question.
 */
export const notificationGroups: NotificationGroup[] = [
  {
    id: 'today',
    label: 'Today',
    items: [
      {
        id: 'fees',
        category: 'money',
        icon: msPayments,
        title: 'Payment plan reminder',
        body: 'Your summer fees of $2,184 are due in 21 days. Set up a payment plan in two taps.',
        time: '11:24 AM',
        unread: true,
        action: 'Set up plan',
      },
      {
        id: 'room-change',
        category: 'academic',
        icon: msCalendarMonth,
        title: 'ENGL 369 — Room change',
        body: 'Today’s 2:30 PM lecture moves from LB-625 to LB-641. Prof. Ashwell.',
        time: '9:08 AM',
        unread: true,
      },
      {
        id: 'shuttle',
        category: 'campus',
        icon: msScheduleClock,
        title: 'Shuttle delayed',
        body: '11:36 AM departure from SGW is delayed ~12 min. Next on time: 12:06.',
        time: '8:52 AM',
      },
    ],
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    items: [
      {
        id: 'grade',
        category: 'academic',
        icon: msWorkspacePremium,
        title: 'Grade posted — HIST 210',
        body: 'Midterm essay returned. You received an A on “Quebec since Confederation.”',
        time: '4:12 PM',
      },
      {
        id: 'library-due',
        category: 'library',
        icon: msMenuBook,
        title: '“The Waves” due in 2 days',
        body: 'Renew now to avoid a late fee. 0 holds on this title.',
        time: '7:00 AM',
      },
    ],
  },
  {
    id: 'earlier',
    label: 'Earlier this week',
    items: [
      {
        id: 'concert',
        category: 'campus',
        icon: msCalendarMonth,
        title: 'Chamber Ensemble tonight',
        body: 'Shostakovich & Pärt at D.B. Clarke Theatre, 7:30 PM. Free with student ID.',
        time: 'Wed',
      },
      {
        id: 'library-hours',
        category: 'system',
        icon: msSchool,
        title: 'New: Library extended hours',
        body: 'Webster is now 24/7 through May 3 for exam season.',
        time: 'Tue',
      },
    ],
  },
];

/** Human label for a category, used as the detail screen's overline. */
export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  academic: 'Academic',
  campus: 'Campus',
  library: 'Library',
  money: 'Money',
  system: 'System',
};

/** One notification by id, or undefined if the id is not in the feed. */
export function findNotification(id: string): NotificationItem | undefined {
  for (const group of notificationGroups) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

/** The recency group an id falls in ("Today"), for the detail screen's meta. */
export function notificationGroupLabel(id: string): string | undefined {
  return notificationGroups.find((group) => group.items.some((item) => item.id === id))?.label;
}

export type NotificationFilter = 'all' | 'unread' | NotificationCategory;

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'academic', label: 'Academic' },
  { id: 'campus', label: 'Campus' },
  { id: 'library', label: 'Library' },
];

/** Groups with their items filtered; empty groups drop out entirely. */
export function filterNotificationGroups(
  groups: NotificationGroup[],
  filter: NotificationFilter,
  readIds: ReadonlySet<string>,
): NotificationGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'unread') return isUnread(item, readIds);
        return item.category === filter;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

/** Seeded from the data, then narrowed as the student marks things read. */
export function isUnread(item: NotificationItem, readIds: ReadonlySet<string>): boolean {
  return Boolean(item.unread) && !readIds.has(item.id);
}

/** Chip counts — only "All" and "Unread" carry one, as in the design. */
export function notificationFilterCount(
  groups: NotificationGroup[],
  filter: NotificationFilter,
  readIds: ReadonlySet<string>,
): number | undefined {
  const all = groups.flatMap((group) => group.items);
  if (filter === 'all') return all.length;
  if (filter === 'unread') return all.filter((item) => isUnread(item, readIds)).length;
  return undefined;
}
