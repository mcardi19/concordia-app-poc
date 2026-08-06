import { Platform, type ViewStyle } from 'react-native';

/** Figma drop-shadow: 0 4 7 / 8% — chips, action buttons, carousel slides. */
export const todayShadowSoft: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  android: { elevation: 3 },
  default: {},
});

/** Figma shadow/medium: 0 4 14 / 8% — update & campus cards. */
export const todayShadowMedium: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 4 },
  default: {},
});

/** Figma needs-attention list: 0 8 12 / 10%. */
export const todayShadowHigh: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: { elevation: 6 },
  default: {},
});

/** Figma brand button shadow: 0 4 7 / burgundy 40%. */
export const todayShadowBrandButton: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#912238',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 7,
  },
  android: { elevation: 4 },
  default: {},
});
