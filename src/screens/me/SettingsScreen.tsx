import React from 'react';
import { View } from 'react-native';
import { Screen, Text, Button } from '@/components/design-system';
import { AccountSettingsList } from '@/components/feature/me';
import { useAppearance, useTheme } from '@/design-system/theme';
import { useAuth } from '@/hooks/useAuth';
import { accountSettingsRows } from './accountData';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Settings'>;

const PREFERENCE_LABEL = { system: 'System', light: 'Light', dark: 'Dark' } as const;

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { logout, isLoading } = useAuth();
  const { preference } = useAppearance();

  const rows = accountSettingsRows.map((row) =>
    row.id === 'appearance' ? { ...row, value: PREFERENCE_LABEL[preference] } : row,
  );

  return (
    <Screen>
      <Text variant="heading2" color="brand" style={{ marginBottom: 8 }}>
        Settings
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        App preferences and account actions.
      </Text>

      <AccountSettingsList
        rows={rows}
        onRowPress={(row) => row.route && navigation.navigate(row.route)}
      />

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button variant="secondary" onPress={() => logout()} disabled={isLoading}>
          {isLoading ? 'Signing out…' : 'Sign out'}
        </Button>
      </View>
    </Screen>
  );
}
