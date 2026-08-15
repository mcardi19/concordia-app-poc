import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { walkMinutesFromCoords } from '@/services/campus/buildingPresentation';
import type { BuildingSummary } from '@/types/campus';

type Coords = { lat: number; lng: number };

export function useBuildingEnrichment(building: BuildingSummary | null) {
  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  useEffect(() => {
    if (!building) {
      setUserLocation(null);
      return;
    }

    let cancelled = false;

    async function loadLocation() {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        let status = current.status;
        if (status !== Location.PermissionStatus.GRANTED) {
          const requested = await Location.requestForegroundPermissionsAsync();
          status = requested.status;
        }
        if (status !== Location.PermissionStatus.GRANTED) {
          if (!cancelled) setUserLocation(null);
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      } catch {
        if (!cancelled) setUserLocation(null);
      }
    }

    void loadLocation();

    return () => {
      cancelled = true;
    };
  }, [building?.id]);

  const walkMinutes =
    building && userLocation
      ? walkMinutesFromCoords(userLocation, {
          lat: building.lat,
          lng: building.lng,
        })
      : null;

  return { walkMinutes, userLocation };
}
