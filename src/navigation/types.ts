import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { CampusMapFilter } from '@/services/campus/buildingPresentation';

export type RootStackParamList = {
  Main: undefined;
  SessionDetail: undefined;
  Login: undefined;
};

/**
 * Search is not a tab — a header action button pushes it into the stack the
 * user is already in, so Home, Academic and Me each register the same two
 * screens. Declaring them once here is what keeps the copies identical (via
 * `searchScreens`); a title or option changed in one stack would otherwise
 * silently differ from the others.
 */
export type SearchRoutes = {
  Search: undefined;
  SearchCategory: { categoryKey: string };
};

/** The Me tab's own screens, kept separate so `MeStackParamList` reads as a sum. */
export type MeRoutes = {
  MeHome: undefined;
  Settings: undefined;
  Profile: undefined;
  Grades: undefined;
  Balance: undefined;
};

export type TodayStackParamList = SearchRoutes & {
  Today: undefined;
};

export type ScheduleStackParamList = {
  Schedule: undefined;
};

export type CampusStackParamList = {
  /**
   * Params are how Campus search hands its result back: a place hit selects
   * that building and flies the camera; a category chip sets the map filter
   * and puts its label in the field, which opens the results drawer. All are
   * cleared once applied so returning to the tab does not re-fire them.
   */
  CampusHome:
    | { focusBuildingId?: string; mapFilter?: CampusMapFilter; searchLabel?: string }
    | undefined;
  CampusSearch: undefined;
  ShuttleSchedule: undefined;
  ShuttleTracker: undefined;
  Events: undefined;
  ServicesSearch: undefined;
};

export type AcademicsStackParamList = SearchRoutes & {
  AcademicsHome: undefined;
  AcademicCalendar: undefined;
  Grades: undefined;
  /** The former Academic-tab root. No longer linked from the new home. */
  Library: undefined;
};

export type MeStackParamList = MeRoutes & SearchRoutes;

export type MainTabParamList = {
  Today: undefined;
  Schedule: undefined;
  Campus: undefined;
  Library: undefined;
  Me: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TodayStackScreenProps<T extends keyof TodayStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<TodayStackParamList, T>,
  MainTabScreenProps<'Today'>
>;

export type ScheduleStackScreenProps<T extends keyof ScheduleStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ScheduleStackParamList, T>,
    MainTabScreenProps<'Schedule'>
  >;

export type CampusStackScreenProps<T extends keyof CampusStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<CampusStackParamList, T>,
  MainTabScreenProps<'Campus'>
>;

export type AcademicsStackScreenProps<T extends keyof AcademicsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AcademicsStackParamList, T>,
    MainTabScreenProps<'Library'>
  >;

/**
 * Search screens render inside whichever tab stack pushed them, so they are
 * typed against the shared route map rather than one owning stack.
 */
export type SearchScreenProps<T extends keyof SearchRoutes> = CompositeScreenProps<
  NativeStackScreenProps<SearchRoutes, T>,
  MainTabScreenProps<keyof MainTabParamList>
>;

export type MeStackScreenProps<T extends keyof MeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MeStackParamList, T>,
  MainTabScreenProps<'Me'>
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
