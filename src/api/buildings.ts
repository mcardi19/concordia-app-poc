import { getConcordiaOpenDataClient } from '@/api/concordiaOpenDataClient';
import { isConcordiaOpenDataConfigured } from '@/config/concordiaOpenData';
import { BUILDING_FALLBACK } from '@/services/campus/buildingFallback';
import type { BuildingSummary, CampusCode } from '@/types/campus';

/** Open Data `facilities/buildinglist/` row. */
type FacilitiesBuildingRow = {
  Campus?: string;
  Building?: string;
  Building_Name?: string;
  Building_Long_Name?: string;
  Address?: string;
  Latitude?: string;
  Longitude?: string;
};

function normalizeCampus(raw: string | undefined): CampusCode | null {
  const value = (raw ?? '').trim().toUpperCase();
  if (value === 'SGW') return 'sgw';
  if (value === 'LOY') return 'loy';
  return null;
}

function parseCoordinate(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function normalizeBuildingRow(row: FacilitiesBuildingRow): BuildingSummary | null {
  const campusId = normalizeCampus(row.Campus);
  const code = (row.Building ?? '').trim();
  const lat = parseCoordinate(row.Latitude);
  const lng = parseCoordinate(row.Longitude);
  const name = (row.Building_Name ?? '').trim() || code;

  if (!campusId || !code || lat == null || lng == null) {
    return null;
  }

  const longName = (row.Building_Long_Name ?? '').trim() || undefined;
  const address = (row.Address ?? '').trim() || undefined;

  return {
    id: `${campusId}-${code}`,
    campusId,
    code,
    name,
    longName: longName && longName !== name ? longName : undefined,
    address,
    lat,
    lng,
    amenities: [],
  };
}

async function fetchBuildingsFromOpenData(): Promise<BuildingSummary[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get<FacilitiesBuildingRow[]>('facilities/buildinglist/');
  if (!Array.isArray(data)) {
    return [];
  }

  const buildings: BuildingSummary[] = [];
  data.forEach((row) => {
    const building = normalizeBuildingRow(row);
    if (building) {
      buildings.push(building);
    }
  });
  return buildings;
}

/**
 * Buildings for the Campus map. Prefers Open Data; falls back to a curated list
 * when Open Data is not configured or returns no usable rows.
 * Network/auth failures throw so TanStack Query can report `isError` while
 * `placeholderData` keeps markers on screen.
 */
export async function fetchBuildings(): Promise<BuildingSummary[]> {
  if (!isConcordiaOpenDataConfigured()) {
    return BUILDING_FALLBACK;
  }

  const buildings = await fetchBuildingsFromOpenData();
  if (buildings.length === 0) {
    return BUILDING_FALLBACK;
  }
  return buildings;
}

export function filterBuildings(
  buildings: BuildingSummary[],
  query: string,
  campusId?: CampusCode
): BuildingSummary[] {
  const scoped = campusId
    ? buildings.filter((building) => building.campusId === campusId)
    : buildings;
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  return scoped
    .filter((building) => {
      const haystack = [
        building.code,
        building.name,
        building.longName ?? '',
        building.address ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 20);
}
