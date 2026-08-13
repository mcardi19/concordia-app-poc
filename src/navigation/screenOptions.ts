import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { primitiveFontWeight } from '@/design-system/tokens/primitive';

/** Inactive tab label / icon chrome — matches iOS unselected tab label (~secondaryLabel). */
export const NAV_TAB_INACTIVE = '#3B3B3C';

/** Active-tab selection capsule — light brand wash (schedule fabFill family). */
export const NAV_TAB_SELECTION_TINT = '#F4E7EA';

export function useStackContentStyle() {
  const theme = useTheme();
  return { backgroundColor: theme.color.background };
}

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
