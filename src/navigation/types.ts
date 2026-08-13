import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
  SessionDetail: undefined;
  Login: undefined;
};

/**
 * Me is no longer a tab — Home's header profile button pushes it into the
 * Today stack. Kept as its own map so another tab can register the same five
 * screens (via `meScreens`) if the profile action returns elsewhere.
 */
export type MeRoutes = {
  MeHome: undefined;
  Settings: undefined;
  Profile: undefined;
  Grades: undefined;
  Balance: undefined;
};

export type TodayStackParamList = MeRoutes & {
  Today: undefined;
};

export type ScheduleStackParamList = {
  Schedule: undefined;
};

export type CampusStackParamList = {
  CampusHome: undefined;
  ShuttleSchedule: undefined;
  ShuttleTracker: undefined;
  Events: undefined;
  ServicesSearch: undefined;
};

export type LibraryStackParamList = {
  Library: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Schedule: undefined;
  Campus: undefined;
  Library: undefined;
  Search: undefined;
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

export type LibraryStackScreenProps<T extends keyof LibraryStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, T>,
  MainTabScreenProps<'Library'>
>;

export type SearchStackScreenProps<T extends keyof SearchStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, T>,
  MainTabScreenProps<'Search'>
>;

/**
 * Me screens render inside whichever tab stack pushed them, so they are typed
 * against the shared route map rather than one owning stack.
 */
export type MeStackScreenProps<T extends keyof MeRoutes> = CompositeScreenProps<
  NativeStackScreenProps<MeRoutes, T>,
  MainTabScreenProps<keyof MainTabParamList>
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
