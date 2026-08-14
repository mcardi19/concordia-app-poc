import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { Text } from '@/components/design-system';
import { todayShadowMedium } from '@/components/feature/today/todayShadows';
import {
  MaterialSymbol,
  msGridView,
  msLocalCafe,
  msLocalParking,
  msLocationOn,
  msMeetingRoom,
  msPedalBike,
  msPrint,
} from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { useShuttleTracker } from '@/hooks/useShuttleTracker';
import type { CampusMapFilter } from '@/services/campus/buildingPresentation';

const CARD_RADIUS = 24;
const PILL_RADIUS = 999;
const ICON_SIZE = 16;

type AmenityPill = {
  id: CampusMapFilter;
  label: string;
  icon: MsIconDefinition;
};

const AMENITY_PILLS: AmenityPill[] = [
  { id: 'buildings', label: 'Buildings', icon: msGridView },
  { id: 'cafe', label: 'Cafés', icon: msLocalCafe },
  { id: 'study', label: 'Quiet study', icon: msMeetingRoom },
  { id: 'print', label: 'Print', icon: msPrint },
  { id: 'parking', label: 'Parking', icon: msLocalParking },
  { id: 'bike', label: 'Bike racks', icon: msPedalBike },
];

type Props = {
  campusName: string;
  activeFilter: CampusMapFilter;
  onPressShuttle: () => void;
  onPressFilter: (filter: CampusMapFilter) => void;
};

/**
 * Floating campus discovery card — location status plus a clipped horizontal
 * amenity rail, docked above the tab bar.
 */
export function CampusQuickCard({
  campusName,
  activeFilter,
  onPressShuttle,
  onPressFilter,
}: Props) {
  const theme = useTheme();
  const { sgwMinutes: shuttleMinutes } = useShuttleTracker();
  const shuttleLabel =
    shuttleMinutes != null ? `Shuttle · ${shuttleMinutes} min` : 'Shuttle';

  return (
    <View
      style={[
        todayShadowMedium,
        radiusStyle(CARD_RADIUS),
        { backgroundColor: theme.color.background },
      ]}
    >
      <View style={[styles.clip, radiusStyle(CARD_RADIUS)]}>
        <View style={styles.handleRow}>
          <View
            style={[styles.handle, { backgroundColor: theme.color.border }]}
          />
        </View>

        <View style={styles.locationRow}>
          <MaterialSymbol
            icon={msLocationOn}
            size={20}
            color={theme.color.text.brand}
          />
          <Text variant="body" style={styles.locationText}>
            You're at{' '}
            <Text variant="body" style={styles.locationCampus}>
              {campusName}
            </Text>
          </Text>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.color.borderSubtle }]}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={styles.pillsScroll}
          contentContainerStyle={styles.pillsContent}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={shuttleLabel}
            onPress={onPressShuttle}
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: theme.color.backgroundSubtle, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    shuttleMinutes != null
                      ? theme.color.success
                      : theme.color.text.subtle,
                },
              ]}
            />
            <Text variant="caption" numberOfLines={1} style={styles.pillLabel}>
              {shuttleLabel}
            </Text>
          </Pressable>

          {AMENITY_PILLS.map((pill) => {
            const on = pill.id !== 'buildings' && activeFilter === pill.id;
            return (
              <Pressable
                key={pill.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={pill.label}
                onPress={() => onPressFilter(pill.id)}
                style={({ pressed }) => [
                  styles.pill,
                  {
                    backgroundColor: on
                      ? `${theme.color.primary}14`
                      : theme.color.backgroundSubtle,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <MaterialSymbol
                  icon={pill.icon}
                  size={ICON_SIZE}
                  color={theme.color.text.brand}
                />
                <Text variant="caption" numberOfLines={1} style={styles.pillLabel}>
                  {pill.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 20,
  },
  locationCampus: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  pillsScroll: {
    flexGrow: 0,
  },
  pillsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: PILL_RADIUS,
    borderCurve: 'continuous',
  },
  pillLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
