import type { ScheduleDeliveryMode } from '@/components/feature/schedule/scheduleTypes';
import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { useAppearance, useTheme } from '@/design-system/theme';
import { msDirectionsBusFill } from '@material-symbols-react-native/rounded-400/msDirectionsBusFill';
import { msHomeFill } from '@material-symbols-react-native/rounded-400/msHomeFill';
import { msMeetingRoomFill } from '@material-symbols-react-native/rounded-400/msMeetingRoomFill';
import { msMenuBookFill } from '@material-symbols-react-native/rounded-400/msMenuBookFill';
import { msSchoolFill } from '@material-symbols-react-native/rounded-400/msSchoolFill';
import { msAssignment } from '@material-symbols-react-native/rounded-400/msAssignment';
import { msPayments } from '@material-symbols-react-native/rounded-400/msPayments';
import { msCalendarMonthFill } from '@material-symbols-react-native/rounded-400/msCalendarMonthFill';
import { msAccountBalanceWalletFill } from '@material-symbols-react-native/rounded-400/msAccountBalanceWalletFill';
import { msEventFill } from '@material-symbols-react-native/rounded-400/msEventFill';
import { msRestaurantFill } from '@material-symbols-react-native/rounded-400/msRestaurantFill';

/* eslint-disable @typescript-eslint/no-require-imports -- Metro static image assets */
export const sessionHeroImage = require('../../../../assets/today/session-hero.jpg') as ImageSourcePropType;
export const updateImage1 = require('../../../../assets/today/update-1.png') as ImageSourcePropType;
export const updateImage2 = require('../../../../assets/today/update-2.png') as ImageSourcePropType;
export const campusImage1 = require('../../../../assets/today/campus-1.png') as ImageSourcePropType;
export const campusImage2 = require('../../../../assets/today/campus-2.png') as ImageSourcePropType;

export type TodaySession = {
  courseCode: string;
  /** "Lecture", "Seminar" — absent on the no-classes state. */
  componentLabel?: string;
  /** Delivery mode from the timetable: in person, blended, online. */
  mode?: ScheduleDeliveryMode;
  title: string;
  statusLabel: string;
  /** Dot colour for the status pill — see `todaySession`'s tones. */
  statusTone: string;
  state: import('./todaySession').TodaySessionState;
  /** "Ends" while a class is running, "Starts" before it. */
  timeLabel: string;
  timeValue: string;
  room: string;
  professor: string;
  /** Faculty profile slug, when the instructor could be matched to one. */
  professorFpid?: string;
  /** Timetable row this was derived from, so the detail page can mark it. */
  eventId?: string;
  image: ImageSourcePropType;
};

export type PinnedChip = {
  id: string;
  label: string;
  icon: MsIconDefinition;
  iconColor: string;
  tab?: 'Library' | 'Campus' | 'Schedule';
  /** Opens the account experience (root modal), optionally at a nested screen. */
  account?: boolean;
  accountRoute?: 'Grades';
  campusRoute?: 'ShuttleSchedule';
};

export type AttentionItem = {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  icon: MsIconDefinition;
};

export type UpdateItem = {
  id: string;
  badge: string;
  eyebrow: string;
  title: string;
  image: ImageSourcePropType;
};

/** Filter scopes on the Campus Events screen. */
export type CampusEventCategory =
  | 'career'
  | 'food'
  | 'wellness'
  | 'arts'
  | 'academic';

export type CampusTodayItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  image: ImageSourcePropType;
  category: CampusEventCategory;
  /**
   * Days from today this event falls on (0 = today). Mock-only until a real
   * events calendar feeds dates.
   */
  dayOffset: number;
};

export const CAMPUS_EVENT_FILTERS: { id: CampusEventCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'career', label: 'Career' },
  { id: 'food', label: 'Food' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'arts', label: 'Arts' },
  { id: 'academic', label: 'Academic' },
];

type PinnedChipBase = Omit<PinnedChip, 'iconColor'>;

const PINNED_CHIPS_BASE: PinnedChipBase[] = [
  { id: 'moodle', label: 'Moodle', icon: msHomeFill },
  { id: 'library', label: 'Library', icon: msMenuBookFill, tab: 'Library' },
  { id: 'grades', label: 'Grades', icon: msSchoolFill, account: true, accountRoute: 'Grades' },
  { id: 'room', label: 'Room booking', icon: msMeetingRoomFill },
  {
    id: 'shuttle',
    label: 'Shuttle',
    icon: msDirectionsBusFill,
    tab: 'Campus',
    campusRoute: 'ShuttleSchedule',
  },
];

