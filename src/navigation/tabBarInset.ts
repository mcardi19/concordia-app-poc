import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system/theme';

/**
 * Native tab bar height, excluding the home-indicator safe area.
 * `useBottomTabBarHeight()` cannot be used here: it reads
 * BottomTabBarHeightContext, which only the JS `BottomTabView` provides —
 * this app uses `createNativeBottomTabNavigator`, which does not.
 */
const NATIVE_TAB_BAR_HEIGHT = 49;

/**
 * Extra scroll padding above the native tab bar.
 * Platform tabs already inset the scene; this adds breathing room only.
 *
 * Only correct when the scroll view keeps `contentInsetAdjustmentBehavior`
 * on `automatic` — otherwise use `useTabBarContentPadding`.
 */
export function useTabBarScrollInset(): number {
  const theme = useTheme();
  return theme.spacing.lg;
}

/**
 * Bottom offset for overlays that must sit just above the native tab bar.
 * Full-bleed screens (`safe={false}`) are not inset by the bar, so its height
 * and the home-indicator inset have to be added by hand.
 */
export function useTabBarOverlayInset(): number {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return NATIVE_TAB_BAR_HEIGHT + insets.bottom + theme.spacing.sm;
}

/**
 * Full bottom clearance for scroll views that opt out of automatic content
 * inset adjustment (`contentInsetAdjustmentBehavior="never"`, needed when
 * content runs under the status bar). Those get no automatic tab bar inset,
 * so the bar height and home-indicator inset must be added by hand.
 */
export function useTabBarContentPadding(): number {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return NATIVE_TAB_BAR_HEIGHT + insets.bottom + theme.spacing.lg;
}

/** @deprecated Prefer `useTabBarScrollInset`. */
export const useFloatingTabBarScrollInset = useTabBarScrollInset;
