import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msEvent } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { RAIL_WIDTH, scheduleTheme } from './scheduleTheme';
import type { ScheduleAllDayItem } from './scheduleTypes';

type Props = {
  items: ScheduleAllDayItem[];
  /** Renders the compact "All day" gutter label used by the agenda view. */
  showGutterLabel?: boolean;
  onPress?: () => void;
};

/**
 * Institutional all-day entries. Only the first is shown; the rest are implied
 * by a card peeking out behind it plus a "+N more" pill, so a busy exam week
 * never pushes the timetable off screen.
 */
export function ScheduleAllDayBanner({ items, showGutterLabel, onPress }: Props) {
  const theme = useTheme();
  if (items.length === 0) {
    return null;
  }

  const [first] = items;
  const more = items.length - 1;

  const banner = (
    <View style={styles.stackWrap}>
      {more > 0 ? (
        <View
          style={[
            styles.stackedCard,
            { borderColor: `${theme.color.primary}1A` },
          ]}
        />
      ) : null}

      <Pressable
        onPress={more > 0 ? onPress : undefined}
        disabled={more === 0}
        accessibilityRole={more > 0 ? 'button' : undefined}
        accessibilityLabel={`All day: ${first.title}${more > 0 ? `, and ${more} more` : ''}`}
        style={[styles.card, { borderColor: `${theme.color.primary}26` }]}
      >
        <MaterialSymbol icon={msEvent} size={18} color={theme.color.primary} />

        <View style={styles.cardText}>
          <Text
            variant="caption"
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.3,
              color: theme.color.primary,
              textTransform: 'uppercase',
            }}
          >
            {showGutterLabel ? first.kind : `All day · ${first.kind}`}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{
              fontSize: 14.5,
              fontWeight: '600',
              color: scheduleTheme.headingText,
              marginTop: 2,
            }}
          >
            {first.title}
          </Text>
        </View>

        {more > 0 ? (
          <View style={[styles.morePill, { backgroundColor: `${theme.color.primary}14` }]}>
            <Text
              variant="caption"
              style={{ fontSize: 11, fontWeight: '700', color: theme.color.primary }}
            >
              +{more} more
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );

  if (!showGutterLabel) {
    return banner;
  }

  return (
    <View style={styles.gutterRow}>
      <View style={styles.gutter}>
        {/*
          Sits in the hour rail's column, styled as one of its labels — the
          all-day row is the top of the same time axis, so its label belongs
          in the same gutter rather than inside the card.
        */}
        <Text variant="caption" numberOfLines={1} style={styles.gutterLabel}>
          All day
        </Text>
      </View>
      <View style={styles.gutterBody}>{banner}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stackWrap: {
    position: 'relative',
  },
  // Peeks out below the front card to imply depth.
  stackedCard: {
    position: 'absolute',
    left: 11,
    right: 11,
    top: 8,
    bottom: -6,
    backgroundColor: scheduleTheme.allDayStackFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: scheduleTheme.allDayFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  morePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  gutterRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  /** Matches `ScheduleHourRail` so the label lines up with the hour labels. */
  gutter: {
    width: RAIL_WIDTH,
    paddingTop: 12,
    paddingRight: 4,
  },
  gutterLabel: {
    fontSize: 11.5,
    textAlign: 'right',
    letterSpacing: 0.2,
    color: scheduleTheme.railLabel,
  },
  gutterBody: {
    flex: 1,
    minWidth: 0,
  },
});
