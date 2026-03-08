/**
 * Accessibility constants for design system components.
 * Use these so touch targets and roles are consistent app-wide.
 */

import { touchTargetMinSize } from '@/design-system/tokens';

/** Minimum size for interactive elements (iOS 44pt / Material 48dp). */
export const MIN_TOUCH_TARGET_SIZE = touchTargetMinSize;

/** Default hitSlop to expand touch area without changing layout. */
export const HIT_SLOP = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
} as const;
