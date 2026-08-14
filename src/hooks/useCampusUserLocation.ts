import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type UserCoords = {
  latitude: number;
  longitude: number;
};

async function requestForegroundAccess(): Promise<boolean> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    let status = current.status;
    if (status !== Location.PermissionStatus.GRANTED) {
      const requested = await Location.requestForegroundPermissionsAsync();
      status = requested.status;
    }
    return status === Location.PermissionStatus.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Requests when-in-use location permission for the Campus map blue dot,
 * and can fetch the current coordinates to recenter the camera.
 */
export function useCampusUserLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const ensurePermission = useCallback(async () => {
    const granted = await requestForegroundAccess();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const getCurrentCoords = useCallback(async (): Promise<UserCoords | null> => {
    const granted = await ensurePermission();
    if (!granted) {
      return null;
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  }, [ensurePermission]);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const granted = await requestForegroundAccess();
      if (!cancelled) {
        setPermissionGranted(granted);
      }
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  return { permissionGranted, getCurrentCoords };
}
