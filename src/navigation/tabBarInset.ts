import { useTheme } from '@/design-system/theme';

/**
 * Extra scroll padding above the native tab bar.
 * Platform tabs already inset the scene; this adds breathing room only.
 */
export function useTabBarScrollInset(): number {
  const theme = useTheme();
  return theme.spacing.lg;
}

/** @deprecated Prefer `useTabBarScrollInset`. */
export const useFloatingTabBarScrollInset = useTabBarScrollInset;
