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
  open: (
    session: TodaySession,
    pressedOrigin: SessionCardOrigin,
    restingOrigin: SessionCardOrigin,
  ) => void;
  setSourceHidden: (hidden: boolean) => void;
  /** Tear down after the collapse spring finishes. */
  reset: () => void;
};

export const useSessionExpansionStore = create<SessionExpansionState>((set, get) => ({
  isActive: false,
  sourceHidden: false,
  session: null,
  pressedOrigin: null,
  restingOrigin: null,
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
