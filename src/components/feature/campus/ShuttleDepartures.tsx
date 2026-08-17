import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msLocationOnFill } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { getNextShuttleMinutes } from '@/services/shuttle/shuttleTracker';
import { meTheme } from '@/screens/me/meTheme';
import type { ShuttleCampus } from '@/types/campus';
import {
  SHUTTLE_CAMPUS_NAME,
  SHUTTLE_STOP,
  SHUTTLE_TRIP_MINUTES,
  shuttleDeparturesToday,
  shuttleRunsOn,
} from '@/screens/shuttle/shuttleSchedule';

const DIRECTIONS: ShuttleCampus[] = ['sgw', 'loy'];

/** Three across, as the design lays the run out. */
const COLUMNS = 3;

/**
 * Everything both shuttle surfaces need to say, derived once.
 *
 * The map drawer and the tracker screen show the same thing in different
 * chrome; deriving it here keeps them from disagreeing about when the next
 * bus leaves.
 */
export function useShuttleDeparture(from: ShuttleCampus, now: Date) {
  const to: ShuttleCampus = from === 'sgw' ? 'loy' : 'sgw';
  const running = shuttleRunsOn(now);

  const departures = useMemo(() => shuttleDeparturesToday(from, now), [from, now]);
  const minutesAway = useMemo(
    () => getNextShuttleMinutes(from, undefined, now),
    [from, now]
  );

  const headline = !running
    ? 'No service today'
    : minutesAway == null
      ? 'No more departures today'
      : `Departs in ${minutesAway} min`;

  return { to, running, departures, minutesAway, headline };
}

/** SGW → Loyola / Loyola → SGW. Direction, not campus: the runs differ. */
export function ShuttleDirectionToggle({
  from,
  onSelect,
}: {
  from: ShuttleCampus;
  onSelect: (campus: ShuttleCampus) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.toggle, { backgroundColor: theme.color.backgroundSubtle }]}>
      {DIRECTIONS.map((campus) => {
        const on = campus === from;
        const other = campus === 'sgw' ? 'loy' : 'sgw';
        return (
          <Pressable
            key={campus}
            onPress={() => onSelect(campus)}
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
  );
}

/**
 * The whole published run for today, gone ones dimmed and the next marked.
 *
 * The full day on purpose: this has to answer "have I missed it", which a
 * list starting at now cannot.
 */
export function ShuttleScheduleGrid({
  from,
  departures,
  onShowStop,
}: {
  from: ShuttleCampus;
  departures: ReturnType<typeof shuttleDeparturesToday>;
  /** Focus the map on this direction's boarding stop. Omit to hide the action. */
  onShowStop?: () => void;
}) {
  const theme = useTheme();

  const rows = useMemo(() => {
    const grid: (typeof departures)[] = [];
    for (let i = 0; i < departures.length; i += COLUMNS) {
      grid.push(departures.slice(i, i + COLUMNS));
    }
    return grid;
  }, [departures]);

  return (
    <>
      <View style={styles.scheduleHead}>
        <Text variant="caption" style={styles.scheduleLabel}>
          Full schedule · today
        </Text>
        <Text variant="caption" color="secondary" style={styles.scheduleMeta}>
          {`~${SHUTTLE_TRIP_MINUTES} min`}
        </Text>
      </View>
      {/*
        The pickup point, named and addressed rather than implied. Knowing the
        bus leaves at 2:30 is no use if you cannot find where it leaves from,
        which is the one thing the timetable alone never says.
      */}
      <Pressable
        onPress={onShowStop}
        disabled={!onShowStop}
        accessibilityRole="button"
        accessibilityLabel={
          onShowStop
            ? `Show the ${SHUTTLE_STOP[from].name} shuttle stop on the map`
            : `${SHUTTLE_STOP[from].name} shuttle stop`
        }
        style={({ pressed }) => [
          styles.stopRow,
          { backgroundColor: theme.color.backgroundSubtle, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <View style={styles.stopText}>
          <Text variant="bodySmall" numberOfLines={1} style={styles.stopName}>
            {SHUTTLE_STOP[from].name}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {SHUTTLE_STOP[from].detail}
          </Text>
        </View>
        {/*
          Stays in the app: the stop is already a pin on the map behind this
          sheet, so showing it there beats handing off to Apple Maps and
          losing the route, the buses and the schedule.
        */}
        {onShowStop ? (
          <View style={[styles.stopAction, { backgroundColor: theme.color.primary }]}>
            <MaterialSymbol
              icon={msLocationOnFill}
              size={16}
              color={theme.color.text.inverse}
            />
            <Text variant="caption" style={styles.stopActionLabel}>
              Show on map
            </Text>
          </View>
        ) : null}
      </Pressable>

      {departures.length === 0 ? (
        <Text variant="bodySmall" color="secondary" style={styles.empty}>
          The shuttle does not run on weekends or holidays. Next service resumes on
          the following weekday.
        </Text>
      ) : (
        <View style={styles.grid}>
          {rows.map((row) => (
            <View key={row[0].value} style={styles.gridRow}>
              {row.map((departure) => (
                <View
                  key={departure.value}
                  accessible
                  accessibilityLabel={
                    departure.next
                      ? `${departure.label}, next departure`
                      : departure.past
                        ? `${departure.label}, departed`
                        : departure.label
                  }
                  style={[
                    styles.slot,
                    {
                      // Tinted, not filled: a solid brand block among grey
                      // slots read as a button rather than as "this one next".
                      backgroundColor: departure.next
                        ? `${theme.color.primary}24`
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
                        color: departure.next
                          ? theme.color.primary
                          : meTheme.headingText,
                      },
                    ]}
                  >
                    {departure.label}
                  </Text>
                </View>
              ))}
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
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 12,
    borderCurve: 'continuous',
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
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  stopText: {
    flex: 1,
    minWidth: 0,
  },
  stopName: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '600',
    color: meTheme.headingText,
  },
  stopAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    borderCurve: 'continuous',
  },
  stopActionLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  empty: {
    marginTop: 12,
  },
});
