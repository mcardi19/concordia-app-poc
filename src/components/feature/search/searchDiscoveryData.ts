import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msBalance,
  msBed,
  msFavorite,
  msGroups,
  msMap,
  msMenuBook,
  msPayments,
  msSupportAgent,
  msWork,
  msWorkspacePremium,
} from '@/components/icons';

/**
 * Search's zero state is a browsable service directory, not an empty box —
 * the design's thesis is that a student who does not know what a service is
 * called can still find it by browsing or by describing the need.
 */
export type ServiceCategory = {
  key: string;
  label: string;
  /** Two or three example services, shown under the label. */
  blurb: string;
  icon: MsIconDefinition;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: 'essentials', label: 'CU Essentials', blurb: 'Moodle · Tuition · ID card', icon: msWorkspacePremium },
  { key: 'study', label: 'Study help & tutoring', blurb: 'Tutoring · Writing help · Study rooms', icon: msMenuBook },
  { key: 'advising', label: 'Advising & guidance', blurb: 'Academic · Career · International', icon: msSupportAgent },
  { key: 'advocacy', label: 'Advocacy', blurb: 'Ombuds · Student rights · Legal info', icon: msBalance },
  { key: 'books', label: 'Books & tech', blurb: 'Library · Laptop loans · Printing', icon: msMenuBook },
  { key: 'campus', label: 'Campus', blurb: 'Maps · Shuttle · Building hours', icon: msMap },
  { key: 'community', label: 'Community & extra-curricular', blurb: 'Clubs · Events · Volunteering', icon: msGroups },
  { key: 'finances', label: 'Finances & budgeting', blurb: 'Bursaries · Aid · Fee deadlines', icon: msPayments },
  { key: 'food', label: 'Food & housing', blurb: 'Residence · Meal plans · Food bank', icon: msBed },
  { key: 'wellbeing', label: 'Health & wellbeing', blurb: 'Counselling · Clinic · Peer support', icon: msFavorite },
  { key: 'jobs', label: 'Jobs, careers & skill building', blurb: 'Co-op · Job board · Workshops', icon: msWork },
];

/** Category rows per page in the browse carousel. */
export const CATEGORY_PAGE_SIZE = 3;

/** One-tap jobs, ahead of any typing. */
export const QUICK_TASKS = [
  'Pay tuition',
  'Book a study room',
  'Renew a book',
  'Shuttle times',
  'Find counselling',
  'Report lost item',
];

/** Plain-language entry points for students who cannot name the service. */
export type SearchNeed = {
  question: string;
  destination: string;
  /** Seeds the query when tapped, so the need lands in the same result list. */
  query: string;
  icon: MsIconDefinition;
};

export const SEARCH_NEEDS: SearchNeed[] = [
  {
    question: 'Feeling overwhelmed?',
    destination: 'Counselling & wellbeing',
    query: 'counselling',
    icon: msFavorite,
  },
  {
    question: 'Need money help?',
    destination: 'Financial aid & awards',
    query: 'financial aid',
    icon: msPayments,
  },
  {
    question: 'Need a quiet place to study?',
    destination: 'Study spaces near you',
    query: 'study space',
    icon: msMenuBook,
  },
];

/** Offered when a query returns nothing. */
export const FALLBACK_SUGGESTIONS = [
  'Off-campus housing',
  'Residence',
  'Meal plans',
  'Food bank',
];
