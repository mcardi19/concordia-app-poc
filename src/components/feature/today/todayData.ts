import type { ImageSourcePropType } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
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
  image: ImageSourcePropType;
};

export type PinnedChip = {
  id: string;
  label: string;
  icon: MsIconDefinition;
  iconColor: string;
  tab?: 'Library' | 'Campus' | 'Me' | 'Schedule';
  meRoute?: 'Grades';
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

export type CampusTodayItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  image: ImageSourcePropType;
};

export const PINNED_CHIPS: PinnedChip[] = [
  { id: 'moodle', label: 'Moodle', icon: msHomeFill, iconColor: '#7B2D8E' },
  { id: 'library', label: 'Library', icon: msMenuBookFill, iconColor: '#912338', tab: 'Library' },
  { id: 'grades', label: 'Grades', icon: msSchoolFill, iconColor: '#C9A859', tab: 'Me', meRoute: 'Grades' },
  { id: 'room', label: 'Room booking', icon: msMeetingRoomFill, iconColor: '#057D78' },
  {
    id: 'shuttle',
    label: 'Shuttle',
    icon: msDirectionsBusFill,
    iconColor: '#0072A8',
    tab: 'Campus',
    campusRoute: 'ShuttleSchedule',
  },
];

/** Full set of pin-able shortcuts shown in the Add drawer. */
export const PINNED_CHIP_CATALOG: PinnedChip[] = [
  ...PINNED_CHIPS,
  { id: 'schedule', label: 'Schedule', icon: msCalendarMonthFill, iconColor: '#DA3A16', tab: 'Schedule' },
  { id: 'wallet', label: 'Wallet', icon: msAccountBalanceWalletFill, iconColor: '#573996', tab: 'Me' },
  { id: 'events', label: 'Events', icon: msEventFill, iconColor: '#057D78', tab: 'Campus' },
  { id: 'dining', label: 'Dining', icon: msRestaurantFill, iconColor: '#E5A712', tab: 'Campus' },
];

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
  },
  {
    id: '2',
    title: 'Free coffee at the Hive',
    location: 'EV Building',
    time: '11 AM–4 PM',
    image: campusImage2,
  },
  {
    id: '3',
    title: 'Wellness Wednesdays',
    location: 'SGW Hall Building',
    time: '12–2 PM',
    image: campusImage1,
  },
  {
    id: '4',
    title: 'Open mic at the Hive',
    location: 'Loyola Campus Centre',
    time: '5–7 PM',
    image: campusImage2,
  },
];
