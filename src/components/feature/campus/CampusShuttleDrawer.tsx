import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { MaterialSymbol, msClose, msDirectionsBus } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { useNow } from '@/hooks';
import { SHUTTLE_CAMPUS_NAME } from '@/screens/shuttle/shuttleSchedule';
import type { ShuttleCampus } from '@/types/campus';
import {
  GlassIconButton,
  SHEET_CORNER_RADIUS,
  SHEET_DISMISS_DISTANCE,
  SHEET_EXPANDED_HEIGHT_RATIO,
  SHEET_PEEK_HEIGHT_RATIO,
  SHEET_SPRING,
  SheetGlass,
  SheetHandle,
  sheetShadow,
  sheetStyles,
} from './campusSheet';
import {
  ShuttleDirectionToggle,
  ShuttleScheduleGrid,
  useShuttleDeparture,
} from './ShuttleDepartures';

type Props = {
  /** `false` animates the sheet away. */
  open: boolean;
  /** Direction, held by the map so it can pin only the stop you board at. */
  from: ShuttleCampus;
  onSelectFrom: (campus: ShuttleCampus) => void;
  onShowStop: () => void;
  /** Live GPS could not be reached; the timetable below is still good. */
  liveError?: boolean;
  onClose: () => void;
};

/**
 * The shuttle, as a drawer over the map.
 *
 * Same sheet as the building and results drawers — it is the same panel over
 * the same map, answering "when does it go" while the route and the buses
 * themselves are drawn behind it. The timetable is local, so this stays
 * useful even when the live feed is unreachable.
 */
export function CampusShuttleDrawer({
  open,
  from,
  onSelectFrom,
  onShowStop,
  liveError = false,
  onClose,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { height: windowHeight } = useWindowDimensions();

  const sheetMaxHeight = windowHeight * SHEET_EXPANDED_HEIGHT_RATIO;
  const peekHeight = windowHeight * SHEET_PEEK_HEIGHT_RATIO;
  const collapsedOffset = sheetMaxHeight - peekHeight;
  const offscreenOffset = sheetMaxHeight + 48;

  const translateY = useSharedValue(offscreenOffset);
  const dragStartY = useSharedValue(0);
  /** Held past `open` going false so the sheet can animate out. */
  const [mounted, setMounted] = useState(open);

  const { to, departures, minutesAway, headline } = useShuttleDeparture(from, now);

  const finishHide = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      translateY.value = withSpring(collapsedOffset, SHEET_SPRING);
      return;
    }
    if (mounted) {
      translateY.value = withTiming(offscreenOffset, { duration: 200 }, (finished) => {
        if (finished) runOnJS(finishHide)();
      });
    }
  }, [open, collapsedOffset, mounted, finishHide, offscreenOffset, translateY]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.min(
        offscreenOffset,
        Math.max(0, dragStartY.value + event.translationY)
      );
    })
    .onEnd((event) => {
      const y = translateY.value;
      if (
        y > collapsedOffset + SHEET_DISMISS_DISTANCE ||
        (y > collapsedOffset && event.velocityY > 900)
      ) {
        runOnJS(onClose)();
        return;
      }
      const expand = event.velocityY < -600 || (event.velocityY <= 600 && y < collapsedOffset / 2);
      translateY.value = withSpring(expand ? 0 : collapsedOffset, SHEET_SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({ bottom: -translateY.value }));

  if (!mounted) return null;

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Animated.View
        style={[
          sheetStyles.sheet,
          sheetStyle,
          {
            height: sheetMaxHeight,
            borderTopLeftRadius: SHEET_CORNER_RADIUS,
            borderTopRightRadius: SHEET_CORNER_RADIUS,
            borderCurve: 'continuous',
            overflow: 'visible',
            ...sheetShadow,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderTopLeftRadius: SHEET_CORNER_RADIUS,
              borderTopRightRadius: SHEET_CORNER_RADIUS,
              overflow: 'hidden',
            },
          ]}
        >
          <SheetGlass radius={SHEET_CORNER_RADIUS} />
        </View>

        <View style={{ flex: 1, paddingTop: theme.spacing.sm }}>
          {/* Drag on the header only — the schedule below owns its own scroll. */}
          <GestureDetector gesture={pan}>
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <SheetHandle />

              <View style={styles.headRow}>
                <View style={[styles.icon, { backgroundColor: theme.color.primary }]}>
                  <MaterialSymbol
                    icon={msDirectionsBus}
                    size={21}
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
                  <Text variant="body" numberOfLines={2} style={styles.headline}>
                    {`To ${SHUTTLE_CAMPUS_NAME[to]} · ${headline}`}
                  </Text>
                </View>

                <GlassIconButton
                  icon={msClose}
                  label="Close shuttle"
                  onPress={onClose}
                />
              </View>
            </View>
          </GestureDetector>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            <ShuttleDirectionToggle from={from} onSelect={onSelectFrom} />
            <ShuttleScheduleGrid from={from} departures={departures} onShowStop={onShowStop} />

            {liveError ? (
              <Text variant="caption" color="secondary" style={styles.liveError}>
                Live bus positions are unavailable right now. Times below are the
                published schedule.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    // Under the building drawer (20): tapping a stop hands over to that sheet.
    zIndex: 15,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
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
  liveError: {
    marginTop: 16,
  },
});
