import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard, Platform } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text } from '@/components/design-system';
import { BuildingDrawer } from '@/components/feature/campus/BuildingDrawer';
import { CampusHeaderChrome } from '@/components/feature/campus/CampusHeaderChrome';
import { useTheme } from '@/design-system/theme';
import { useBuildings } from '@/hooks/useBuildings';
import { useCampusUserLocation } from '@/hooks/useCampusUserLocation';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { CampusStackScreenProps } from '@/navigation/types';
import { CAMPUS_MAP_DEFAULTS, type BuildingSummary } from '@/types/campus';

type Props = CampusStackScreenProps<'CampusHome'>;

const DEFAULT_CAMPUS = CAMPUS_MAP_DEFAULTS.sgw;

function regionForBuilding(building: BuildingSummary): Region {
  return {
    latitude: building.lat,
    longitude: building.lng,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
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
  const tabBarInset = useTabBarScrollInset();
  const mapRef = useRef<MapView>(null);
  /**
   * Apple Maps fires MapView `onPress` for marker taps too. Defer + swallow so
   * we don't clear selection in the same gesture (which kills the pin scale).
   */
  const swallowNextMapPressRef = useRef(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingSummary | null>(
    null
  );
  const { data: buildings = [], isFetching, isError, isPlaceholderData } =
    useBuildings();
  const { permissionGranted } = useCampusUserLocation();

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: DEFAULT_CAMPUS.defaultLat,
      longitude: DEFAULT_CAMPUS.defaultLng,
      latitudeDelta: DEFAULT_CAMPUS.latitudeDelta,
      longitudeDelta: DEFAULT_CAMPUS.longitudeDelta,
    }),
    []
  );

  const visibleBuildings = useMemo(
    () => buildings.filter((building) => building.campusId === 'sgw'),
    [buildings]
  );

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
              paddingBottom: tabBarInset + theme.spacing.sm,
            },
          ]}
        >
          <CampusHeaderChrome
            onSearchPress={() => navigation.getParent()?.navigate('Search')}
          />
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
  statusChip: {
    overflow: 'hidden',
  },
});
