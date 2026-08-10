import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text } from '@/components/design-system';
import { CampusSearchBar } from '@/components/feature/campus/CampusSearchBar';
import { useTheme } from '@/design-system/theme';
import { useBuildings } from '@/hooks/useBuildings';
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
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: buildings = [], isFetching, isError, isPlaceholderData } = useBuildings();

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

  const focusBuilding = useCallback((building: BuildingSummary) => {
    setSelectedId(building.id);
    setQuery('');
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(regionForBuilding(building), 400);
  }, []);

  const showLoadingChip = isFetching && isPlaceholderData;

  return (
    <Screen safe={false} padded={false}>
      <View style={styles.fill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
        >
          {visibleBuildings.map((building) => (
            <Marker
              key={building.id}
              coordinate={{ latitude: building.lat, longitude: building.lng }}
              title={building.code}
              description={building.name}
              identifier={building.id}
              pinColor={
                selectedId === building.id
                  ? theme.color.primary
                  : theme.color.info
              }
              onPress={() => setSelectedId(building.id)}
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
            onSelectBuilding={focusBuilding}
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
