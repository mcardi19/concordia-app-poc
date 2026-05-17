import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '@/design-system/theme';

export function useStackContentStyle() {
  const theme = useTheme();
  return { backgroundColor: theme.color.background };
}

/** Shared stack options — titles stay sentence case (not all caps). */
export function useStackScreenOptions(): NativeStackNavigationOptions {
  const contentStyle = useStackContentStyle();
  const theme = useTheme();

  return {
    contentStyle,
    headerTitleStyle: {
      fontSize: theme.typography.heading3.fontSize,
      fontWeight: '600',
    },
  };
}
