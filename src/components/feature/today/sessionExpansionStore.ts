import { create } from 'zustand';
import type { TodaySession } from './todayData';
import { sourceHiddenSV } from './sessionExpansionShared';

/** Viewport-relative card geometry. */
export type SessionCardOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
};

type MeasureRestingFn = (callback: (origin: SessionCardOrigin) => void) => void;

type SessionExpansionState = {
  /** Overlay is mounted (opening, open, or closing). */
  isActive: boolean;
  /** Hide the list card while the shared overlay represents it. */
  sourceHidden: boolean;
  session: TodaySession | null;
  /** Pressed visual frame — progress 0 while opening (matches finger-down card). */
  pressedOrigin: SessionCardOrigin | null;
  /** Resting layout frame — progress 0 while closing (matches homepage card). */
  restingOrigin: SessionCardOrigin | null;
  /** Live measure of the list card (scale 1), used to land the close precisely. */
  measureResting: MeasureRestingFn | null;
  open: (
    session: TodaySession,
    pressedOrigin: SessionCardOrigin,
    restingOrigin: SessionCardOrigin,
  ) => void;
  setSourceHidden: (hidden: boolean) => void;
  setRestingOrigin: (restingOrigin: SessionCardOrigin) => void;
  setMeasureResting: (measureResting: MeasureRestingFn | null) => void;
  /** Tear down after the collapse spring finishes. */
  reset: () => void;
};

export const useSessionExpansionStore = create<SessionExpansionState>((set, get) => ({
  isActive: false,
  sourceHidden: false,
  session: null,
  pressedOrigin: null,
  restingOrigin: null,
  measureResting: null,
  open: (session, pressedOrigin, restingOrigin) => {
    if (get().isActive) {
      return;
    }
    sourceHiddenSV.value = 0;
    set({
      isActive: true,
      sourceHidden: false,
      session,
      pressedOrigin,
      restingOrigin,
    });
  },
  setSourceHidden: (sourceHidden) => {
    sourceHiddenSV.value = sourceHidden ? 1 : 0;
    set({ sourceHidden });
  },
  setRestingOrigin: (restingOrigin) => set({ restingOrigin }),
  setMeasureResting: (measureResting) => set({ measureResting }),
  reset: () => {
    sourceHiddenSV.value = 0;
    set({
      isActive: false,
      sourceHidden: false,
      session: null,
      pressedOrigin: null,
      restingOrigin: null,
    });
  },
}));
