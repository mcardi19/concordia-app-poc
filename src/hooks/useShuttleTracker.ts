import { useEffect, useState } from 'react';
import { getShuttleDepartureStatus } from '@/services/shuttle/shuttleTracker';
import type { ShuttleDepartureStatus } from '@/types/campus';

const REFRESH_MS = 30_000;

export function useShuttleTracker() {
  const [status, setStatus] = useState<ShuttleDepartureStatus>(() =>
    getShuttleDepartureStatus()
  );

  useEffect(() => {
    const tick = () => setStatus(getShuttleDepartureStatus());
    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return status;
}
