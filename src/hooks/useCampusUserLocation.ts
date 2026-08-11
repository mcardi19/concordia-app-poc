import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Requests when-in-use location permission for the Campus map blue dot.
 */
export function useCampusUserLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        let status = current.status;
        if (status !== Location.PermissionStatus.GRANTED) {
          const requested = await Location.requestForegroundPermissionsAsync();
          status = requested.status;
        }
        if (!cancelled) {
          setPermissionGranted(status === Location.PermissionStatus.GRANTED);
        }
      } catch {
        if (!cancelled) {
          setPermissionGranted(false);
        }
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  return { permissionGranted };
}
