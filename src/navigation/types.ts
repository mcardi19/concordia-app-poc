import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

export type TodayStackParamList = {
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

export type MeStackParamList = {
  MeHome: undefined;
  Settings: undefined;
  Profile: undefined;
  Grades: undefined;
  Balance: undefined;
};

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

export type LibraryStackScreenProps<T extends keyof LibraryStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, T>,
  MainTabScreenProps<'Library'>
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
