import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msHome,
  msHomeFill,
  msCalendarToday,
  msCalendarTodayFill,
  msMap,
  msMapFill,
  msMenuBook,
  msMenuBookFill,
  msPerson,
  msPersonFill,
  msSchool,
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
} from '@material-symbols-react-native/outlined-400';

export type TabSymbolPair = {
  outline: MsIconDefinition;
  filled: MsIconDefinition;
};

export const tabSymbols = {
  today: { outline: msHome, filled: msHomeFill },
  schedule: { outline: msCalendarToday, filled: msCalendarTodayFill },
  campus: { outline: msMap, filled: msMapFill },
  library: { outline: msMenuBook, filled: msMenuBookFill },
  me: { outline: msPerson, filled: msPersonFill },
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
};
