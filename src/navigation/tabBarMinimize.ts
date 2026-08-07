import { useCallback, useRef } from 'react';
import {
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { create } from 'zustand';

/**
 * iOS 26’s native `onScrollDown` only re-expands at content offset 0 (or on tap).
 * Toggling to `none` on scroll-up forces the bar open; restoring `onScrollDown`
 * on scroll-down lets it minimize again.
 */
export type TabBarMinimizeBehavior = 'onScrollDown' | 'none';

type TabBarMinimizeState = {
  behavior: TabBarMinimizeBehavior;
  setBehavior: (behavior: TabBarMinimizeBehavior) => void;
};

export const useTabBarMinimizeStore = create<TabBarMinimizeState>((set) => ({
  behavior: 'onScrollDown',
  setBehavior: (behavior) =>
    set((state) => (state.behavior === behavior ? state : { behavior })),
}));

const DIRECTION_THRESHOLD = 6;
const AT_TOP_EPSILON = 1;

/** Feed contentOffset.y from tab-root scroll views so the tab bar can expand on scroll-up. */
export function reportTabBarScrollOffset(offsetY: number, previousY: number): void {
  if (Platform.OS !== 'ios') return;

  const y = Math.max(0, offsetY);
  const dy = y - previousY;
  const { behavior, setBehavior } = useTabBarMinimizeStore.getState();

  if (y <= AT_TOP_EPSILON) {
    if (behavior !== 'onScrollDown') {
      setBehavior('onScrollDown');
    }
    return;
  }

  if (dy < -DIRECTION_THRESHOLD && behavior !== 'none') {
    setBehavior('none');
    return;
  }

  if (dy > DIRECTION_THRESHOLD && behavior !== 'onScrollDown') {
    setBehavior('onScrollDown');
  }
}

/** Scroll handler for tab-root ScrollViews / Animated.ScrollViews. */
export function useTabBarMinimizeScrollHandler() {
  const lastYRef = useRef(0);

  return useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    reportTabBarScrollOffset(y, lastYRef.current);
    lastYRef.current = y;
  }, []);
}
