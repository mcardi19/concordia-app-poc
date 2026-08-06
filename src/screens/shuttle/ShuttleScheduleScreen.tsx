import React from 'react';
import { Linking } from 'react-native';
import { Screen, Text, Card, Button } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { API_CONFIG } from '@/config/api';
import { DEFAULT_SHUTTLE_TIMES } from '@/services/shuttle/shuttleData';

export function ShuttleScheduleScreen() {
  const sample = DEFAULT_SHUTTLE_TIMES.monThu;

  return (
    <Screen>
      <Text variant="body" color="secondary" style={{ marginBottom: 16 }}>
        Full seasonal timetables are maintained on concordia.ca. Below is a sample of Loyola
        departures (Mon–Thu); use the tracker for next buses.
      </Text>
      <Card elevation="low" style={{ marginBottom: 16 }}>
        <Text variant="body" style={{ fontFamily: fonts.interSemiBold, marginBottom: 8 }}>
          Loyola → SGW (Mon–Thu, sample)
        </Text>
        <Text variant="bodySmall" color="secondary">
          {sample.loy.join(' · ')}
        </Text>
      </Card>
      <Card elevation="low" style={{ marginBottom: 16 }}>
        <Text variant="body" style={{ fontFamily: fonts.interSemiBold, marginBottom: 8 }}>
          SGW → Loyola (Mon–Thu, sample)
        </Text>
        <Text variant="bodySmall" color="secondary">
          {sample.sgw.join(' · ')}
        </Text>
      </Card>
      <Button onPress={() => Linking.openURL(API_CONFIG.shuttleScheduleWebUrl)}>
        View full schedule on web
      </Button>
    </Screen>
  );
}
