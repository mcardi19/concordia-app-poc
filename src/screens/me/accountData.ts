import type {
  AccountBalanceSummary,
  DegreeProgress,
  MeAccountTile,
  MeCommunity,
  MeFavouriteService,
  MeProfileStat,
  MeStatusCard,
  SettingsRow,
  StudentProfile,
} from '@/types/profile';
import type { AuthUser } from '@/state/authStore';

export const defaultStudentProfile: StudentProfile = {
  displayName: 'MAYA R. OKONKWO',
  program: 'B.A. English, Honours',
  studentId: '401872231',
  yearLabel: "3rd · Class of '27",
  advisor: 'Prof. I. Ashwell',
  academicYear: '2025–26',
};

export const defaultDegreeProgress: DegreeProgress = {
  earnedCredits: 78,
  totalCredits: 120,
  segments: [
    { id: 'major', label: 'Major', credits: 46, color: '#912338' },
    { id: 'minor', label: 'Minor', credits: 17, color: '#7B1E30' },
    { id: 'core', label: 'Core', credits: 15, color: '#D4A5B5' },
    { id: 'open', label: 'Open', credits: 42, color: '#E8E2D6' },
  ],
};

export const defaultBalanceSummary: AccountBalanceSummary = {
  mealPlanAmount: 184,
  mealPlanSubtitle: '~$6.80/day',
  bearBucksAmount: 42,
  bearBucksSubtitle: 'Refill at any kiosk',
};

export const accountSettingsRows: SettingsRow[] = [
  { id: 'notifications', label: 'Notifications', value: 'On' },
  { id: 'appearance', label: 'Appearance', route: 'Appearance' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'privacy', label: 'Privacy & data' },
];

/** Unread notification count for the Me tab badge and profile chrome. */
export const meNotificationCount = 3;

/** Hero metadata row, sourced from the student record in a real build. */
export const meProfileStats: MeProfileStat[] = [
  { id: 'since', label: 'Student since', value: '2023' },
  { id: 'credits', label: 'Credits earned', value: '78' },
  { id: 'standing', label: 'Standing', value: "Dean's List" },
];

/**
 * Headline cards. The design defines a third ("Academic") card but filters it
 * out of Iteration M, leaving a two-up grid — kept out here for the same reason.
 */
export const meStatusCards: MeStatusCard[] = [
  {
    id: 'finances',
    label: 'Finances',
    stat: '$2,184',
    subtitle: 'Due Jun 15',
    route: 'Balance',
  },
  {
    id: 'library',
    label: 'Library',
    stat: '3 on loan',
    subtitle: '1 due tomorrow',
  },
];

export const meAccountTiles: MeAccountTile[] = [
  { id: 'meal', label: 'Meal plan', value: '$184', icon: 'mealPlan', route: 'Balance' },
  { id: 'dprint', label: 'Dprint', value: '$3.40', icon: 'print' },
  { id: 'parking', label: 'Parking permit', value: 'Active', icon: 'parking' },
  { id: 'locker', label: 'Locker', value: 'B-214', icon: 'locker' },
];

export const meCommunities: MeCommunity[] = [
  {
    id: 'esa',
    name: "CSU English Students' Assoc.",
    subtitle: 'Departmental student association',
    monogram: 'ES',
    tint: '#5A7A6A',
  },
  {
    id: 'debate',
    name: 'Debate Society',
    subtitle: 'Weekly meets · Hall Building',
    monogram: 'DS',
    tint: '#7A6A5A',
  },
  {
    id: 'photo',
    name: 'Photography Collective',
    subtitle: 'Student club · Open studio Thursdays',
    monogram: 'PC',
    tint: '#6A5A7A',
  },
  {
    id: 'csu',
    name: 'CSU',
    subtitle: 'Concordia Student Union',
    monogram: 'CS',
    tint: '#5A6A7A',
  },
  {
    id: 'rec',
    name: 'Rec & Athletics',
    subtitle: 'Membership · Gym & pool access',
    monogram: 'RA',
    tint: '#7A5A5A',
  },
];

export const meFavouriteServices: MeFavouriteService[] = [
  {
    id: 'health',
    name: 'Health & Wellness',
    subtitle: 'Book appointments, view records',
    monogram: 'HW',
  },
  {
    id: 'library',
    name: 'Webster Library',
    subtitle: 'Loans, holds & study rooms',
    monogram: 'LB',
  },
  {
    id: 'dining',
    name: 'Food & Dining',
    subtitle: 'Meal plan balance & campus menus',
    monogram: 'FD',
  },
];

export function profileFromAuthUser(user: AuthUser): StudentProfile {
  if (!user) return defaultStudentProfile;
  return {
    ...defaultStudentProfile,
    displayName: user.name?.toUpperCase() ?? defaultStudentProfile.displayName,
    studentId: user.id.replace(/\D/g, '').slice(0, 9) || defaultStudentProfile.studentId,
  };
}
