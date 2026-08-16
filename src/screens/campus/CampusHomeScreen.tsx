import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassActionButton, Screen, Text } from '@/components/design-system';
import { BuildingDrawer } from '@/components/feature/campus/BuildingDrawer';
import { CampusQuickCard } from '@/components/feature/campus/CampusQuickCard';
import { CampusResultsDrawer } from '@/components/feature/campus/CampusResultsDrawer';
import { CampusSearchBar } from '@/components/feature/campus/CampusSearchBar';
import { todayShadowSoft } from '@/components/feature/today/todayShadows';
import { MaterialSymbol, msMyLocation } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { useBuildings } from '@/hooks/useBuildings';
import { useCampusUserLocation } from '@/hooks/useCampusUserLocation';
import {
  HEADER_BAR_BUTTON_SIZE,
  HEADER_ICON_SIZE,
} from '@/navigation/HeaderIconButton';
import { useTabBarOverlayInset } from '@/navigation/tabBarInset';
import { useHideTabBar } from '@/navigation/tabBarVisibility';
import type { CampusStackScreenProps } from '@/navigation/types';
import { getBuildingCatalogRecord } from '@/data/buildings';
import {
  buildingMatchesMapFilter,
  CAMPUS_FILTER_LABEL,
  walkMinutesFromCoords,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
import type { UserCoords } from '@/hooks/useCampusUserLocation';
import { CAMPUS_MAP_DEFAULTS, type BuildingSummary } from '@/types/campus';

type Props = CampusStackScreenProps<'CampusHome'>;

const DEFAULT_CAMPUS = CAMPUS_MAP_DEFAULTS.sgw;

const MAP_FOCUS_DELTA = 0.004;

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
  /**
   * The category showing in the field. Separate from `mapFilter` because
   * `buildings` is both "no filter" and a category a student can pick — only
   * this says whether a category is actually being browsed.
   */
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [coords, setCoords] = useState<UserCoords | null>(null);

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
  }, [buildings, mapFilter, coords]);

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
  useHideTabBar(selectedBuilding != null || searchLabel != null);

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
  } = route.params ?? {};

  useEffect(() => {
    if (!focusBuildingId && !requestedFilter && !requestedLabel) {
      return;
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
    });
  }, [
    focusBuildingId,
    requestedFilter,
    requestedLabel,
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
    navigation.navigate('ShuttleTracker');
  }, [navigation]);

  /**
   * A pill on the overlay card does what the same pill does in search: fills
   * the field, pins the layer, and turns this card into the results drawer.
   * Tapping the active one is the way back out.
   */
  const onPressFilter = useCallback(
    (filter: CampusMapFilter) => {
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
            {showLoadingChip ? (
              <Text
                variant="caption"
                color="secondary"
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
          </View>

          <View style={styles.overlaySpacer} pointerEvents="none" />

          {/* Yields to either sheet — both draw over this overlay, not in it. */}
          {selectedBuilding || searchLabel ? null : (
            <CampusQuickCard
              campusName="SGW campus"
              activeFilter={mapFilter}
              onPressShuttle={onPressShuttle}
              onPressFilter={onPressFilter}
            />
          )}
        </View>

        {/*
          Both sheets sit outside the overlay so they can own the full screen
          and animate from off the bottom edge. Only one is ever up: picking a
          building from the results hands over to its drawer, and closing that
          hands back.
        */}
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
    alignItems: 'flex-start',
  },
  locateButton: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
  },
  statusChip: {
    overflow: 'hidden',
  },
});
