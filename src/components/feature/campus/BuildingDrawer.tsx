import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
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
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from '@/navigation/HeaderIconButton';
import {
  MaterialSymbol,
  msBookmark,
  msBookmarkFill,
  msClose,
  msDirections,
  msDoorFront,
  msElevator,
  msGridView,
  msLocalCafe,
  msLocalParking,
  msPedalBike,
  msPrint,
  msScheduleClock,
  msStorefront,
  msWc,
  msAccessible,
} from '@/components/icons';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { useTheme } from '@/design-system/theme';
import { useBuildingEnrichment, useBuildingPlace } from '@/hooks';
import {
  buildAmenityRows,
  buildWhatsHereRows,
  shortHoursLabel,
} from '@/services/campus/buildingPresentation';
import {
  openAppleMapsDirections,
  openAppleMapsPlace,
  openBuildingWebsite,
} from '@/services/campus/placeActions';
import { CAMPUS_MAP_DEFAULTS, type BuildingSummary } from '@/types/campus';

type Props = {
  building: BuildingSummary | null;
  onClose: () => void;
};

const DISMISS_DISTANCE = 120;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
const PEEK_HEIGHT_RATIO = 0.38;
const EXPANDED_HEIGHT_RATIO = 0.78;
const SHEET_GLASS_TINT = 'rgba(255,255,255,0.55)';
/** Larger than `theme.radius.xl` (12) so the sheet reads as a rounded iOS panel. */
const SHEET_CORNER_RADIUS = 32;

const WHATS_HERE_BADGE: Record<string, string> = {
  venues: 'VEN',
  services: 'SVC',
  departments: 'DEP',
  overview: 'INFO',
};

function formatStatusLine(
  hoursSummary: string | null,
  accessHours: string[] | undefined
): { kind: 'open' | 'text' | 'maps'; value: string } {
  if (hoursSummary) {
    return { kind: 'open', value: hoursSummary };
  }
  if (accessHours?.length) {
    return { kind: 'text', value: accessHours.join(' · ') };
  }
  return { kind: 'maps', value: 'Apple Maps' };
}

function amenityIcon(id: string): MsIconDefinition {
  switch (id) {
    case 'accessible':
      return msAccessible;
    case 'cafe':
      return msLocalCafe;
    case 'elevator':
      return msElevator;
    case 'washrooms':
      return msWc;
    case 'print':
      return msPrint;
    case 'bike':
      return msPedalBike;
    case 'parking':
      return msLocalParking;
    case 'vending':
      return msStorefront;
    default:
      return msStorefront;
  }
}

function SheetGlass({ radius }: { radius: number }) {
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  if (useGlass) {
    return (
      <GlassView
        pointerEvents="none"
        isInteractive={false}
        glassEffectStyle="regular"
        colorScheme="light"
        tintColor={SHEET_GLASS_TINT}
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderCurve: 'continuous',
          },
        ]}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        pointerEvents="none"
        intensity={72}
        tint="systemChromeMaterialLight"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderCurve: 'continuous',
          },
        ]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderCurve: 'continuous',
        },
      ]}
    />
  );
}

function GlassIconButton({
  icon,
  label,
  onPress,
}: {
  icon: MsIconDefinition;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButtonOuter,
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      {useGlass ? (
        <GlassView
          isInteractive
          glassEffectStyle="regular"
          colorScheme="light"
          tintColor="rgba(255,255,255,0.35)"
          style={styles.iconButtonSurface}
        >
          <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={theme.color.text.brand} />
        </GlassView>
      ) : (
        <View
          style={[
            styles.iconButtonSurface,
            { backgroundColor: 'rgba(255,255,255,0.82)' },
          ]}
        >
          <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={theme.color.text.brand} />
        </View>
      )}
    </Pressable>
  );
}

const ACTION_TILE_RADIUS = 16;

