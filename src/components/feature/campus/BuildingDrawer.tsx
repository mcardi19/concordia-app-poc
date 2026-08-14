import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
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
import { MaterialSymbol, msClose } from '@/components/icons';
import { getCardSurfaceStyle, radiusStyle, useTheme } from '@/design-system/theme';
import { useBuildingPlace } from '@/hooks/useBuildingPlace';
import {
  copyText,
  openAppleMapsDirections,
  openGoogleMapsDirections,
} from '@/services/campus/placeActions';
import type { BuildingSummary } from '@/types/campus';

type Props = {
  building: BuildingSummary | null;
  onClose: () => void;
};

const DISMISS_DISTANCE = 120;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
/** Collapsed peek height as a fraction of the window — same for every building. */
const PEEK_HEIGHT_RATIO = 0.36;
/** Fully expanded sheet height as a fraction of the window. */
const EXPANDED_HEIGHT_RATIO = 0.62;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text
        variant="caption"
        color="brand"
        style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function PlainList({ items }: { items: string[] }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {items.map((item) => (
        <Text key={item} variant="bodySmall" color="secondary">
          {item}
        </Text>
      ))}
    </View>
  );
}

function ActionChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: theme.color.backgroundSubtle,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      })}
    >
      <Text variant="caption" color="primary" style={{ fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Bottom sheet only — no dimming scrim so the map stays visible and tappable.
 * Dismiss via close, drag-down, or map tap (handled by the screen).
 */
export function BuildingDrawer({ building, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = windowHeight * EXPANDED_HEIGHT_RATIO;
  const peekHeight = windowHeight * PEEK_HEIGHT_RATIO;
  const collapsedOffset = sheetMaxHeight - peekHeight;
  const offscreenOffset = sheetMaxHeight + 48;

  const translateY = useSharedValue(offscreenOffset);
  const dragStartY = useSharedValue(0);
  const [displayed, setDisplayed] = useState<BuildingSummary | null>(building);
  const place = useBuildingPlace(displayed);

  const finishHide = useCallback(() => {
    setDisplayed(null);
  }, []);

  useEffect(() => {
    if (building) {
      setDisplayed(building);
      translateY.value = withSpring(collapsedOffset, SPRING);
      return;
    }
    if (displayed) {
      translateY.value = withTiming(offscreenOffset, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(finishHide)();
        }
      });
    }
  }, [
    building,
    collapsedOffset,
    displayed,
    finishHide,
    offscreenOffset,
    translateY,
  ]);

  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

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
        y > collapsedOffset + DISMISS_DISTANCE ||
        (y > collapsedOffset && event.velocityY > 900)
      ) {
        runOnJS(onClose)();
        return;
      }

      const snapToExpanded =
        event.velocityY < -600 || (event.velocityY <= 600 && y < midSnap);
      translateY.value = withSpring(snapToExpanded ? 0 : collapsedOffset, SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!displayed) {
    return null;
  }

  const address = displayed.address ?? place.catalog?.address;
  const directionsLabel = `${displayed.code} ${displayed.name}`;
  const bottomPad = insets.bottom + theme.spacing.md;
  const computerCampus = place.computers;
  const desktopEntries = computerCampus?.Desktops
    ? Object.entries(computerCampus.Desktops)
    : [];
  const hasComputers =
    Boolean(computerCampus?.Laptops) ||
    Boolean(computerCampus?.Tablets) ||
    desktopEntries.length > 0;

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Animated.View
        style={[
          styles.sheet,
          sheetStyle,
          getCardSurfaceStyle(theme, 'high', {
            ...radiusStyle(theme.radius.xl),
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingBottom: bottomPad,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
            height: sheetMaxHeight,
          }),
        ]}
      >
        <GestureDetector gesture={pan}>
          <View>
            <View style={styles.handleRow}>
              <View
                style={[styles.handle, { backgroundColor: theme.color.border }]}
              />
            </View>

            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text variant="caption" color="brand" style={{ marginBottom: 2 }}>
                  {displayed.code}
                </Text>
                <Text variant="heading2" color="primary">
                  {displayed.name}
                </Text>
                {displayed.longName && displayed.longName !== displayed.name ? (
                  <Text
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {displayed.longName}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close building details"
                hitSlop={8}
                onPress={dismiss}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.color.backgroundSubtle,
                    borderRadius: theme.radius.full,
                  },
                ]}
              >
                <MaterialSymbol
                  icon={msClose}
                  size={20}
                  color={theme.color.text.secondary}
                />
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: theme.spacing.sm, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          bounces={false}
        >
          {address ? (
            <Text
              variant="body"
              color="secondary"
              style={{ marginTop: theme.spacing.md }}
            >
              {address}
            </Text>
          ) : null}

          <View
            style={[
              styles.actionRow,
              { marginTop: theme.spacing.md, gap: theme.spacing.xs },
            ]}
          >
            {address ? (
              <ActionChip
                label="Copy address"
                onPress={() => {
                  void copyText(address);
                }}
              />
            ) : null}
            <ActionChip
              label="Apple Maps"
              onPress={() =>
                openAppleMapsDirections(displayed.lat, displayed.lng, directionsLabel)
              }
            />
            <ActionChip
              label="Google Maps"
              onPress={() =>
                openGoogleMapsDirections(displayed.lat, displayed.lng)
              }
            />
          </View>

          {place.services.length > 0 ? (
            <Section title="Services">
              <PlainList items={place.services} />
            </Section>
          ) : null}

          {place.departments.length > 0 ? (
            <Section title="Departments">
              <PlainList items={place.departments} />
            </Section>
          ) : null}

          {place.catalog?.library ? (
            <>
              {place.hours.length > 0 ? (
                <Section title="Library hours">
                  <View style={{ gap: 4 }}>
                    {place.hours.map((row) => (
                      <Text key={row.service} variant="bodySmall" color="secondary">
                        {row.service}: {row.text}
                      </Text>
                    ))}
                  </View>
                </Section>
              ) : null}

              {hasComputers && computerCampus ? (
                <Section title="Computers">
                  <View style={{ gap: 4 }}>
                    {computerCampus.Laptops ? (
                      <Text variant="bodySmall" color="secondary">
                        Laptops: {computerCampus.Laptops}
                      </Text>
                    ) : null}
                    {computerCampus.Tablets ? (
                      <Text variant="bodySmall" color="secondary">
                        Tablets: {computerCampus.Tablets}
                      </Text>
                    ) : null}
                    {desktopEntries.map(([room, count]) => (
                      <Text key={room} variant="bodySmall" color="secondary">
                        {room}: {count} desktops
                      </Text>
                    ))}
                  </View>
                </Section>
              ) : null}

              {place.rooms.length > 0 ? (
                <Section title="Rooms">
                  <PlainList items={place.rooms.map((room) => room.name)} />
                </Section>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
