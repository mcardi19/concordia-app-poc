import { makeMutable } from 'react-native-reanimated';

/**
 * UI-thread flag for list-card opacity during expand handoff.
 * React state (`sourceHidden`) can lag a frame; this must not.
 */
export const sourceHiddenSV = makeMutable(0);
