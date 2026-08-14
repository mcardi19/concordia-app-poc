import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassActionButton, Screen, Text } from '@/components/design-system';
import { BuildingDrawer } from '@/components/feature/campus/BuildingDrawer';
import { CampusQuickCard } from '@/components/feature/campus/CampusQuickCard';
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
import type { CampusStackScreenProps } from '@/navigation/types';
import { getBuildingCatalogRecord } from '@/data/buildings';
import {
  buildingMatchesMapFilter,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
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

/** Matches MainTabs default so liquid glass is restored after a temporary hide. */
function defaultTabBarStyle(backgroundColor: string) {
  return Platform.select({
    ios: undefined,
    android: { backgroundColor },
  });
}

export function CampusHomeScreen({ navigation }: Props) {
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
  const [query, setQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingSummary | null>(
    null
  );
  const { data: buildings = [], isFetching, isError, isPlaceholderData } =
    useBuildings();
  const { permissionGranted, getCurrentCoords } = useCampusUserLocation();
  const [isLocating, setIsLocating] = useState(false);
  const [mapFilter, setMapFilter] = useState<CampusMapFilter>('buildings');

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: DEFAULT_CAMPUS.defaultLat,
      longitude: DEFAULT_CAMPUS.defaultLng,
      latitudeDelta: DEFAULT_CAMPUS.latitudeDelta,
      longitudeDelta: DEFAULT_CAMPUS.longitudeDelta,
    }),
    []
  );

  const visibleBuildings = useMemo(() => {
    const campus = buildings.filter((building) => building.campusId === 'sgw');
    if (mapFilter === 'buildings') {
      return campus;
    }
    return campus.filter((building) =>
      buildingMatchesMapFilter(
        getBuildingCatalogRecord(building.campusId, building.code),
        mapFilter
      )
    );
  }, [buildings, mapFilter]);

  /**
   * Hide the native tab bar while the drawer is open so the in-screen sheet can
   * cover that edge without a Modal (which would drop Apple Maps pin selection).
   */
  useEffect(() => {
    const tabNavigation = navigation.getParent();
    if (!tabNavigation) {
      return;
    }
    tabNavigation.setOptions({
      tabBarStyle: selectedBuilding
        ? { display: 'none' }
        : defaultTabBarStyle(theme.color.background),
    });
    return () => {
      tabNavigation.setOptions({
        tabBarStyle: defaultTabBarStyle(theme.color.background),
      });
    };
  }, [navigation, selectedBuilding, theme.color.background]);

  const selectBuilding = useCallback((building: BuildingSummary) => {
    swallowNextMapPressRef.current = true;
    setSelectedBuilding(building);
    setQuery('');
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(regionForBuilding(building), 400);
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

  const onPressFilter = useCallback((filter: CampusMapFilter) => {
    setMapFilter((current) =>
      filter === 'buildings' || current === filter ? 'buildings' : filter
    );
  }, []);

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
              Campus searches the map, not the app: a hit here selects the
              building and flies the camera to it. That is why this stays an
              inline field rather than the header action the other tabs use —
              handing off to the app-wide Search screen would lose the map.
            */}
            <CampusSearchBar
              query={query}
              onChangeQuery={setQuery}
              buildings={buildings}
              campusId="sgw"
              onSelectBuilding={selectBuilding}
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

          {selectedBuilding ? null : (
            <CampusQuickCard
              campusName="SGW campus"
              activeFilter={mapFilter}
              onPressShuttle={onPressShuttle}
              onPressFilter={onPressFilter}
            />
          )}
        </View>

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
