export type StudentProfile = {
  displayName: string;
  program: string;
  studentId: string;
  yearLabel: string;
  advisor: string;
  academicYear: string;
};

export type DegreeProgressSegment = {
  id: string;
  label: string;
  credits: number;
  color: string;
};

export type DegreeProgress = {
  earnedCredits: number;
  totalCredits: number;
  segments: DegreeProgressSegment[];
};

export type AccountBalanceSummary = {
  mealPlanAmount: number;
  mealPlanSubtitle: string;
  bearBucksAmount: number;
  bearBucksSubtitle: string;
};

export type SettingsRow = {
  id: string;
  label: string;
  value?: string;
  route?: 'Grades' | 'Balance' | 'Profile';
};
