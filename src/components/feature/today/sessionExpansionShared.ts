import { makeMutable } from 'react-native-reanimated';

/**
 * UI-thread flag for list-card opacity during expand handoff.
 * React state (`sourceHidden`) can lag a frame; this must not.
 */
export const sourceHiddenSV = makeMutable(0);

/** Shared press scale — open starts here; close lands here then bounces out. */
export const PRESS_SCALE = 0.97;

/** List-card scale driven on the UI thread for press + close bounce. */
export const cardScaleSV = makeMutable(1);

export const SPRING_PRESS = { damping: 24, stiffness: 380, mass: 0.75 };
/** Softer settle when bouncing out of the tap scale after close. */
export const SPRING_RELEASE = { damping: 18, stiffness: 200, mass: 0.95 };
