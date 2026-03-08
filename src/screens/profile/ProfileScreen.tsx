import React from 'react';
import { Screen, Text, Button } from '@/components/design-system';
import { useAuth } from '@/hooks/useAuth';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Text variant="heading2" style={{ marginBottom: 16 }}>
        Profile
      </Text>
      {user ? (
        <>
          <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>
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
    </Screen>
  );
}
