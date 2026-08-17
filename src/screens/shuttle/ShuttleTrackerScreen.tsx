import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { MaterialSymbol, msDirectionsBus } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useNow } from '@/hooks';
import {
  ShuttleDirectionToggle,
  ShuttleScheduleGrid,
  useShuttleDeparture,
} from '@/components/feature/campus/ShuttleDepartures';
import { meTheme } from '@/screens/me/meTheme';
import type { ShuttleCampus } from '@/types/campus';
import { SHUTTLE_CAMPUS_NAME } from './shuttleSchedule';

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

  const { to, departures, minutesAway, headline } = useShuttleDeparture(from, now);

  return (
    <View style={[styles.root, { backgroundColor: meTheme.pageBackground }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headRow}>
          <View style={[styles.icon, { backgroundColor: theme.color.primary }]}>
            <MaterialSymbol icon={msDirectionsBus} size={22} color={theme.color.text.inverse} />
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

        <View style={styles.panel}>
          <ShuttleDirectionToggle from={from} onSelect={setFrom} />
          <ShuttleScheduleGrid from={from} departures={departures} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    marginTop: 20,
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
});
