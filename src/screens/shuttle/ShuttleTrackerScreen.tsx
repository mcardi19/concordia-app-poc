import React from 'react';
import { Screen, Text, Card } from '@/components/design-system';
import { useShuttleTracker } from '@/hooks/useShuttleTracker';

export function ShuttleTrackerScreen() {
  const status = useShuttleTracker();

  return (
    <Screen>
      <Text variant="body" color="secondary" style={{ marginBottom: 16 }}>
        Next departures update every 30 seconds (same logic as the legacy app). There is no live
        GPS map in the current API.
      </Text>
      <Card elevation="medium" style={{ marginBottom: 16 }}>
        <Text variant="bodySmall" color="secondary">
          Loyola campus
        </Text>
        <Text variant="heading3" style={{ marginTop: 4 }}>
          {status.loyMessage}
        </Text>
      </Card>
      {status.sgwMessage ? (
        <Card elevation="medium">
          <Text variant="bodySmall" color="secondary">
            SGW campus
          </Text>
          <Text variant="heading3" style={{ marginTop: 4 }}>
            {status.sgwMessage}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
