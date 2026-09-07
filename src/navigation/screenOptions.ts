import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { primitiveFontWeight } from '@/design-system/tokens/primitive';

/** Inactive tab label / icon chrome — matches iOS unselected tab label (~secondaryLabel). */
export const NAV_TAB_INACTIVE = '#3B3B3C';

/**
 * For screens that draw their own gradient curtain behind the bar: the bar
 * itself must not paint, or there would be two backgrounds.
 *
 * iOS only. `headerTransparent` there keeps the liquid-glass bar, while on
 * Android the header is a solid surface and content running under it would
 * just collide.
 */
export const CURTAIN_HEADER = Platform.select({
  ios: { headerTransparent: true, headerShadowVisible: false, headerStyle: undefined },
  default: {},
});

export function useStackContentStyle() {
  const theme = useTheme();
  return { backgroundColor: theme.color.background };
}

/**
 * Native-bar back glyph. Must stay an image source: the control is a real
 * UIBarButtonItem, and a React `headerLeft` (the 44pt glass `HeaderBackButton`)
 * draws a second capsule on top of the system one — the overlap on Campus
 * events. In-screen chrome (Search, Account) still uses `HeaderBackButton`.
 */
const HEADER_BACK_IMAGE = require('../../assets/header/back.png');

/** Shared stack options — native chrome tinted with Concordia brand tokens. */
export function useStackScreenOptions(): NativeStackNavigationOptions {
  const contentStyle = useStackContentStyle();
  const theme = useTheme();

  return {
    contentStyle,
    headerTintColor: theme.color.primary,
    // Opaque backgrounds disable iOS 26+ liquid glass on the nav bar.
    headerStyle: Platform.select({
      ios: undefined,
      android: { backgroundColor: theme.color.background },
    }),
    headerShadowVisible: false,
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: primitiveFontWeight.bodySemiBold,
      color: theme.color.text.primary,
    },
    headerBackButtonDisplayMode: 'minimal',
    headerBackImageSource: HEADER_BACK_IMAGE,
  };
}

/**
 * The tab bar's resting style, for screens that hide it temporarily.
 * Never set a backgroundColor on iOS — that forces an opaque
 * UITabBarAppearance and kills iOS 26 liquid glass.
 */
export function defaultTabBarStyle(backgroundColor: string) {
  return Platform.select({
    ios: undefined,
    android: { backgroundColor },
  });
}
