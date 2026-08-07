import { StyleSheet, type ViewStyle } from 'react-native';

/** Quiet editorial card: white fill + hairline border, no elevation. */
export const todayHairlineCard: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(0,0,0,0.08)',
};

/** Soft pill / chip surface — same hairline treatment. */
export const todayHairlineChip: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(0,0,0,0.08)',
};
