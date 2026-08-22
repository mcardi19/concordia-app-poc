import { Platform, type ViewStyle } from 'react-native';
import { useAppearance } from '@/design-system/theme';

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

/**
 * Figma brand button shadow: 0 4 7 / burgundy 40%. Currently unused anywhere
 * in the app — kept as a hook (rather than a plain export) for consistency
 * with the rest of this file's conversion, since its color should track
 * whichever brand accent is active once it does get a consumer.
 */
function useTodayShadowBrandButton(): ViewStyle {
  const { scheme } = useAppearance();
  const shadowColor = scheme === 'dark' ? '#D9748C' : '#912338';
  return Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 7,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle;
}
export { useTodayShadowBrandButton };