/** Full set of pin-able shortcuts shown in the Add drawer. */
const PINNED_CHIP_CATALOG_EXTRA_BASE: PinnedChipBase[] = [
  { id: 'schedule', label: 'Schedule', icon: msCalendarMonthFill, tab: 'Schedule' },
  { id: 'wallet', label: 'Wallet', icon: msAccountBalanceWalletFill, account: true },
  { id: 'events', label: 'Events', icon: msEventFill, tab: 'Campus' },
  { id: 'dining', label: 'Dining', icon: msRestaurantFill, tab: 'Campus' },
];

/**
 * Per-shortcut icon tints. `library` isn't here — it's the app's own brand
 * color, so the hook below points it at `theme.color.primary` instead of a
 * fifth independent hardcode of Concordia burgundy.
 */
const ICON_COLOR_LIGHT: Record<string, string> = {
  moodle: '#7B2D8E',
  grades: '#C9A859',
  room: '#057D78',
  shuttle: '#0072A8',
  schedule: '#DA3A16',
  wallet: '#573996',
  events: '#057D78',
  dining: '#E5A712',
};

/** First-draft dark tints — flagged for visual QA. */
const ICON_COLOR_DARK: Record<string, string> = {
  moodle: '#A374B0',
  grades: '#D9BE85',
  room: '#3FA39E',
  shuttle: '#4A9BC9',
  schedule: '#E2694B',
  wallet: '#8067AE',
  events: '#3FA39E',
  dining: '#EBC24A',
};

export function usePinnedChipCatalog(): { chips: PinnedChip[]; catalog: PinnedChip[] } {
  const theme = useTheme();
  const { scheme } = useAppearance();

  return useMemo(() => {
    const colors = scheme === 'dark' ? ICON_COLOR_DARK : ICON_COLOR_LIGHT;
    const withColor = (base: PinnedChipBase): PinnedChip => ({
      ...base,
      iconColor: base.id === 'library' ? theme.color.primary : colors[base.id],
    });
    return {
      chips: PINNED_CHIPS_BASE.map(withColor),
      catalog: [...PINNED_CHIPS_BASE, ...PINNED_CHIP_CATALOG_EXTRA_BASE].map(withColor),
    };
  }, [scheme, theme.color.primary]);
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'fees',
    title: 'Summer fees',
    subtitle: 'Due today',
    actionLabel: 'Pay',
    icon: msPayments,
  },
  {
    id: 'essay',
    title: 'Essay 2',
    subtitle: 'Due tonight',
    actionLabel: 'Open',
    icon: msAssignment,
  },
];

export const LATEST_UPDATES: UpdateItem[] = [
  {
    id: '1',
    badge: 'Career',
    eyebrow: 'Announcement',
    title: 'Fall course registration opens tomorrow at 9 AM',
    image: updateImage1,
  },
  {
    id: '2',
    badge: 'Campus',
    eyebrow: 'Announcement',
    title: 'Library extended hours start next week',
    image: updateImage2,
  },
  {
    id: '3',
    badge: 'Student life',
    eyebrow: 'Announcement',
    title: 'Orientation week schedule is now available',
    image: updateImage1,
  },
];

export const CAMPUS_TODAY: CampusTodayItem[] = [
  {
    id: '1',
    title: 'Spring Career Fair',
    location: 'EV Building',
    time: '11 AM–4 PM',
    image: campusImage1,
    category: 'career',
    dayOffset: 0,
  },
  {
    id: '2',
    title: 'Free coffee at the Hive',
    location: 'EV Building',
    time: '11 AM–4 PM',
    image: campusImage2,
    category: 'food',
    dayOffset: 0,
  },
  {
    id: '3',
    title: 'Wellness Wednesdays',
    location: 'SGW Hall Building',
    time: '12–2 PM',
    image: campusImage1,
    category: 'wellness',
    dayOffset: 0,
  },
  {
    id: '4',
    title: 'Open mic at the Hive',
    location: 'Loyola Campus Centre',
    time: '5–7 PM',
    image: campusImage2,
    category: 'arts',
    dayOffset: 1,
  },
  {
    id: '5',
    title: 'Research poster session',
    location: 'LB Building',
    time: '1–3 PM',
    image: campusImage1,
    category: 'academic',
    dayOffset: 1,
  },
  {
    id: '6',
    title: 'Alumni networking mixer',
    location: 'MB Building',
    time: '5–7 PM',
    image: campusImage2,
    category: 'career',
    dayOffset: 2,
  },
  {
    id: '7',
    title: 'Yoga on the Quad',
    location: 'Loyola Quad',
    time: '8–9 AM',
    image: campusImage1,
    category: 'wellness',
    dayOffset: 3,
  },
  {
    id: '8',
    title: 'Student film screening',
    location: 'VA Cinema',
    time: '6–8 PM',
    image: campusImage2,
    category: 'arts',
    dayOffset: 4,
  },
];
