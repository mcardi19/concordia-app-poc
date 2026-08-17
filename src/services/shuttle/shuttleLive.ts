import { SHUTTLE_STOPS } from './shuttleRoute';

const MAP_URL = 'https://shuttle.concordia.ca/concordiabusmap/Map.aspx';
const OBJECT_URL =
  'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject';

/** Drop GPS pings well away from the two campus stops (depot / stale units). */
const CORRIDOR_KM = 4;

export type ShuttleCoord = {
  latitude: number;
  longitude: number;
};

export type ShuttleVehicle = ShuttleCoord & {
  id: string;
};

export type ShuttleStop = ShuttleCoord & {
  id: 'sgw' | 'loy';
  title: string;
};

export type ShuttleLiveSnapshot = {
  vehicles: ShuttleVehicle[];
  stops: ShuttleStop[];
};

type GooglePoint = {
  ID?: string;
  Latitude?: number;
  Longitude?: number;
};

type GoogleObject = {
  Points?: GooglePoint[];
  Message?: string;
};

let sessionId: string | null = null;

function cookieHeader(): Record<string, string> {
  return sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {};
}

function captureSession(headers: Headers) {
  const raw = headers.get('set-cookie');
  const match = raw?.match(/ASP.NET_SessionId=([^;]+)/i);
  if (match?.[1]) {
    sessionId = match[1];
  }
}

async function warmupSession(): Promise<void> {
  const response = await fetch(MAP_URL, {
    credentials: 'include',
    headers: cookieHeader(),
  });
  captureSession(response.headers);
}

function distToSegmentKm(point: ShuttleCoord, a: ShuttleCoord, b: ShuttleCoord): number {
  const latScale = 111.32;
  const lngScale = 111.32 * Math.cos((a.latitude * Math.PI) / 180);
  const bx = (b.longitude - a.longitude) * lngScale;
  const by = (b.latitude - a.latitude) * latScale;
  const px = (point.longitude - a.longitude) * lngScale;
  const py = (point.latitude - a.latitude) * latScale;
  const ab2 = bx * bx + by * by;
  const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / ab2));
  const dx = px - bx * t;
  const dy = py - by * t;
  return Math.sqrt(dx * dx + dy * dy);
}

function onCampusRun(point: ShuttleCoord): boolean {
  return (
    distToSegmentKm(point, SHUTTLE_STOPS.sgw, SHUTTLE_STOPS.loy) <= CORRIDOR_KM
  );
}

function asStop(point: GooglePoint): ShuttleStop | null {
  const latitude = point.Latitude;
  const longitude = point.Longitude;
  if (latitude == null || longitude == null) return null;
  const id = String(point.ID ?? '');
  if (id === 'GPSirGeorge') {
    return { id: 'sgw', title: SHUTTLE_STOPS.sgw.title, latitude, longitude };
  }
  if (id === 'GPLoyola') {
    return { id: 'loy', title: SHUTTLE_STOPS.loy.title, latitude, longitude };
  }
  return null;
}

function asVehicle(point: GooglePoint): ShuttleVehicle | null {
  const id = String(point.ID ?? '');
  if (!id.startsWith('BUS')) return null;
  const latitude = point.Latitude;
  const longitude = point.Longitude;
  if (latitude == null || longitude == null) return null;
  const coord = { latitude, longitude };
  if (!onCampusRun(coord)) return null;
  return { id, ...coord };
}

type GoogleEnvelope = {
  d?: GoogleObject;
  Points?: GooglePoint[];
  Message?: string;
};

async function postGoogleObject(): Promise<GoogleEnvelope> {
  const response = await fetch(OBJECT_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...cookieHeader(),
    },
    body: '{}',
  });
  captureSession(response.headers);
  return (await response.json()) as GoogleEnvelope;
}

function unwrapGoogle(payload: GoogleEnvelope): GoogleObject {
  return payload.d ?? payload;
}

/**
 * Live shuttle overlay from Concordia's public bus map.
 * Map.aspx seeds a session cookie; GetGoogleObject then returns stops + buses.
 */
export async function fetchShuttleLive(): Promise<ShuttleLiveSnapshot> {
  if (!sessionId) {
    await warmupSession();
  }

  let google = unwrapGoogle(await postGoogleObject());
  if (google.Message || !google.Points) {
    sessionId = null;
    await warmupSession();
    google = unwrapGoogle(await postGoogleObject());
  }

  if (google.Message || !google.Points) {
    throw new Error(google.Message ?? 'Shuttle map did not return positions');
  }

  const points = google.Points ?? [];
  const stops = points
    .map(asStop)
    .filter((stop): stop is ShuttleStop => stop != null);
  const vehicles = points
    .map(asVehicle)
    .filter((vehicle): vehicle is ShuttleVehicle => vehicle != null);

  return {
    vehicles,
    stops: stops.length === 2 ? stops : [SHUTTLE_STOPS.sgw, SHUTTLE_STOPS.loy],
  };
}
