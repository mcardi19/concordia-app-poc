import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type AppearancePreference = 'system' | 'light' | 'dark';

type AppearanceState = {
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
};

/**
 * Appearance is a tiny string — SecureStore is already in the native binary,
 * so preference survives relaunches without requiring a fresh AsyncStorage
 * native module link (which crashes older device builds with
 * `NativeModule: AsyncStorage is null`).
 */
const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'concordia.appearance',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
