import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassActionButton, Screen, Text } from '@/components/design-system';
import { BuildingDrawer } from '@/components/feature/campus/BuildingDrawer';
import { CampusQuickCard } from '@/components/feature/campus/CampusQuickCard';
import { CampusContextCard } from '@/components/feature/campus/CampusContextCard';
import { CampusShuttleDrawer } from '@/components/feature/campus/CampusShuttleDrawer';
import { CampusResultsDrawer } from '@/components/feature/campus/CampusResultsDrawer';
import { SHEET_PEEK_HEIGHT_RATIO } from '@/components/feature/campus/campusSheet';
import {
  CAMPUS_SEARCH_FIELD_HEIGHT,
  CampusSearchBar,
} from '@/components/feature/campus/CampusSearchBar';
import { todayShadowSoft } from '@/components/feature/today/todayShadows';
import { MaterialSymbol, msDirectionsBus, msMyLocation } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { useBuildings } from '@/hooks/useBuildings';
import { useCampusUserLocation, type UserCoords } from '@/hooks/useCampusUserLocation';
import { useShuttleLive } from '@/hooks/useShuttleLive';
import {
  HEADER_BAR_BUTTON_SIZE,
  HEADER_ICON_SIZE,
} from '@/navigation/HeaderIconButton';
import { useTabBarOverlayInset } from '@/navigation/tabBarInset';
import { useHideTabBar } from '@/navigation/tabBarVisibility';
import type { CampusStackScreenProps } from '@/navigation/types';
import { getBuildingCatalogRecord } from '@/data/buildings';
import { resolveCampusContext } from '@/services/campus/campusContext';
import { openAppleMapsDirections } from '@/services/campus/placeActions';
import { useNow } from '@/hooks';
import {
  buildingMatchesMapFilter,
  CAMPUS_FILTER_LABEL,
  walkMinutesFromCoords,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
import { SHUTTLE_STOPS } from '@/services/shuttle/shuttleRoute';
import {
  CAMPUS_MAP_DEFAULTS,
  type BuildingSummary,
  type ShuttleCampus,
} from '@/types/campus';

type Props = CampusStackScreenProps<'CampusHome'>;

const DEFAULT_CAMPUS = CAMPUS_MAP_DEFAULTS.sgw;

const MAP_FOCUS_DELTA = 0.004;

/** Side breathing room when framing pins; top and bottom come from the chrome. */
const FIT_SIDE_PADDING = 48;

/** Below this there is nothing to frame — one pin is a focus, not a fit. */
const FIT_MIN_POINTS = 2;

function regionForBuilding(building: BuildingSummary): Region {
  return {
    latitude: building.lat,
    longitude: building.lng,
    latitudeDelta: MAP_FOCUS_DELTA,
    longitudeDelta: MAP_FOCUS_DELTA,
  };
}

export function CampusHomeScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarOverlayInset = useTabBarOverlayInset();
  const mapRef = useRef<MapView>(null);
  /**
   * Apple Maps fires MapView `onPress` for marker taps too. Defer + swallow so
   * we don't clear selection in the same gesture (which kills the pin scale).
   */
  const swallowNextMapPressRef = useRef(false);
  const locatingRef = useRef(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingSummary | null>(
    null
  );
  const { data: buildings = [], isFetching, isError, isPlaceholderData } =
    useBuildings();
  const { permissionGranted, getCurrentCoords } = useCampusUserLocation();
  const [isLocating, setIsLocating] = useState(false);
  const [mapFilter, setMapFilter] = useState<CampusMapFilter>('buildings');
  const [showShuttle, setShowShuttle] = useState(false);
  /**
   * Which direction the shuttle drawer is showing. Held here, not in the
   * drawer, because the map pins only the stop you board at — the other one is
   * where this bus is going, not where you catch it.
   */
  const [shuttleFrom, setShuttleFrom] = useState<ShuttleCampus>('sgw');
  /**
   * The category showing in the field. Separate from `mapFilter` because
   * `buildings` is both "no filter" and a category a student can pick — only
   * this says whether a category is actually being browsed.
   */
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [coords, setCoords] = useState<UserCoords | null>(null);
  /**
   * Measured rather than derived from a constant: the card's padding and its
   * contents have moved more than once, and a stale number here puts Apple's
   * logo back under it.
   */
  const [quickCardHeight, setQuickCardHeight] = useState(0);
  const { data: shuttleLive, isError: shuttleLiveError } = useShuttleLive(showShuttle);

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: DEFAULT_CAMPUS.defaultLat,
      longitude: DEFAULT_CAMPUS.defaultLng,
      latitudeDelta: DEFAULT_CAMPUS.latitudeDelta,
      longitudeDelta: DEFAULT_CAMPUS.longitudeDelta,
    }),
    []
  );

  /**
   * The one set of results: these are the pins on the map *and* the rows in
   * the drawer. Nearest first once location is known, so the top of the list
   * is the nearest pin.
   */
  const visibleBuildings = useMemo(() => {
    if (showShuttle) {
      return [];
    }
    const campus = buildings.filter((building) => building.campusId === 'sgw');
    const matching =
      mapFilter === 'buildings'
        ? campus
        : campus.filter((building) =>
            buildingMatchesMapFilter(
              getBuildingCatalogRecord(building.campusId, building.code),
              mapFilter
            )
          );
    if (!coords) {
      return matching;
    }
    const from = { lat: coords.latitude, lng: coords.longitude };
    return [...matching].sort(
      (a, b) =>
        walkMinutesFromCoords(from, { lat: a.lat, lng: a.lng }) -
        walkMinutesFromCoords(from, { lat: b.lat, lng: b.lng })
    );
  }, [buildings, mapFilter, coords, showShuttle]);


  /**
   * Hide the native tab bar while either sheet is open so the in-screen sheet
   * can cover that edge without a Modal (which would drop Apple Maps pin
   * selection). The results drawer needs this as much as the building drawer:
   * both are anchored to the bottom edge and would otherwise be clipped by
   * the bar at their peek height.
   *
   * Through the shared flag rather than `getParent().setOptions` — an
   * imperative override outranks the navigator's own `screenOptions`, so
   * setting the bar back here also undid the route rule that hides it for
   * Campus search.
   */
  const sheetOpen =
    selectedBuilding != null || searchLabel != null || showShuttle;

  useHideTabBar(sheetOpen);

  /*
    Apple requires its logo and the Legal link to stay visible. They are
    anchored to the map's bottom-left, and `mapPadding` — MKMapView's
    `layoutMargins` — only holds them off that edge, so the inset lifts them
    clear of whatever is docked there.

    It cannot put them under the search field. That needs an inset of nearly
    the whole screen, and `setRegion:` measures its centre against the margins
    too: the camera then centres in the thin strip left above the inset, which
    is why a building tapped from the list landed near the top of the map
    instead of the middle. The logo's position is not worth every camera move
    being wrong.

    So the attribution is placed by `legalLabelInsets` instead, which sets the
    label's frame origin directly and never touches the camera. The trade is
    that it reaches into a private `MKAttributionLabel` subview by class name —
    the library's own code calls that "super hacky" — so it can stop working on
    an iOS update. `mapPadding` below still lifts whatever it does not move
    clear of the docked card, so nothing is covered either way.
  */
  const { height: windowHeight } = useWindowDimensions();

  /** Just under the search field, aligned to the app's left margin. */
  const legalLabelInsets = useMemo(
    () => ({
      top:
        insets.top +
        theme.spacing.sm +
        CAMPUS_SEARCH_FIELD_HEIGHT +
        theme.spacing.md,
      left: theme.spacing.screenHorizontal,
      right: 0,
      bottom: 0,
    }),
    [insets.top, theme.spacing.sm, theme.spacing.md, theme.spacing.screenHorizontal]
  );

  const dockedBottomInset = sheetOpen
    ? windowHeight * SHEET_PEEK_HEIGHT_RATIO
    : tabBarOverlayInset + quickCardHeight;

  /*
    Keep every relevant pin in frame.

    Markers do not move themselves into view, so at the wrong zoom or after a
    pan you had to hunt for them — most obviously the two shuttle stops, which
    are six kilometres apart and never both visible by accident.

    Keyed on which set is showing rather than on the coordinates: the live bus
    moves every ten seconds and a location fix re-sorts the buildings, and
    re-framing on either would yank the camera out from under you. A selected
    building is skipped outright — that view is deliberately focused.
  */
  const fitKey = showShuttle
    ? 'shuttle'
    : `${mapFilter}|${searchLabel ?? ''}|${visibleBuildings.length}`;

  useEffect(() => {
    if (selectedBuilding) return;

    const points = showShuttle
      ? [SHUTTLE_STOPS.sgw, SHUTTLE_STOPS.loy]
      : visibleBuildings.map((building) => ({
          latitude: building.lat,
          longitude: building.lng,
        }));
    if (points.length < FIT_MIN_POINTS) return;

    const id = requestAnimationFrame(() => {
      mapRef.current?.fitToCoordinates(points, {
        animated: true,
        /*
          The bottom is NOT the docked inset. `mapPadding` already sets
          `layoutMargins`, and MapKit insets the usable area by those before
          applying this — adding the dock again reserved it twice and left
          almost no height to fit into, which pushed the far stop off screen.

          The top still needs stating: `mapPadding.top` is 0, so nothing has
          reserved the floating search field.
        */
        edgePadding: {
          top: insets.top + CAMPUS_SEARCH_FIELD_HEIGHT + theme.spacing.lg,
          bottom: FIT_SIDE_PADDING,
          left: FIT_SIDE_PADDING,
          right: FIT_SIDE_PADDING,
        },
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, selectedBuilding]);

  const mapPadding = useMemo(
    () => ({ top: 0, left: 0, right: 0, bottom: dockedBottomInset }),
    [dockedBottomInset]
  );

  const selectBuilding = useCallback((building: BuildingSummary) => {
    swallowNextMapPressRef.current = true;
    setSelectedBuilding(building);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(regionForBuilding(building), 400);
  }, []);

  /**
   * Apply whatever Campus search handed back, then drop the params — they are
   * a one-shot message, and leaving them set would re-select the building
   * every time this screen regains focus.
   */
  const {
    focusBuildingId,
    mapFilter: requestedFilter,
    searchLabel: requestedLabel,
    showShuttle: requestedShuttle,
  } = route.params ?? {};

  useEffect(() => {
    if (!focusBuildingId && !requestedFilter && !requestedLabel && !requestedShuttle) {
      return;
    }
    if (requestedShuttle) {
      // Shuttle owns the map while it is up, so the category browse stands down.
      setShowShuttle(true);
      setSearchLabel(null);
      setMapFilter('buildings');
      setSelectedBuilding(null);
    }
    if (requestedFilter) {
      setMapFilter(requestedFilter);
    }
    if (requestedLabel) {
      // A category browse, so the detail drawer gives way to the results list.
      setSearchLabel(requestedLabel);
      setSelectedBuilding(null);
    }
    // Buildings may still be loading; wait for the one we were asked to show.
    const target = focusBuildingId
      ? buildings.find((building) => building.id === focusBuildingId)
      : undefined;
    if (focusBuildingId && !target) {
      return;
    }
    if (target) {
      selectBuilding(target);
    }
    navigation.setParams({
      focusBuildingId: undefined,
      mapFilter: undefined,
      searchLabel: undefined,
      showShuttle: undefined,
    });
  }, [
    focusBuildingId,
    requestedFilter,
    requestedLabel,
    requestedShuttle,
    buildings,
    navigation,
    selectBuilding,
  ]);

  /** Read once so the drawer can show and sort by walking distance. */
  useEffect(() => {
    let cancelled = false;
    void getCurrentCoords().then((next) => {
      if (!cancelled && next) setCoords(next);
    });
    return () => {
      cancelled = true;
    };
  }, [getCurrentCoords]);

  /*
    The contextual layer. `resolveCampusContext` ranks the situations that
    apply right now and hands back at most one card; dismissing it suppresses
    that card by id, so a new situation still gets through.
  */
  const now = useNow();
  const [dismissedContextId, setDismissedContextId] = useState<string | null>(null);

  const contextCard = useMemo(() => {
    const card = resolveCampusContext({
      now,
      buildings,
      coords,
      campusId: 'sgw',
    });
    return card && card.id !== dismissedContextId ? card : null;
  }, [now, buildings, coords, dismissedContextId]);

  const onContextDirections = useCallback(() => {
    if (!contextCard?.building) return;
    const target = contextCard.building;
    selectBuilding(target);
    openAppleMapsDirections(target.lat, target.lng, `${target.code} ${target.name}`);
  }, [contextCard, selectBuilding]);

  /**
   * One bus, not the fleet: the one nearest the stop you are boarding at.
   *
   * The live feed gives positions and ids only — no bearing, no route — so a
   * bus cannot be told to be "going to Loyola" from one snapshot. Nearest to
   * your stop is the one that matters to someone standing at it, and it is
   * derivable without guessing at a heading.
   */
  const relevantBus = useMemo(() => {
    const buses = shuttleLive?.vehicles ?? [];
    if (buses.length === 0) return null;
    const stop = SHUTTLE_STOPS[shuttleFrom];
    const from = { lat: stop.latitude, lng: stop.longitude };
    return buses.reduce((closest, bus) =>
      walkMinutesFromCoords(from, { lat: bus.latitude, lng: bus.longitude }) <
      walkMinutesFromCoords(from, { lat: closest.latitude, lng: closest.longitude })
        ? bus
        : closest
    );
  }, [shuttleLive, shuttleFrom]);

  /** Fly to the boarding stop rather than handing off to another maps app. */
  const showShuttleStop = useCallback(() => {
    const stop = SHUTTLE_STOPS[shuttleFrom];
    mapRef.current?.animateToRegion(
      {
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: MAP_FOCUS_DELTA,
        longitudeDelta: MAP_FOCUS_DELTA,
      },
      400
    );
  }, [shuttleFrom]);

  const clearCategory = useCallback(() => {
    setSearchLabel(null);
    setMapFilter('buildings');
  }, []);

  /** Empty-map tap / drawer close — `isPreselected` drives the pin scale down. */
  const clearSelection = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  const onMapPress = useCallback(() => {
    // Marker `onPress` and map `onPress` both fire; wait a tick for the swallow flag.
    setTimeout(() => {
      if (swallowNextMapPressRef.current) {
        swallowNextMapPressRef.current = false;
        return;
      }
      clearSelection();
    }, 0);
  }, [clearSelection]);

  const goToCurrentLocation = useCallback(async () => {
    if (locatingRef.current) {
      return;
    }
    locatingRef.current = true;
    setIsLocating(true);
    try {
      const coords = await getCurrentCoords();
      if (!coords) {
        Alert.alert(
          'Location unavailable',
          'Turn on location access to center the map on you.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => void Linking.openSettings() },
          ]
        );
        return;
      }
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: MAP_FOCUS_DELTA,
          longitudeDelta: MAP_FOCUS_DELTA,
        },
        400
      );
    } finally {
      locatingRef.current = false;
      setIsLocating(false);
    }
  }, [getCurrentCoords]);

  const onPressShuttle = useCallback(() => {
    setSelectedBuilding(null);
    setSearchLabel(null);
    setMapFilter('buildings');
    setShowShuttle((open) => {
      const next = !open;
      if (!next) {
        mapRef.current?.animateToRegion(initialRegion, 400);
      }
      return next;
    });
  }, [initialRegion]);

  /**
   * A pill on the overlay card does what the same pill does in search: fills
   * the field, pins the layer, and turns this card into the results drawer.
   * Tapping the active one is the way back out.
   */
  const onPressFilter = useCallback(
    (filter: CampusMapFilter) => {
      setShowShuttle(false);
      const clearing = searchLabel != null && mapFilter === filter;
      setMapFilter(clearing ? 'buildings' : filter);
      setSearchLabel(clearing ? null : CAMPUS_FILTER_LABEL[filter]);
    },
    [mapFilter, searchLabel]
  );

  const showLoadingChip = isFetching && isPlaceholderData;

  return (
    <Screen safe={false} padded={false}>
      <View style={styles.fill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation={permissionGranted}
          showsMyLocationButton={false}
          showsCompass={false}
          mapPadding={mapPadding}
          legalLabelInsets={legalLabelInsets}
          followsUserLocation={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          onPress={onMapPress}
        >
          {visibleBuildings.map((building) => {
            const selected = selectedBuilding?.id === building.id;
            return (
              <Marker
                key={building.id}
                coordinate={{ latitude: building.lat, longitude: building.lng }}
                identifier={building.id}
                title={building.code}
                titleVisibility="hidden"
                pinColor={theme.color.primary}
                isPreselected={selected}
                stopPropagation
                onPress={() => {
                  selectBuilding(building);
                }}
              />
            );
          })}
          {showShuttle ? (
            <>
              {/*
                Both ends of the route stay pinned, and each carries its code
                rather than a default pin — a callout only appears on tap, so
                an unlabelled pin leaves you guessing which end you are
                looking at.
              */}
              {(shuttleLive?.stops ?? []).map((stop) => (
                <Marker
                  key={stop.id}
                  coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                  identifier={`stop-${stop.id}`}
                  title={stop.title}
                  anchor={{ x: 0.5, y: 0.5 }}
                  stopPropagation
                >
                  <View
                    style={[
                      styles.stopMarker,
                      { backgroundColor: theme.color.primary },
                    ]}
                  >
                    <Text variant="caption" style={styles.stopMarkerLabel}>
                      {stop.id.toUpperCase()}
                    </Text>
                  </View>
                </Marker>
              ))}
              {(relevantBus ? [relevantBus] : []).map((bus) => (
                <Marker
                  key={bus.id}
                  coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
                  identifier={bus.id}
                  title="Shuttle"
                  anchor={{ x: 0.5, y: 0.5 }}
                  stopPropagation
                >
                  <View
                    style={[
                      styles.shuttleMarker,
                      { backgroundColor: theme.color.primary },
                    ]}
                  >
                    <MaterialSymbol
                      icon={msDirectionsBus}
                      size={18}
                      color={theme.color.text.inverse}
                    />
                  </View>
                </Marker>
              ))}
            </>
          ) : null}
        </MapView>

        <View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + theme.spacing.sm,
              paddingHorizontal: theme.spacing.screenHorizontal,
              paddingBottom: tabBarOverlayInset,
            },
          ]}
        >
          <View pointerEvents="box-none">
            {/*
              Campus keeps its own search rather than the header action the
              other tabs use: this one opens map-first — places above courses
              and services — and a place hit comes back here as a selected pin
              instead of navigating away from the map.
            */}
            <CampusSearchBar
              onPress={() => navigation.navigate('CampusSearch')}
              value={searchLabel}
              onClear={clearCategory}
              style={{ marginBottom: theme.spacing.sm }}
            />

            {showLoadingChip ? (
              <Text
                variant="caption"
                color="secondary"
                pointerEvents="none"
                style={[
                  styles.statusChip,
                  {
                    marginTop: theme.spacing.sm,
                    backgroundColor: theme.color.background,
                    borderRadius: theme.radius.md,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                Loading buildings…
              </Text>
            ) : null}
            {isError ? (
              <Text
                variant="caption"
                color="secondary"
                pointerEvents="none"
                style={[
                  styles.statusChip,
                  {
                    marginTop: theme.spacing.sm,
                    backgroundColor: theme.color.background,
                    borderRadius: theme.radius.md,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                Showing offline building list
              </Text>
            ) : null}
            {showShuttle && shuttleLiveError ? (
              <Text
                variant="caption"
                color="secondary"
                pointerEvents="none"
                style={[
                  styles.statusChip,
                  {
                    marginTop: theme.spacing.sm,
                    backgroundColor: theme.color.background,
                    borderRadius: theme.radius.md,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                Shuttle location unavailable
              </Text>
            ) : null}
          </View>

          <View style={styles.overlaySpacer} pointerEvents="none" />

          {/*
            Above the card and hard right, which leaves the map's bottom-left
            free for Apple's logo — the two now sit either side of the card's
            top edge rather than fighting for the same corner.
          */}
            <View
              pointerEvents="box-none"
              style={[styles.locateRow, { marginBottom: theme.spacing.sm }]}
            >
              <View
                style={[
                  todayShadowSoft,
                  radiusStyle(HEADER_BAR_BUTTON_SIZE / 2),
                ]}
              >
                <GlassActionButton
                  accessibilityLabel="Go to current location"
                  accessibilityState={{ busy: isLocating }}
                  colorScheme="light"
                  tintColor="rgba(255,255,255,0.35)"
                  fallbackBackgroundColor="rgba(255,255,255,0.82)"
                  disabled={isLocating}
                  onPress={() => {
                    void goToCurrentLocation();
                  }}
                  style={[
                    styles.locateButton,
                    radiusStyle(HEADER_BAR_BUTTON_SIZE / 2),
                  ]}
                >
                  {isLocating ? (
                    <ActivityIndicator color={theme.color.primary} />
                  ) : (
                    <MaterialSymbol
                      icon={msMyLocation}
                      size={HEADER_ICON_SIZE}
                      color={theme.color.text.brand}
                    />
                  )}
                </GlassActionButton>
              </View>
            </View>

          {/*
            A live situation outranks the resting card: the quick card is what
            the map shows when it has nothing to say.
          */}
          {sheetOpen || !contextCard ? null : (
            <View style={{ marginHorizontal: -theme.spacing.sm }}>
              <CampusContextCard
                card={contextCard}
                onPrimaryPress={onContextDirections}
                onDismiss={() => setDismissedContextId(contextCard.id)}
              />
            </View>
          )}

          {/* Yields to either sheet — both draw over this overlay, not in it. */}
          {sheetOpen || contextCard ? null : (
            <View
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setQuickCardHeight((current) =>
                  Math.abs(current - height) < 1 ? current : height
                );
              }}
            >
            <CampusQuickCard
              campusName="SGW campus"
              activeFilter={mapFilter}
              shuttleActive={showShuttle}
              onPressShuttle={onPressShuttle}
              onPressFilter={onPressFilter}
            />
            </View>
          )}
        </View>

        {/*
          Both sheets sit outside the overlay so they can own the full screen
          and animate from off the bottom edge. Only one is ever up: picking a
          building from the results hands over to its drawer, and closing that
          hands back.
        */}
        <CampusShuttleDrawer
          open={showShuttle && selectedBuilding == null}
          from={shuttleFrom}
          onSelectFrom={setShuttleFrom}
          onShowStop={showShuttleStop}
          liveError={shuttleLiveError}
          onClose={() => setShowShuttle(false)}
        />

        <CampusResultsDrawer
          title={selectedBuilding ? null : searchLabel}
          buildings={visibleBuildings}
          coords={coords}
          onSelectBuilding={selectBuilding}
          onClose={clearCategory}
        />

        <BuildingDrawer building={selectedBuilding} onClose={clearSelection} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlaySpacer: {
    flex: 1,
  },
  locateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  locateButton: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
  },
  statusChip: {
    overflow: 'hidden',
  },
  stopMarker: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stopMarkerLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  shuttleMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
