import React from 'react';
import { ScrollView } from 'react-native';
import { Screen, Text } from '@/components/design-system';
import { HomeFeatureCard } from '@/components/feature';
import { useTheme } from '@/design-system/theme';
import type { CampusStackScreenProps } from '@/navigation/types';

type Props = CampusStackScreenProps<'CampusHome'>;

const CAMPUS_FEATURES = [
  {
    route: 'ShuttleSchedule' as const,
    title: 'Shuttle schedule',
    subtitle: 'Loyola ↔ SGW timetables',
    icon: 'schedule' as const,
  },
  {
    route: 'ShuttleTracker' as const,
    title: 'Shuttle tracker',
    subtitle: 'Next departures from each campus',
    icon: 'bus' as const,
  },
  {
    route: 'Events' as const,
    title: 'Featured events',
    subtitle: 'Highlights from Concordia',
    icon: 'event' as const,
  },
  {
    route: 'ServicesSearch' as const,
    title: 'Services search',
    subtitle: 'Find services and departments',
    icon: 'search' as const,
  },
];

export function CampusHomeScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <Screen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          variant="heading1"
          color="brand"
          style={{ fontSize: 32, marginTop: theme.spacing.sm, marginBottom: 8 }}
        >
          Campus
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>
          Campus life, transportation, and services.
        </Text>
        {CAMPUS_FEATURES.map((feature) => (
          <HomeFeatureCard
            key={feature.route}
            title={feature.title}
            subtitle={feature.subtitle}
            icon={feature.icon}
            onPress={() => navigation.navigate(feature.route)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
