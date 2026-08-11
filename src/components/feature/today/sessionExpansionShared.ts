import { makeMutable } from 'react-native-reanimated';

/**
 * UI-thread flag for list-card opacity during expand handoff.
 * React state (`sourceHidden`) can lag a frame; this must not.
 */
export const sourceHiddenSV = makeMutable(0);

/** Shared press scale for the list card. */
export const PRESS_SCALE = 0.97;

/** List-card scale driven on the UI thread. */
export const cardScaleSV = makeMutable(1);

/**
 * Critically damped in both directions. The previous configs sat around a 0.65
 * damping ratio, and across a travel of only 3% an overshoot doesn't read as
 * springiness — it reads as a wobble.
 */
export const SPRING_PRESS = {
  duration: 200,
  dampingRatio: 1,
  overshootClamping: true,
} as const;
export const SPRING_RELEASE = {
  duration: 260,
  dampingRatio: 1,
  overshootClamping: true,
} as const;