function PrimaryAction({
  label,
  icon,
  onPress,
  primary,
}: {
  label: string;
  icon: MsIconDefinition;
  onPress: () => void;
  primary?: boolean;
}) {
  const theme = useTheme();
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  const tile = primary ? (
    <View
      style={[
        styles.actionTileSurface,
        { backgroundColor: theme.color.primary },
      ]}
    >
      <MaterialSymbol icon={icon} size={22} color={theme.color.text.inverse} />
      <Text
        variant="caption"
        style={{ color: theme.color.text.inverse, fontWeight: '600', marginTop: 6 }}
      >
        {label}
      </Text>
    </View>
  ) : useGlass ? (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme="light"
      tintColor="rgba(255,255,255,0.42)"
      style={styles.actionTileSurface}
    >
      <MaterialSymbol icon={icon} size={22} color={theme.color.text.brand} />
      <Text
        variant="caption"
        color="primary"
        style={{ fontWeight: '600', marginTop: 6 }}
      >
        {label}
      </Text>
    </GlassView>
  ) : (
    <View
      style={[
        styles.actionTileSurface,
        { backgroundColor: theme.color.background },
      ]}
    >
      <MaterialSymbol icon={icon} size={22} color={theme.color.text.brand} />
      <Text
        variant="caption"
        color="primary"
        style={{ fontWeight: '600', marginTop: 6 }}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <View
      collapsable={false}
      style={[
        styles.actionTileWrap,
        primary ? styles.actionTileShadowBrand : styles.actionTileShadow,
        {
          backgroundColor: primary ? theme.color.primary : theme.color.background,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionTile,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        {tile}
      </Pressable>
    </View>
  );
}

function LibrarySection({
  hours,
  computers,
  rooms,
}: {
  hours: ReturnType<typeof useBuildingPlace>['hours'];
  computers: ReturnType<typeof useBuildingPlace>['computers'];
  rooms: ReturnType<typeof useBuildingPlace>['rooms'];
}) {
  const theme = useTheme();
  const computerCampus = computers;
  const desktopEntries = computerCampus?.Desktops
    ? Object.entries(computerCampus.Desktops)
    : [];
  const hasComputers =
    Boolean(computerCampus?.Laptops) ||
    Boolean(computerCampus?.Tablets) ||
    desktopEntries.length > 0;

  if (!hours.length && !hasComputers && !rooms.length) {
    return null;
  }

  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <Text variant="caption" color="secondary" style={styles.sectionLabel}>
        Library
      </Text>

      {hours.length > 0 ? (
        <View style={{ gap: 4, marginTop: theme.spacing.sm }}>
          {hours.map((row) => (
            <Text key={row.service} variant="bodySmall" color="secondary">
              {row.service}: {row.text}
            </Text>
          ))}
        </View>
      ) : null}

      {hasComputers && computerCampus ? (
        <View style={{ gap: 4, marginTop: theme.spacing.sm }}>
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
      ) : null}

      {rooms.length > 0 ? (
        <View style={{ gap: 4, marginTop: theme.spacing.sm }}>
          {rooms.map((room) => (
            <Text key={room.name} variant="bodySmall" color="secondary">
              {room.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
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
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const librarySectionY = useRef(0);

  const place = useBuildingPlace(displayed);
  const { walkMinutes } = useBuildingEnrichment(displayed);

  const finishHide = useCallback(() => {
    setDisplayed(null);
    setSaved(false);
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
    bottom: -translateY.value,
  }));

  const amenityRows = useMemo(
    () => buildAmenityRows(place.catalog, place.services),
    [place.catalog, place.services]
  );
  const whatsHereRows = useMemo(
    () => buildWhatsHereRows(place.catalog, place.services, place.departments),
    [place.catalog, place.departments, place.services]
  );

  if (!displayed) {
    return null;
  }

  const address = displayed.address ?? place.catalog?.address ?? '';
  const directionsLabel = `${displayed.code} ${displayed.name}`;
  const campusLabel = CAMPUS_MAP_DEFAULTS[displayed.campusId].name;
  const campusShort = displayed.campusId === 'sgw' ? 'SGW' : 'Loyola';
  const placeKind = place.catalog?.library ? 'Library' : 'Building';
  const metaLine = `${placeKind} · ${campusShort}`;
  const bottomPad = insets.bottom + theme.spacing.md;
  const hoursSummary = place.catalog?.library
    ? shortHoursLabel(place.hours)
    : null;
  const statusLine = formatStatusLine(hoursSummary, place.catalog?.accessHours);
  const sourceUrl = place.catalog?.sourceUrl;
  const imageUrl = place.catalog?.imageUrl;

  const openHours = () => {
    if (place.catalog?.library && place.hours.length > 0) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, librarySectionY.current - theme.spacing.md),
        animated: true,
      });
      return;
    }
    openAppleMapsPlace(displayed.lat, displayed.lng, directionsLabel);
  };

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Animated.View
        style={[
          styles.sheet,
          sheetStyle,
          {
            height: sheetMaxHeight,
            borderTopLeftRadius: SHEET_CORNER_RADIUS,
            borderTopRightRadius: SHEET_CORNER_RADIUS,
            borderCurve: 'continuous',
            overflow: 'visible',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
              },
              android: { elevation: 12 },
            }),
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

        <View
          style={{
            flex: 1,
            overflow: 'visible',
            paddingBottom: bottomPad,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
          }}
        >
          <GestureDetector gesture={pan}>
            <View>
              <View style={styles.handleRow}>
                <View
                  style={[styles.handle, { backgroundColor: theme.color.border }]}
                />
              </View>

              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.codeBadge,
                    { backgroundColor: theme.color.backgroundSubtle },
                  ]}
                >
                  <Text variant="heading3" color="brand" style={{ fontWeight: '700' }}>
                    {displayed.code}
                  </Text>
                </View>

                <View style={styles.headerText}>
                  <Text variant="caption" color="brand" style={{ fontWeight: '600' }}>
                    {metaLine}
                  </Text>
                  <Text variant="heading2" color="primary" style={{ marginTop: 2 }}>
                    {displayed.name}
                  </Text>
                  {displayed.longName && displayed.longName !== displayed.name ? (
                    <Text
                      variant="bodySmall"
                      color="secondary"
                      style={{ marginTop: 2 }}
                    >
                      {displayed.longName}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.headerActions}>
                  <GlassIconButton
                    icon={saved ? msBookmarkFill : msBookmark}
                    label={saved ? 'Remove bookmark' : 'Bookmark building'}
                    onPress={() => setSaved((value) => !value)}
                  />
                  <GlassIconButton
                    icon={msClose}
                    label="Close building details"
                    onPress={dismiss}
                  />
                </View>
              </View>

              {address ? (
                <View style={[styles.quickInfo, { marginTop: theme.spacing.md }]}>
                  <Text variant="bodySmall" color="secondary">
                    {address}
                    {walkMinutes != null ? (
                      <>
                        {' · '}
                        <Text variant="bodySmall" color="brand" style={{ fontWeight: '600' }}>
                          {walkMinutes} min walk
                        </Text>
                      </>
                    ) : null}
                  </Text>
                  <Text
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: 4 }}
                  >
                    {statusLine.kind === 'open' ? (
                      (() => {
                        const untilMatch = statusLine.value.match(/^open\s+until\s+(.+)/i);
                        if (untilMatch) {
                          return (
                            <Text variant="bodySmall" color="secondary">
                              <Text
                                variant="bodySmall"
                                style={{ color: theme.color.success, fontWeight: '600' }}
                              >
                                Open
                              </Text>
                              {` until ${untilMatch[1]}`}
                            </Text>
                          );
                        }
                        return (
                          <Text variant="bodySmall" color="secondary">
                            {statusLine.value}
                          </Text>
                        );
                      })()
                    ) : statusLine.kind === 'text' ? (
                      statusLine.value
                    ) : (
                      <>
                        Hours in{' '}
                        <Text
                          variant="bodySmall"
                          color="brand"
                          style={{ fontWeight: '600' }}
                          onPress={() =>
                            openAppleMapsPlace(
                              displayed.lat,
                              displayed.lng,
                              directionsLabel
                            )
                          }
                        >
                          {statusLine.value}
                        </Text>
                      </>
                    )}
                  </Text>
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    {campusLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          </GestureDetector>

          <View style={[styles.actionRow, { marginTop: theme.spacing.md }]}>
            <PrimaryAction
              label="Directions"
              icon={msDirections}
              primary
              onPress={() =>
                openAppleMapsDirections(
                  displayed.lat,
                  displayed.lng,
                  directionsLabel
                )
              }
            />
            <PrimaryAction
              label="Entrances"
              icon={msDoorFront}
              onPress={() =>
                openAppleMapsPlace(displayed.lat, displayed.lng, directionsLabel)
              }
            />
            <PrimaryAction
              label="Floor plan"
              icon={msGridView}
              onPress={() => {
                if (sourceUrl) {
                  openBuildingWebsite(sourceUrl);
                } else {
                  openAppleMapsPlace(displayed.lat, displayed.lng, directionsLabel);
                }
              }}
            />
            <PrimaryAction label="Hours" icon={msScheduleClock} onPress={openHours} />
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.body}
            contentContainerStyle={{ paddingBottom: theme.spacing.sm, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            bounces={false}
          >
            {imageUrl ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: theme.spacing.sm,
                  paddingVertical: theme.spacing.md,
                }}
                style={{ marginHorizontal: -theme.spacing.xs }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  accessibilityLabel={`Photo of ${displayed.name}`}
                  style={[
                    styles.heroImage,
                    {
                      borderRadius: theme.radius.lg,
                      backgroundColor: theme.color.backgroundSubtle,
                    },
                  ]}
                  resizeMode="cover"
                />
              </ScrollView>
            ) : null}

            {amenityRows.length > 0 ? (
              <View>
                <Text variant="caption" color="secondary" style={styles.sectionLabel}>
                  Amenities
                </Text>
                <View style={styles.amenityGrid}>
                  {amenityRows.map((row) => (
                    <View key={row.id} style={styles.amenityCell}>
                      <MaterialSymbol
                        icon={amenityIcon(row.id)}
                        size={18}
                        color={theme.color.text.secondary}
                      />
                      <Text variant="bodySmall" color="primary" style={{ flex: 1 }}>
                        {row.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {whatsHereRows.length > 0 ? (
              <View style={{ marginTop: theme.spacing.lg }}>
                <Text variant="caption" color="secondary" style={styles.sectionLabel}>
                  What&apos;s here
                </Text>
                <View style={{ marginTop: theme.spacing.sm }}>
                  {whatsHereRows.map((row, index) => (
                    <View
                      key={row.id}
                      style={[
                        styles.whatsHereRow,
                        index > 0 && {
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: theme.color.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.whatsHereBadge,
                          { backgroundColor: theme.color.backgroundSubtle },
                        ]}
                      >
                        <Text variant="caption" color="brand" style={{ fontWeight: '700' }}>
                          {WHATS_HERE_BADGE[row.id] ?? row.label.slice(0, 3).toUpperCase()}
                        </Text>
                      </View>
                      <Text variant="bodySmall" color="secondary" style={{ flex: 1 }}>
                        {row.detail}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View
              onLayout={(event) => {
                librarySectionY.current = event.nativeEvent.layout.y;
              }}
            >
              {place.catalog?.library ? (
                <LibrarySection
                  hours={place.hours}
                  computers={place.computers}
                  rooms={place.rooms}
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
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
  codeBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    paddingTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButtonOuter: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
  },
  iconButtonSurface: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quickInfo: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingBottom: 18,
  },
  actionTileWrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: ACTION_TILE_RADIUS,
    borderCurve: 'continuous',
  },
  actionTileShadow: {
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    ...Platform.select({
      android: { elevation: 3 },
      default: {},
    }),
  },
  actionTileShadowBrand: {
    boxShadow: '0px 4px 10px rgba(145, 35, 56, 0.2)',
    ...Platform.select({
      android: { elevation: 4 },
      default: {},
    }),
  },
  actionTile: {
    borderRadius: ACTION_TILE_RADIUS,
    borderCurve: 'continuous',
  },
  actionTileSurface: {
    borderRadius: ACTION_TILE_RADIUS,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  heroImage: {
    width: 280,
    height: 156,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  amenityCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingRight: 8,
  },
  whatsHereRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  whatsHereBadge: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
});
