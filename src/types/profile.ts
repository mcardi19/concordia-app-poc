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

/** Where a Me-tab surface can send the user. Omit when nothing is built yet. */
export type MeDestination = 'Grades' | 'Balance' | 'Profile' | 'Settings';

/** Headline figure card in the Me hero stack (Finances, Library). */
export type MeStatusCard = {
  id: string;
  label: string;
  stat: string;
  subtitle: string;
  route?: MeDestination;
};

/** Small stored-value / entitlement tile under "My accounts". */
export type MeAccountTile = {
  id: string;
  label: string;
  value: string;
  icon: 'mealPlan' | 'print' | 'parking' | 'locker';
  route?: MeDestination;
};

/** A club or membership shown in the "Your communities" stack. */
export type MeCommunity = {
  id: string;
  name: string;
  subtitle: string;
  /** Two-letter monogram shown in the avatar stack. */
  monogram: string;
  /** Per-club avatar tint. */
  tint: string;
};

/** A saved service shown in the "Favourite services" stack. */
export type MeFavouriteService = {
  id: string;
  name: string;
  subtitle: string;
  monogram: string;
  route?: MeDestination;
};

/** Hero metadata pill (Student since / Credits earned / Standing). */
export type MeProfileStat = {
  id: string;
  label: string;
  value: string;
};
