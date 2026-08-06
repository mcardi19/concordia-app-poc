import React from 'react';
import { View } from 'react-native';
import { Screen, Text, Button } from '@/components/design-system';
import { AccountSettingsList } from '@/components/feature/me';
import { useTheme } from '@/design-system/theme';
import { useAuth } from '@/hooks/useAuth';
import { accountSettingsRows } from './accountData';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Settings'>;

export function SettingsScreen(_props: Props) { // navigation props unused on this screen
  void _props;
  const theme = useTheme();
  const { logout, isLoading } = useAuth();

  return (
    <Screen>
      <Text variant="heading2" color="brand" style={{ marginBottom: 8 }}>
        Settings
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        App preferences and account actions.
      </Text>

      <AccountSettingsList rows={accountSettingsRows} />

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button variant="secondary" onPress={() => logout()} disabled={isLoading}>
          {isLoading ? 'Signing out…' : 'Sign out'}
        </Button>
      </View>
    </Screen>
  );
}
