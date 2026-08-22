import { useAppearance } from '@/design-system/theme';

/**
 * Translucent chrome for the floating tab bar / masthead actions, derived
 * from the page background at 72% alpha. Currently unused anywhere in the
 * app — kept as a hook for pattern consistency, so whichever surface adopts
 * it later gets the dark counterpart for free.
 */
export function useTodayChromeSurface(): string {
  const { scheme } = useAppearance();
  return scheme === 'dark' ? 'rgba(28, 28, 30, 0.72)' : 'rgba(247, 247, 248, 0.72)';
}
