import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msHome,
  msHomeFill,
  msCalendarMonth,
  msCalendarMonthFill,
  msCalendarToday,
  msMap,
  msMapFill,
  msPerson,
  msSchool,
  msSchoolFill,
  msAccountCircle,
  msAccountCircleFill,
  msAccountBalanceWallet,
  msSchedule,
  msDirectionsBus,
  msEvent,
  msSearch,
  msChevronRight,
  msWbSunny,
  msDocumentScanner,
  msMeetingRoom,
  msBookmarks,
  msSecurity,
  msLocationOn,
} from '@material-symbols-react-native/outlined-400';

export type TabSymbolPair = {
  outline: MsIconDefinition;
  filled: MsIconDefinition;
};

export const tabSymbols = {
  today: { outline: msHome, filled: msHomeFill },
  /** Figma Tab Navigation uses calendar_month for Schedule. */
  schedule: { outline: msCalendarMonth, filled: msCalendarMonthFill },
  campus: { outline: msMap, filled: msMapFill },
  /** Figma Tab Navigation uses school for the fourth tab (Library). */
  library: { outline: msSchool, filled: msSchoolFill },
  me: { outline: msAccountCircle, filled: msAccountCircleFill },
} as const satisfies Record<string, TabSymbolPair>;

export type FeatureSymbolKey =
  | 'calendar'
  | 'school'
  | 'wallet'
  | 'schedule'
  | 'bus'
  | 'event'
  | 'search'
  | 'person';

export const featureSymbols: Record<FeatureSymbolKey, MsIconDefinition> = {
  calendar: msCalendarToday,
  school: msSchool,
  wallet: msAccountBalanceWallet,
  schedule: msSchedule,
  bus: msDirectionsBus,
  event: msEvent,
  search: msSearch,
  person: msPerson,
};

export {
  msChevronRight,
  msWbSunny,
  msPerson,
  msDocumentScanner,
  msMeetingRoom,
  msBookmarks,
  msSecurity,
  msSearch,
  msLocationOn,
};
