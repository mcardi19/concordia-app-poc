import { Platform, type ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import type { Theme } from './theme';
import { SQUIRCLE_CURVE } from './radiusStyle';

export type CardElevation = 'none' | 'low' | 'medium' | 'high';

/** Shared bordered card surface — use for Card and custom card layouts. */
export function getCardSurfaceStyle(
  theme: Theme,
  elevation: CardElevation = 'low',
  overrides?: ViewStyle
): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: theme.color.background,
    borderRadius: theme.radius.lg,
    borderCurve: SQUIRCLE_CURVE,
    borderWidth: theme.borderWidth.default,
    borderColor: theme.color.borderSubtle,
  };

  if (elevation === 'none') {
    return { ...base, ...overrides };
  }

  const shadow = theme.shadow[elevation];
  const shadowStyle: ViewStyle =
    Platform.OS === 'ios'
      ? {
          shadowColor: shadow.shadowColor,
          shadowOffset: shadow.shadowOffset,
          shadowOpacity: shadow.shadowOpacity,
          shadowRadius: shadow.shadowRadius,
        }
      : { elevation: shadow.elevation };

  return { ...base, ...shadowStyle, ...overrides };
}

export function useCardSurface(
  elevation: CardElevation = 'low',
  overrides?: ViewStyle
): ViewStyle {
  const theme = useTheme();
  return getCardSurfaceStyle(theme, elevation, overrides);
}
