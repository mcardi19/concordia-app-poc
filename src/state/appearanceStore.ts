import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppearancePreference = 'system' | 'light' | 'dark';

type AppearanceState = {
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'concordia.appearance',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
