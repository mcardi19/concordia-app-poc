import { useEffect, useState } from 'react';
import {
  getNextShuttleMinutes,
  getShuttleDepartureStatus,
} from '@/services/shuttle/shuttleTracker';
import type { ShuttleDepartureStatus } from '@/types/campus';

const REFRESH_MS = 30_000;

type ShuttleTrackerState = ShuttleDepartureStatus & {
  loyMinutes: number | null;
  sgwMinutes: number | null;
};

function readTracker(): ShuttleTrackerState {
  return {
    ...getShuttleDepartureStatus(),
    loyMinutes: getNextShuttleMinutes('loy'),
    sgwMinutes: getNextShuttleMinutes('sgw'),
  };
}

export function useShuttleTracker() {
  const [status, setStatus] = useState<ShuttleTrackerState>(readTracker);

  useEffect(() => {
    const tick = () => setStatus(readTracker());
    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return status;
}
