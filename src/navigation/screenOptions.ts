import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { primitiveFontWeight } from '@/design-system/tokens/primitive';

/** Inactive tab label / icon chrome — matches iOS unselected tab label (~secondaryLabel). */
export const NAV_TAB_INACTIVE = '#3B3B3C';

export function useStackContentStyle() {
  const theme = useTheme();
  return { backgroundColor: theme.color.background };
}

/**
 * Back arrow for the native header, replacing the system chevron.
 *
 * A template PNG rather than a `MaterialSymbol`: the back button is a real
 * UIBarButtonItem, so it takes an image source, not a React view — and going
 * through `headerLeft` instead would put a control on every stack root, which
 * has nothing to go back to. Rendered from the same Material Symbols rounded
 * `arrow_back` glyph the in-screen back controls use, at the 22/44/66 sizes
 * the other header assets use.
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
      fontSize: theme.typography.heading3.fontSize,
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
