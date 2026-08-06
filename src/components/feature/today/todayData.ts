import type { ImageSourcePropType } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msDirectionsBus,
  msHome,
  msMeetingRoom,
  msMenuBook,
  msSchool,
  msAssignment,
  msPayments,
} from '@material-symbols-react-native/outlined-400';

/* eslint-disable @typescript-eslint/no-require-imports -- Metro static image assets */
export const sessionHeroImage = require('../../../../assets/today/session-hero.png') as ImageSourcePropType;
export const updateImage1 = require('../../../../assets/today/update-1.png') as ImageSourcePropType;
export const updateImage2 = require('../../../../assets/today/update-2.png') as ImageSourcePropType;
export const campusImage1 = require('../../../../assets/today/campus-1.png') as ImageSourcePropType;
export const campusImage2 = require('../../../../assets/today/campus-2.png') as ImageSourcePropType;

export type TodaySession = {
  courseCode: string;
  title: string;
  statusLabel: string;
  ends: string;
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
  meta: string;
  image: ImageSourcePropType;
};

export const TODAY_SESSION: TodaySession = {
  courseCode: 'CEBD 1251',
  title: 'Music and data exploration',
  statusLabel: 'In session · 48 min left',
  ends: '3:45 PM',
  room: 'LB-625',
  professor: 'I. Ashwell',
  image: sessionHeroImage,
};

export const PINNED_CHIPS: PinnedChip[] = [
  { id: 'moodle', label: 'Moodle', icon: msHome, iconColor: '#7B2D8E' },
  { id: 'library', label: 'Library', icon: msMenuBook, iconColor: '#912338', tab: 'Library' },
  { id: 'grades', label: 'Grades', icon: msSchool, iconColor: '#C9A859', tab: 'Me', meRoute: 'Grades' },
  { id: 'room', label: 'Room booking', icon: msMeetingRoom, iconColor: '#057D78' },
  {
    id: 'shuttle',
    label: 'Shuttle',
    icon: msDirectionsBus,
    iconColor: '#0072A8',
    tab: 'Campus',
    campusRoute: 'ShuttleSchedule',
  },
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
];

export const CAMPUS_TODAY: CampusTodayItem[] = [
  {
    id: '1',
    title: 'Spring Career Fair',
    meta: 'EV Building · 11 AM–4 PM',
    image: campusImage1,
  },
  {
    id: '2',
    title: 'Free coffee at the Hive',
    meta: 'EV Building · 11 AM–4 PM',
    image: campusImage2,
  },
];
