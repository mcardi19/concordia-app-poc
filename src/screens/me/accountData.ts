import type {
  AccountBalanceSummary,
  DegreeProgress,
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
  { id: 'appearance', label: 'Appearance', value: 'Auto' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'privacy', label: 'Privacy & data' },
];

export function profileFromAuthUser(user: AuthUser): StudentProfile {
  if (!user) return defaultStudentProfile;
  return {
    ...defaultStudentProfile,
    displayName: user.name?.toUpperCase() ?? defaultStudentProfile.displayName,
    studentId: user.id.replace(/\D/g, '').slice(0, 9) || defaultStudentProfile.studentId,
  };
}
