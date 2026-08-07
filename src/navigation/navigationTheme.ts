import { DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import type { Theme } from '@/design-system/theme';

/** Map Concordia design tokens onto React Navigation’s theme. */
export function createNavigationTheme(theme: Theme): NavigationTheme {
  return {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.color.primary,
      background: theme.color.background,
      card: theme.color.background,
      text: theme.color.text.primary,
      border: theme.color.borderSubtle,
      notification: theme.color.primary,
    },
  };
}
