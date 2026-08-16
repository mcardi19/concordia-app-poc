import { useEffect } from 'react';
import { create } from 'zustand';

type TabBarVisibilityState = {
  /** Set by a screen covering the tab bar with its own bottom-anchored surface. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

const useTabBarVisibilityStore = create<TabBarVisibilityState>((set) => ({
  hidden: false,
  setHidden: (hidden) =>
    set((state) => (state.hidden === hidden ? state : { hidden })),
}));

export const useTabBarHidden = () => useTabBarVisibilityStore((s) => s.hidden);

/**
 * Hide the tab bar for as long as the calling screen needs it gone.
 *
 * A store rather than `navigation.getParent().setOptions({ tabBarStyle })`:
 * an imperative override beats the navigator's own `screenOptions`, so a
 * screen that toggled it directly would also overwrite the route-driven rule
 * in `MainTabs` — Campus setting the bar back while its search screen was up.
 * Routing both through one flag keeps `MainTabs` the only place that decides.
 *
 * Always released on unmount, so a screen left with a sheet open cannot strand
 * the bar hidden for the rest of the session.
 */
export function useHideTabBar(hidden: boolean): void {
  const setHidden = useTabBarVisibilityStore((s) => s.setHidden);

  useEffect(() => {
    setHidden(hidden);
  }, [hidden, setHidden]);

  useEffect(() => () => setHidden(false), [setHidden]);
}
