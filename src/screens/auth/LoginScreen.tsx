import React from 'react';
import { Screen, Text, Button } from '@/components/design-system';
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
  const { login, isLoading } = useAuth();

  return (
    <Screen>
      <Text variant="heading2" style={{ marginBottom: 16 }}>
        Sign in
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>
        Use your Concordia credentials. (OIDC stub)
      </Text>
      <Button
        onPress={login}
        disabled={isLoading}
        accessibilityLabel={isLoading ? 'Signing in' : 'Sign in'}
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </Screen>
  );
}
