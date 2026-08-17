import type { BuildingCatalogRecord } from '@/data/buildings';
import type { LibraryHourRow } from '@/api/concordiaOpenDataClient';

export type AmenityRow = {
  id: string;
  label: string;
};

export type WhatsHereRow = {
  id: string;
  label: string;
  /** Chip labels for Venues / Services / Departments. Empty for About. */
  items: string[];
  /** Prose body for About. List tabs leave this unset. */
  detail?: string;
};

const WALKING_SPEED_KMH = 5;

export function walkMinutesFromCoords(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  const km = earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round((km / WALKING_SPEED_KMH) * 60));
}

/**
 * The building a room sits in. Rooms read "H-820" / "LB 625" — the leading
 * token is the building code, which is what turns a timetable entry into
 * somewhere the map can point at.
 */
export function buildingForRoom<T extends { campusId: string; code: string }>(
  room: string | undefined,
  buildings: T[],
  campusId: string
): T | undefined {
  const code = room?.trim().split(/[\s.-]/)[0]?.toUpperCase();
  if (!code) return undefined;
  return buildings.find(
    (building) =>
      building.campusId === campusId && building.code.toUpperCase() === code
  );
}

function uniqueLabels(values: string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    next.push(trimmed);
  });
  return next;
}

/** Map catalog + services into amenity chips for the drawer rail. */
export function buildAmenityRows(
  catalog: BuildingCatalogRecord | undefined,
  services: string[]
): AmenityRow[] {
  const rows: AmenityRow[] = [];
  const haystack = [...(catalog?.amenities ?? []), ...(catalog?.accessibility ?? []), ...services]
    .join(' ')
    .toLowerCase();

  const push = (id: string, label: string, when = true) => {
    if (!when || rows.some((row) => row.id === id)) return;
    rows.push({ id, label });
  };

  push('accessible', 'Wheelchair access', /accessible|wheelchair|ramp/.test(haystack));
  push('atm', 'ATM', /atm|bank/.test(haystack));
  push('bike', 'Bike racks', /bike|bixi|bicycle/.test(haystack));
  push('parking', 'Parking', /parking/.test(haystack));
  push('info', 'Info desk', /info desk/.test(haystack));
  push(
    'cafe',
    'Café',
    /café|cafe|coffee|hive|people'?s potato|restaurant/.test(haystack)
  );
  push('print', 'Print station', /print/.test(haystack));
  push(
    'elevator',
    'Elevators',
    /elevator/.test(haystack) && !/no elevator|not equipped with an accessibility ramp, automated door, elevator/.test(haystack)
  );
  push('washrooms', 'Washrooms', true);

  (catalog?.amenities ?? []).forEach((item) => {
    push(`amenity-${item}`, item, !rows.some((row) => row.label.toLowerCase() === item.toLowerCase()));
  });

  return rows.slice(0, 8);
}

/** Map-rail filters on the campus overlay card. `buildings` is the unfiltered default. */
export type CampusMapFilter = 'buildings' | 'cafe' | 'study' | 'print' | 'parking' | 'bike';

/**
 * One name per filter, shared by the overlay card's pills, the Campus search
 * chips, and the search field once a category is active — picking a pill puts
 * this exact string in the field, so they cannot be allowed to drift.
 */
export const CAMPUS_FILTER_LABEL: Record<CampusMapFilter, string> = {
  buildings: 'Buildings',
  cafe: 'Cafés',
  study: 'Quiet study',
  print: 'Print',
  parking: 'Parking',
  bike: 'Bike racks',
};

const MAP_FILTER_MATCH: Record<Exclude<CampusMapFilter, 'buildings'>, RegExp> = {
  cafe: /café|cafe|coffee|cafeteria|hive|people'?s potato|restaurant/,
  study: /study|library|reading room|quiet/,
  print: /print/,
  parking: /parking/,
  bike: /bike|bixi|bicycle/,
};

/** Whether a catalog record has the amenity the map-rail filter is asking for. */
export function buildingMatchesMapFilter(
  catalog: BuildingCatalogRecord | undefined,
  filter: CampusMapFilter
): boolean {
  if (filter === 'buildings') {
    return true;
  }
  if (!catalog) {
    return false;
  }
  if (filter === 'study' && catalog.library) {
    return true;
  }
  const haystack = [
    ...(catalog.amenities ?? []),
    ...(catalog.accessibility ?? []),
    ...(catalog.services ?? []),
    ...(catalog.venues ?? []),
    catalog.overview ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return MAP_FILTER_MATCH[filter].test(haystack);
}

/** Group venues, services, and departments into “What’s here” tab rows. */
export function buildWhatsHereRows(
  catalog: BuildingCatalogRecord | undefined,
  services: string[],
  departments: string[]
): WhatsHereRow[] {
  const rows: WhatsHereRow[] = [];

  const venueChunks = uniqueLabels(catalog?.venues ?? []);
  if (venueChunks.length) {
    rows.push({
      id: 'venues',
      label: 'Venues',
      items: venueChunks,
    });
  }

  const serviceChunks = uniqueLabels(services);
  if (serviceChunks.length) {
    rows.push({
      id: 'services',
      label: 'Services',
      items: serviceChunks,
    });
  }

  const departmentChunks = uniqueLabels(departments);
  if (departmentChunks.length) {
    rows.push({
      id: 'departments',
      label: 'Departments',
      items: departmentChunks,
    });
  }

  if (catalog?.overview) {
    rows.push({
      id: 'overview',
      label: 'About',
      items: [],
      detail: catalog.overview,
    });
  }

  return rows;
}

export function formatHoursStatus(
  hours: LibraryHourRow[],
  isLibrary: boolean
): { text: string; tone: 'open' | 'neutral' } | null {
  if (!isLibrary) {
    return null;
  }
  const primary = hours.find((row) => row.text?.trim());
  if (!primary) {
    return { text: 'Hours unavailable', tone: 'neutral' };
  }
  const value = primary.text.trim();
  const open = /open|until|am|pm|\d/i.test(value) && !/closed/i.test(value);
  return {
    text: `${primary.service}: ${value}`,
    tone: open ? 'open' : 'neutral',
  };
}

export function shortHoursLabel(hours: LibraryHourRow[]): string | null {
  const primary = hours.find((row) => row.text?.trim());
  if (!primary) return null;
  const text = primary.text.trim();
  const until = text.match(/until\s+([^,.]+)/i)?.[1];
  if (until) return `Open until ${until}`;
  if (/closed/i.test(text)) return 'Closed today';
  return text.length > 42 ? `${text.slice(0, 39)}…` : text;
}
