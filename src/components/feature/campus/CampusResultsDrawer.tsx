import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { msCloseSemibold } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { walkMinutesFromCoords } from '@/services/campus/buildingPresentation';
import type { BuildingSummary } from '@/types/campus';
import type { UserCoords } from '@/hooks/useCampusUserLocation';
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

type Props = {
  /** The active category. `null` animates the sheet away. */
  title: string | null;
  buildings: BuildingSummary[];
  coords: UserCoords | null;
  onSelectBuilding: (building: BuildingSummary) => void;
  onClose: () => void;
};

/** "4 min walk" once we can measure, the street address until then. */
function meta(building: BuildingSummary, coords: UserCoords | null): string {
  if (coords) {
    const minutes = walkMinutesFromCoords(
      { lat: coords.latitude, lng: coords.longitude },
      { lat: building.lat, lng: building.lng }
    );
    return `${minutes} min walk`;
  }
  return building.address ?? building.longName ?? building.code;
}

/**
 * The results for an active category.
 *
 * The same sheet the building drawer uses — same glass, corner, snap points
 * and spring, from `campusSheet` — because it is the same panel over the same
 * map, just answering "which ones" instead of "this one". Every row here is
 * also a pin behind it, so the peek height matters: the list and the map are
 * two views of one answer and both need to be readable at rest.
 */
export function CampusResultsDrawer({
  title,
  buildings,
  coords,
  onSelectBuilding,
  onClose,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = windowHeight * SHEET_EXPANDED_HEIGHT_RATIO;
  const peekHeight = windowHeight * SHEET_PEEK_HEIGHT_RATIO;
  const collapsedOffset = sheetMaxHeight - peekHeight;
  const offscreenOffset = sheetMaxHeight + 48;

  const translateY = useSharedValue(offscreenOffset);
  const dragStartY = useSharedValue(0);
  /** Held past `title` going null so the sheet can animate out before unmounting. */
  const [displayed, setDisplayed] = useState<string | null>(title);
  const scrollRef = useRef<ScrollView>(null);

  const finishHide = useCallback(() => setDisplayed(null), []);

  useEffect(() => {
    if (title) {
      setDisplayed(title);
      // A new category starts at the top of its own list.
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      translateY.value = withSpring(collapsedOffset, SHEET_SPRING);
      return;
    }
    if (displayed) {
      translateY.value = withTiming(offscreenOffset, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(finishHide)();
        }
      });
    }
  }, [title, collapsedOffset, displayed, finishHide, offscreenOffset, translateY]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = dragStartY.value + event.translationY;
      translateY.value = Math.min(offscreenOffset, Math.max(0, next));
    })
    .onEnd((event) => {
      const y = translateY.value;
      const midSnap = collapsedOffset / 2;

      if (
        y > collapsedOffset + SHEET_DISMISS_DISTANCE ||
        (y > collapsedOffset && event.velocityY > 900)
      ) {
        runOnJS(onClose)();
        return;
      }

      const snapToExpanded =
        event.velocityY < -600 || (event.velocityY <= 600 && y < midSnap);
      translateY.value = withSpring(snapToExpanded ? 0 : collapsedOffset, SHEET_SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    bottom: -translateY.value,
  }));

  if (!displayed) {
    return null;
  }

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
          {/*
            The drag lives on the handle and header only. The list below owns
            its own vertical gesture, and a pan wrapped around both would
            fight it on every scroll.
          */}
          <GestureDetector gesture={pan}>
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <SheetHandle />

              <View style={styles.headerRow}>
                <View style={styles.headerText}>
                  <Text variant="caption" color="brand" style={styles.eyebrow}>
                    {`${buildings.length} on the map`}
                  </Text>
                  <Text variant="heading2" color="primary" numberOfLines={1}>
                    {displayed}
                  </Text>
                </View>
                <GlassIconButton
                  icon={msCloseSemibold}
                  label={`Close ${displayed} results`}
                  onPress={onClose}
                />
              </View>
            </View>
          </GestureDetector>

          {buildings.length === 0 ? (
            <Text
              variant="body"
              color="secondary"
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                fontSize: 13.5,
                lineHeight: 13.5 * 1.4,
              }}
            >
              Nothing on this campus matches that yet.
            </Text>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: theme.spacing.sm,
                paddingBottom: insets.bottom + theme.spacing.xl,
              }}
            >
              {buildings.map((building, index) => (
                <Pressable
                  key={building.id}
                  onPress={() => onSelectBuilding(building)}
                  accessibilityRole="button"
                  accessibilityLabel={`${building.code}, ${building.name}`}
                  style={({ pressed }) => [
                    styles.row,
                    { paddingHorizontal: theme.spacing.lg },
                    index > 0
                      ? {
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: theme.color.borderSubtle,
                        }
                      : null,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <View
                    style={[styles.codeBadge, { backgroundColor: theme.color.backgroundSubtle }]}
                  >
                    <Text variant="bodySmall" color="brand" style={styles.codeLabel}>
                      {building.code}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text
                      variant="body"
                      color="primary"
                      numberOfLines={1}
                      style={[
                        styles.rowTitle,
                        { fontSize: 16, lineHeight: 16 * 1.25 },
                      ]}
                    >
                      {building.name}
                    </Text>
                    <Text
                      variant="body"
                      color="secondary"
                      numberOfLines={1}
                      style={{ fontSize: 13.5, lineHeight: 13.5 * 1.4, marginTop: 2 }}
                    >
                      {meta(building, coords)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    // Under the building drawer (20): tapping a row hands over to that sheet.
    zIndex: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontWeight: '600',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  codeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: {
    fontWeight: '700',
    fontSize: 13.5,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: '600',
  },
});
