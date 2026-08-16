import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system/theme';
import { useTabBarHidden } from './tabBarVisibility';

/**
 * Native tab bar height, excluding the home-indicator safe area.
 * `useBottomTabBarHeight()` cannot be used here: it reads
 * BottomTabBarHeightContext, which only the JS `BottomTabView` provides —
 * this app uses `createNativeBottomTabNavigator`, which does not.
 */
const NATIVE_TAB_BAR_HEIGHT = 49;

/**
 * Whether the tab bar is actually on screen for the calling screen.
 *
 * Mirrors what `MainTabs` decides: the bar belongs to each stack's root, and a
 * screen covering it with its own bottom sheet takes it away. Reserving its
 * height unconditionally left a dead 49pt strip under every pushed screen.
 *
 * `state.index === 0` is this stack showing its root. A root that has pushed a
 * child reports a non-zero index too, but it is covered at that point and
 * re-renders on the way back.
 */
export function useTabBarVisible(): boolean {
  const hiddenByScreen = useTabBarHidden();
  const atRoot = useNavigationState((state) => state.index === 0);
  return !hiddenByScreen && atRoot;
}

/** The bar's height where it is showing, and nothing where it is not. */
function useTabBarHeight(): number {
  return useTabBarVisible() ? NATIVE_TAB_BAR_HEIGHT : 0;
}

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
  return useTabBarHeight() + insets.bottom + theme.spacing.sm;
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
  return useTabBarHeight() + insets.bottom + theme.spacing.lg;
}

/** @deprecated Prefer `useTabBarScrollInset`. */
export const useFloatingTabBarScrollInset = useTabBarScrollInset;
