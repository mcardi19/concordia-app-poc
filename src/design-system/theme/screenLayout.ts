import type { ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import type { Theme } from './theme';

/** Horizontal padding applied to screen content (16px — same as Today tab). */
export function getScreenHorizontalPaddingStyle(theme: Theme): ViewStyle {
  return { paddingHorizontal: theme.spacing.screenHorizontal };
}

/** Use on ScrollView / FlatList contentContainerStyle (adds bottom breathing room). */
export function getScreenScrollContentStyle(theme: Theme): ViewStyle {
  return {
    ...getScreenHorizontalPaddingStyle(theme),
    paddingBottom: theme.spacing.xl,
  };
}

export function useScreenHorizontalPaddingStyle(): ViewStyle {
  const theme = useTheme();
  return getScreenHorizontalPaddingStyle(theme);
}

export function useScreenScrollContentStyle(): ViewStyle {
  const theme = useTheme();
  return getScreenScrollContentStyle(theme);
}
