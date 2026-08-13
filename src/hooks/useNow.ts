import { useEffect, useState } from 'react';

const TICK_MS = 60_000;

/** Live clock that refreshes every minute — enough for schedule "now" markers. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return now;
}
