import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { Text } from '@/components/design-system';
import { todayShadowMedium, todayShadowSoft } from '@/components/feature/today/todayShadows';
import {
  GLASS_PILL_ICON_SIZE,
  GLASS_PILL_PRESSED_SCALE,
  GlassPillSurface,
  glassPillStyles,
} from '@/components/design-system/GlassPill';
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
import {
  CAMPUS_FILTER_LABEL,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { CardGlass } from './campusSheet';

const CARD_RADIUS = 24;
const PILL_RADIUS = 999;
/** Smaller than the session badge's 10 — this dot sits in a pill, not a badge. */
const STATUS_DOT_SIZE = 8;

type AmenityPill = {
  id: CampusMapFilter;
  icon: MsIconDefinition;
};

/** Labels come from `CAMPUS_FILTER_LABEL`; only the icon is local to this card. */
const AMENITY_PILLS: AmenityPill[] = [
  { id: 'buildings', icon: msGridView },
  { id: 'cafe', icon: msLocalCafe },
  { id: 'study', icon: msMeetingRoom },
  { id: 'print', icon: msPrint },
  { id: 'parking', icon: msLocalParking },
  { id: 'bike', icon: msPedalBike },
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
    /*
      Shadow on the outer view, glass on the inner one. The clip that rounds
      the glass would also clip a shadow drawn on the same view, and the glass
      cannot carry an opaque background without ceasing to be glass — so the
      two live on separate layers, the way the locate button and the sheets
      on this map already do.
    */
    <View style={[todayShadowMedium, radiusStyle(CARD_RADIUS)]}>
      <View style={[styles.clip, radiusStyle(CARD_RADIUS)]}>
        <CardGlass radius={CARD_RADIUS} />
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
            You’re at{' '}
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
              styles.pillPressable,
              radiusStyle(PILL_RADIUS),
              todayShadowSoft,
              { transform: [{ scale: pressed ? GLASS_PILL_PRESSED_SCALE : 1 }] },
            ]}
          >
            <GlassPillSurface radius={PILL_RADIUS}>
              <View style={[glassPillStyles.content, { gap: theme.spacing.sm }]}>
                {/*
                  Pulses only while there is a departure to count down to —
                  a halo on "no service today" would advertise liveness that
                  isn't there.
                */}
                {shuttleMinutes != null ? (
                  <PulsingStatusDot color={theme.color.success} size={STATUS_DOT_SIZE} />
                ) : (
                  <View
                    style={[styles.statusDot, { backgroundColor: theme.color.text.subtle }]}
                  />
                )}
                <Text variant="body" numberOfLines={1} style={glassPillStyles.label}>
                  {shuttleLabel}
                </Text>
              </View>
            </GlassPillSurface>
          </Pressable>

          {AMENITY_PILLS.map((pill) => {
            const on = pill.id !== 'buildings' && activeFilter === pill.id;
            const label = CAMPUS_FILTER_LABEL[pill.id];
            return (
              <Pressable
                key={pill.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={label}
                onPress={() => onPressFilter(pill.id)}
                style={({ pressed }) => [
                  styles.pillPressable,
                  radiusStyle(PILL_RADIUS),
                  todayShadowSoft,
                  { transform: [{ scale: pressed ? GLASS_PILL_PRESSED_SCALE : 1 }] },
                ]}
              >
                {/* Selected reads as a brand wash over the same capsule. */}
                <GlassPillSurface
                  radius={PILL_RADIUS}
                  tintColor={on ? `${theme.color.primary}24` : undefined}
                >
                  <View style={[glassPillStyles.content, { gap: theme.spacing.sm }]}>
                    <MaterialSymbol
                      icon={pill.icon}
                      size={GLASS_PILL_ICON_SIZE}
                      color={theme.color.text.brand}
                    />
                    <Text variant="body" numberOfLines={1} style={glassPillStyles.label}>
                      {label}
                    </Text>
                  </View>
                </GlassPillSurface>
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
  pillPressable: {
    flexShrink: 0,
  },
  /** Only the resting (no-service) dot; the live one is `PulsingStatusDot`. */
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
  },
});
