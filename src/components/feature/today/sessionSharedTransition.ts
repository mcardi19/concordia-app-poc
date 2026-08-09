import { SharedTransition } from 'react-native-reanimated';

/** Shared element tag for the Today session card ↔ detail hero morph. */
export const SESSION_CARD_SHARED_TAG = 'today-session-card';

/** @deprecated Use SESSION_CARD_SHARED_TAG — same morph target. */
export const SESSION_HERO_SHARED_TAG = SESSION_CARD_SHARED_TAG;

/** Soft spring morph from card bounds into the detail hero. */
export const sessionCardSharedTransition = SharedTransition.duration(450)
  .springify()
  .damping(28)
  .stiffness(210)
  .mass(0.8);

/** @deprecated Use sessionCardSharedTransition. */
export const sessionHeroSharedTransition = sessionCardSharedTransition;
