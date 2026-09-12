import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button } from '@/components/design-system';
import { useAuth } from '@/hooks/useAuth';
import { dismissAccountModal } from '@/navigation/dismissAccount';
import { semanticSpacing } from '@/design-system/tokens';
import { InboxSheetChrome } from '@/screens/me/InboxSheetChrome';
import { useMeTheme } from '@/screens/me/meTheme';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Profile'>;

/**
 * Profile, reached from the Account ID card. Lives in the Account form sheet,
 * so chrome is in-screen — a native bar here zeros the body.
 */
export function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const me = useMeTheme();

  return (
    <View
      collapsable={false}
      style={[styles.root, { backgroundColor: me.pageBackground }]}
    >
      <InboxSheetChrome
        title="Profile"
        onClose={() => dismissAccountModal(navigation)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <>
            <Text variant="body" color="secondary" style={styles.identity}>
              {user.name ?? user.email ?? user.id}
            </Text>
            <Button variant="secondary" onPress={logout} accessibilityLabel="Sign out">
              Sign out
            </Button>
          </>
        ) : (
          <Text variant="body" color="secondary">
            Not signed in.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 40,
  },
  identity: {
    marginBottom: 24,
  },
});
