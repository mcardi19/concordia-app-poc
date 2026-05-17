import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';

type Props = {
  onSettingsPress?: () => void;
};

export function AccountHeader({ onSettingsPress }: Props) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text variant="heading1" color="brand" style={{ fontSize: 32, lineHeight: 38 }}>
          Account
        </Text>
        <Pressable onPress={onSettingsPress} accessibilityRole="button" accessibilityLabel="Settings">
          <Text variant="bodySmall" color="secondary" style={{ textDecorationLine: 'underline' }}>
            Settings
          </Text>
        </Pressable>
      </View>
      <View style={{ height: 1, backgroundColor: theme.color.primary }} />
    </View>
  );
}
