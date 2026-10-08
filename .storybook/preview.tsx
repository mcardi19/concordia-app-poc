import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react';
import { ThemeProvider, useTheme } from '@/design-system/theme';

function ThemedCanvas({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.color.background,
      }}
    >
      {children}
    </View>
  );
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedCanvas>
            <Story />
          </ThemedCanvas>
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        order: ['Design System', 'Icons', 'Today', 'Search', 'Library', 'Me', 'Home'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
