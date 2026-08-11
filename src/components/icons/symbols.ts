import type { MsIconDefinition } from 'material-symbols-react-native';
import { msHome } from '@material-symbols-react-native/rounded-400/msHome';
import { msHomeFill } from '@material-symbols-react-native/rounded-400/msHomeFill';
import { msCalendarMonth } from '@material-symbols-react-native/rounded-400/msCalendarMonth';
import { msCalendarMonthFill } from '@material-symbols-react-native/rounded-400/msCalendarMonthFill';
import { msCalendarToday } from '@material-symbols-react-native/rounded-400/msCalendarToday';
import { msMap } from '@material-symbols-react-native/rounded-400/msMap';
import { msMapFill } from '@material-symbols-react-native/rounded-400/msMapFill';
import { msPerson } from '@material-symbols-react-native/rounded-400/msPerson';
import { msSchool } from '@material-symbols-react-native/rounded-400/msSchool';
import { msSchoolFill } from '@material-symbols-react-native/rounded-400/msSchoolFill';
import { msAccountCircle } from '@material-symbols-react-native/rounded-400/msAccountCircle';
import { msAccountCircleFill } from '@material-symbols-react-native/rounded-400/msAccountCircleFill';
import { msAccountBalanceWallet } from '@material-symbols-react-native/rounded-400/msAccountBalanceWallet';
import { msSchedule } from '@material-symbols-react-native/rounded-400/msSchedule';
import { msDirectionsBus } from '@material-symbols-react-native/rounded-400/msDirectionsBus';
import { msEvent } from '@material-symbols-react-native/rounded-400/msEvent';
import { msSearch } from '@material-symbols-react-native/rounded-400/msSearch';
import { msChevronLeft } from '@material-symbols-react-native/rounded-400/msChevronLeft';
import { msChevronRight } from '@material-symbols-react-native/rounded-400/msChevronRight';
import { msChevronRight as msChevronRightSemibold } from '@material-symbols-react-native/rounded-600/msChevronRight';
import { msWbSunny } from '@material-symbols-react-native/rounded-400/msWbSunny';
import { msDocumentScanner } from '@material-symbols-react-native/rounded-400/msDocumentScanner';
import { msMeetingRoom } from '@material-symbols-react-native/rounded-400/msMeetingRoom';
import { msBookmarks } from '@material-symbols-react-native/rounded-400/msBookmarks';
import { msSecurity } from '@material-symbols-react-native/rounded-400/msSecurity';
import { msLocationOn } from '@material-symbols-react-native/rounded-400/msLocationOn';
import { msClose } from '@material-symbols-react-native/rounded-400/msClose';
import { msNotifications } from '@material-symbols-react-native/rounded-400/msNotifications';
import { msSettings } from '@material-symbols-react-native/rounded-400/msSettings';
import { msBadge } from '@material-symbols-react-native/rounded-400/msBadge';
import { msRestaurant } from '@material-symbols-react-native/rounded-400/msRestaurant';
import { msPrint } from '@material-symbols-react-native/rounded-400/msPrint';
import { msLocalParking } from '@material-symbols-react-native/rounded-400/msLocalParking';
import { msLock } from '@material-symbols-react-native/rounded-400/msLock';
import { msBookmark } from '@material-symbols-react-native/rounded-400/msBookmark';
import { msBookmarkFill } from '@material-symbols-react-native/rounded-400/msBookmarkFill';
import { msExpandMore } from '@material-symbols-react-native/rounded-400/msExpandMore';
import { msCheck } from '@material-symbols-react-native/rounded-400/msCheck';
import { msAdd } from '@material-symbols-react-native/rounded-400/msAdd';

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
  msChevronLeft,
  msChevronRight,
  msChevronRightSemibold,
  msWbSunny,
  msPerson,
  msDocumentScanner,
  msMeetingRoom,
  msBookmarks,
  msSecurity,
  msSearch,
  msLocationOn,
  msClose,
  msNotifications,
  msSettings,
  msBadge,
  msRestaurant,
  msPrint,
  msLocalParking,
  msLock,
  msBookmark,
  msBookmarkFill,
  msExpandMore,
  msCheck,
  msAdd,
  msCalendarMonth,
  msEvent,
};

/** Icon per "My accounts" tile kind. */
export const meAccountSymbols = {
  mealPlan: msRestaurant,
  print: msPrint,
  parking: msLocalParking,
  locker: msLock,
} as const;
