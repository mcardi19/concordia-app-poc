import { StyleSheet, type ViewStyle } from 'react-native';
import { useAppearance } from '@/design-system/theme';

const lightHairline: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(0,0,0,0.08)',
};

const darkHairline: ViewStyle = {
  backgroundColor: '#1C1C1E',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(255,255,255,0.10)',
};

export function useTodaySurfaces() {
  const { scheme } = useAppearance();
  const hairline = scheme === 'dark' ? darkHairline : lightHairline;
  return {
    /** Quiet editorial card: fill + hairline border, no elevation. */
    todayHairlineCard: hairline,
    /** Soft pill / chip surface — same hairline treatment. */
    todayHairlineChip: hairline,
  };
}
