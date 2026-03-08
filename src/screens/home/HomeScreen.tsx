import React from 'react';
import { Screen, Text, Button, Card, Input } from '@/components/design-system';

export function HomeScreen() {
  return (
    <Screen>
      <Text variant="heading2" style={{ marginBottom: 16 }}>
        Welcome to Concordia
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>
        This screen demonstrates token-driven components: Text, Button, Card, and Input all use the theme.
      </Text>
      <Card elevation="medium" style={{ marginBottom: 24 }}>
        <Text variant="bodySmall" color="secondary" style={{ marginBottom: 8 }}>
          Card uses theme.color.background, theme.radius.md, theme.spacing.lg, and theme.elevation.
        </Text>
        <Button variant="primary" accessibilityLabel="Example button">
          Primary Button
        </Button>
      </Card>
      <Input
        label="Example input"
        placeholder="Type here..."
        accessibilityLabel="Example input field"
      />
    </Screen>
  );
}
