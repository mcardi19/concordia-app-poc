import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import MapView, { type MapMarker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text } from '@/components/design-system';
import { BuildingDrawer } from '@/components/feature/campus/BuildingDrawer';
import { BuildingMapPin } from '@/components/feature/campus/BuildingMapPin';
import { CampusSearchBar } from '@/components/feature/campus/CampusSearchBar';
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

export function CampusHomeScreen({}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarScrollInset();
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});
  const [query, setQuery] = useState('');
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

  const selectBuilding = useCallback((building: BuildingSummary) => {
    setSelectedBuilding(building);
    setQuery('');
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(regionForBuilding(building), 400);
  }, []);

  /** Drawer close / map tap: drop native selection so the pin scales down and can be tapped again. */
  const clearSelection = useCallback(() => {
    const selectedId = selectedBuilding?.id;
    if (selectedId) {
      markerRefs.current[selectedId]?.hideCallout();
    }
    setSelectedBuilding(null);
  }, [selectedBuilding?.id]);

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
          onPress={clearSelection}
        >
          {visibleBuildings.map((building) => (
            <BuildingMapPin
              key={building.id}
              building={building}
              color={theme.color.primary}
              selected={selectedBuilding?.id === building.id}
              markerRef={(ref) => {
                markerRefs.current[building.id] = ref;
              }}
              onPress={() => {
                selectBuilding(building);
              }}
            />
          ))}
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
          <CampusSearchBar
            query={query}
            onChangeQuery={setQuery}
            buildings={buildings}
            campusId="sgw"
            onSelectBuilding={selectBuilding}
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
