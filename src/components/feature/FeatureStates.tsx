import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text, Button } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
      <ActivityIndicator color={theme.color.primary} />
      <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.md }}>
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical: theme.spacing.lg }}>
      <Text variant="body" color="secondary">
        {message}
      </Text>
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry} style={{ marginTop: theme.spacing.md }}>
          Try again
        </Button>
      ) : null}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Text variant="body" color="secondary" style={{ paddingVertical: 16 }}>
      {message}
    </Text>
  );
}
