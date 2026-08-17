import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { MeGlassCard } from '@/components/feature/me';
import { MaterialSymbol, msDirectionsBus } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useNow } from '@/hooks';
import { getNextShuttleMinutes } from '@/services/shuttle/shuttleTracker';
import { meTheme } from '@/screens/me/meTheme';
import type { ShuttleCampus } from '@/types/campus';
import {
  SHUTTLE_CAMPUS_NAME,
  SHUTTLE_STOP_NAME,
  SHUTTLE_TRIP_MINUTES,
  shuttleDeparturesToday,
  shuttleRunsOn,
} from './shuttleSchedule';

const DIRECTIONS: ShuttleCampus[] = ['sgw', 'loy'];

/** Three across, as the design lays the run out. */
const COLUMNS = 3;

/**
 * Shuttle tracker.
 *
 * The design's shuttle-stop sheet as a screen: which direction, when the next
 * one goes, and the whole published run for today. It answers "have I missed
 * it" as much as "when is the next one" — which is why the full day is shown
 * with the gone ones dimmed rather than a list that starts at now.
 */
export function ShuttleTrackerScreen() {
  const theme = useTheme();
  const now = useNow();
  const [from, setFrom] = useState<ShuttleCampus>('sgw');

  const to: ShuttleCampus = from === 'sgw' ? 'loy' : 'sgw';
  const running = shuttleRunsOn(now);

  const departures = useMemo(() => shuttleDeparturesToday(from, now), [from, now]);
  const minutesAway = useMemo(() => getNextShuttleMinutes(from, undefined, now), [from, now]);

  const rows = useMemo(() => {
    const grid: (typeof departures)[] = [];
    for (let i = 0; i < departures.length; i += COLUMNS) {
      grid.push(departures.slice(i, i + COLUMNS));
    }
    return grid;
  }, [departures]);

  const headline = !running
    ? 'No service today'
    : minutesAway == null
      ? 'No more departures today'
      : `Departs in ${minutesAway} min`;

  const selectFrom = useCallback((campus: ShuttleCampus) => setFrom(campus), []);

  return (
    <View style={[styles.root, { backgroundColor: meTheme.pageBackground }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headRow}>
          <View style={[styles.icon, { backgroundColor: theme.color.primary }]}>
            <MaterialSymbol
              icon={msDirectionsBus}
              size={22}
              color={theme.color.text.inverse}
            />
          </View>
          <View style={styles.headText}>
            <View style={styles.eyebrowRow}>
              {minutesAway != null ? (
                <PulsingStatusDot color={theme.color.success} size={8} />
              ) : null}
              <Text variant="caption" color="brand" style={styles.eyebrow}>
                {minutesAway != null ? 'Shuttle · live' : 'Shuttle'}
              </Text>
            </View>
            <Text variant="body" style={styles.headline}>
              {`To ${SHUTTLE_CAMPUS_NAME[to]} · ${headline}`}
            </Text>
          </View>
        </View>

        {/* Direction, not campus — the run is one-way and the times differ. */}
        <View style={[styles.toggle, { backgroundColor: theme.color.backgroundSubtle }]}>
          {DIRECTIONS.map((campus) => {
            const on = campus === from;
            const other = campus === 'sgw' ? 'loy' : 'sgw';
            return (
              <Pressable
                key={campus}
                onPress={() => selectFrom(campus)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${SHUTTLE_CAMPUS_NAME[campus]} to ${SHUTTLE_CAMPUS_NAME[other]}`}
                style={[
                  styles.toggleOption,
                  on ? [styles.toggleOn, { backgroundColor: theme.color.background }] : null,
                ]}
              >
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={[
                    styles.toggleLabel,
                    { color: on ? meTheme.headingText : meTheme.metaText },
                  ]}
                >
                  {`${SHUTTLE_CAMPUS_NAME[campus]} → ${SHUTTLE_CAMPUS_NAME[other]}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.scheduleHead}>
          <Text variant="caption" style={styles.scheduleLabel}>
            Full schedule · today
          </Text>
          <Text variant="caption" color="secondary" style={styles.scheduleMeta}>
            {`~${SHUTTLE_TRIP_MINUTES} min`}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.route}>
          {`${SHUTTLE_STOP_NAME[from]} → ${SHUTTLE_CAMPUS_NAME[to]}`}
        </Text>

        {departures.length === 0 ? (
          <MeGlassCard style={styles.emptyCard} contentStyle={styles.emptyContent}>
            <Text variant="bodySmall" color="secondary">
              The shuttle does not run on weekends or holidays. Next service resumes
              on the following weekday.
            </Text>
          </MeGlassCard>
        ) : (
          <View style={styles.grid}>
            {rows.map((row) => (
              <View key={row[0].value} style={styles.gridRow}>
                {row.map((departure) => {
                  const highlight = departure.next;
                  return (
                    <View
                      key={departure.value}
                      accessible
                      accessibilityLabel={
                        highlight
                          ? `${departure.label}, next departure`
                          : departure.past
                            ? `${departure.label}, departed`
                            : departure.label
                      }
                      style={[
                        styles.slot,
                        {
                          backgroundColor: highlight
                            ? theme.color.primary
                            : theme.color.backgroundSubtle,
                          opacity: departure.past ? 0.45 : 1,
                        },
                      ]}
                    >
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={[
                          styles.slotLabel,
                          {
                            color: highlight
                              ? theme.color.text.inverse
                              : meTheme.headingText,
                          },
                        ]}
                      >
                        {departure.label}
                      </Text>
                    </View>
                  );
                })}
                {/* Keep the last row on the same column rhythm. */}
                {row.length < COLUMNS
                  ? Array.from({ length: COLUMNS - row.length }, (_, i) => (
                      <View key={`pad-${i}`} style={styles.slotPad} />
                    ))
                  : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 32,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  headline: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  toggle: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginTop: 20,
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    borderCurve: 'continuous',
  },
  toggleOn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  scheduleHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  scheduleLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: meTheme.labelText,
  },
  scheduleMeta: {
    fontSize: 11.5,
    lineHeight: 14,
  },
  route: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '600',
    color: meTheme.headingText,
    marginTop: 4,
  },
  grid: {
    marginTop: 12,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  slotPad: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: '700',
  },
  emptyCard: {
    marginTop: 12,
  },
  emptyContent: {
    padding: 16,
  },
});
