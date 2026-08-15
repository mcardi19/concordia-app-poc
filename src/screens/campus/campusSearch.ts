import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  msDirectionsBus,
  msLocalCafe,
  msLocalParking,
  msLocationOn,
  msMenuBook,
  msPedalBike,
  msPrint,
  msSchool,
  msSupportAgent,
} from '@/components/icons';
import { filterBuildings } from '@/api/buildings';
import {
  walkMinutesFromCoords,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
import {
  searchCourses,
  searchLibrary,
  searchServices,
  type SearchHit,
} from '@/screens/search/globalSearch';
import type { ScheduleEvent } from '@/components/feature/schedule/scheduleTypes';
import type { CuratedBook, LibraryLoan } from '@/components/feature/library/libraryData';
import type {
  BuildingSummary,
  CampusCode,
  ServiceSearchResult,
} from '@/types/campus';

/**
 * Campus search groups, in the order they are shown.
 *
 * Places lead — this search is opened from the map, so a hit that can be put
 * on the map is the likeliest thing the student came for. The app-wide Search
 * screen orders courses first for the opposite reason.
 *
 * The design also calls for a People group; there is no people feed yet, so
 * that group is simply absent rather than stubbed with mock rows.
 */
export type CampusSearchGroupKey = 'place' | 'course' | 'resource';

export const CAMPUS_GROUP_LABEL: Record<CampusSearchGroupKey, string> = {
  place: 'Places',
  course: 'Courses',
  resource: 'Library & services',
};

export const CAMPUS_GROUP_ORDER: CampusSearchGroupKey[] = ['place', 'course', 'resource'];

export type CampusSearchHit = {
  id: string;
  group: CampusSearchGroupKey;
  title: string;
  subtitle: string;
  icon: MsIconDefinition;
  /** Set on place hits — what a tap hands back to the map. */
  building?: BuildingSummary;
};

export type Coords = { latitude: number; longitude: number };

/** "4 min walk" once location is known, the street address until then. */
export function placeSubtitle(
  building: BuildingSummary,
  coords: Coords | null
): string {
  if (coords) {
    const minutes = walkMinutesFromCoords(
      { lat: coords.latitude, lng: coords.longitude },
      { lat: building.lat, lng: building.lng }
    );
    return `${minutes} min walk · ${building.code}`;
  }
  return building.address ?? building.longName ?? building.code;
}

/**
 * Buildings, nearest first once we can measure — the map's own ordering,
 * rather than the alphabetical order the feed arrives in.
 */
export function searchCampusPlaces(
  buildings: BuildingSummary[],
  query: string,
  campusId: CampusCode,
  coords: Coords | null
): CampusSearchHit[] {
  // Same matcher the map field used, so a query returns the same buildings.
  const hits = filterBuildings(buildings, query, campusId);

  const sorted = coords
    ? [...hits].sort(
        (a, b) =>
          walkMinutesFromCoords({ lat: coords.latitude, lng: coords.longitude }, { lat: a.lat, lng: a.lng }) -
          walkMinutesFromCoords({ lat: coords.latitude, lng: coords.longitude }, { lat: b.lat, lng: b.lng })
      )
    : hits;

  return sorted.map((building) => ({
    id: `place-${building.id}`,
    group: 'place' as const,
    title: `${building.code} · ${building.name}`,
    subtitle: placeSubtitle(building, coords),
    icon: msLocationOn,
    building,
  }));
}

/** Everything the app-wide search knows that is not a building. */
export function searchCampusResources(
  events: ScheduleEvent[],
  loans: LibraryLoan[],
  curated: CuratedBook[],
  services: ServiceSearchResult[],
  query: string
): CampusSearchHit[] {
  const asHit = (
    hit: SearchHit,
    group: CampusSearchGroupKey,
    icon: MsIconDefinition
  ): CampusSearchHit => ({
    id: hit.id,
    group,
    title: hit.title,
    subtitle: hit.meta ? `${hit.subtitle} · ${hit.meta}` : hit.subtitle,
    icon,
  });

  return [
    ...searchCourses(events, query).map((hit) => asHit(hit, 'course', msSchool)),
    ...searchLibrary(loans, curated, query).map((hit) => asHit(hit, 'resource', msMenuBook)),
    ...searchServices(services, query).map((hit) => asHit(hit, 'resource', msSupportAgent)),
  ];
}

export function groupCampusHits(
  hits: CampusSearchHit[]
): { group: CampusSearchGroupKey; hits: CampusSearchHit[] }[] {
  return CAMPUS_GROUP_ORDER.map((group) => ({
    group,
    hits: hits.filter((hit) => hit.group === group),
  })).filter((entry) => entry.hits.length > 0);
}

/**
 * The chip rail on the resting state. Every chip is a map layer rather than a
 * text query — tapping one hands the filter back to the map instead of
 * running a search, which is what makes this screen campus-first.
 */
export type CampusBrowseChip = {
  icon: MsIconDefinition;
  filter: CampusMapFilter;
};

/** Labels come from `CAMPUS_FILTER_LABEL` — the chip puts one in the field. */
export const CAMPUS_BROWSE_CHIPS: CampusBrowseChip[] = [
  { icon: msLocationOn, filter: 'buildings' },
  { icon: msLocalCafe, filter: 'cafe' },
  { icon: msMenuBook, filter: 'study' },
  { icon: msPrint, filter: 'print' },
  { icon: msLocalParking, filter: 'parking' },
  { icon: msPedalBike, filter: 'bike' },
];

/** Codes the favourites row shows before a student has pinned their own. */
export const CAMPUS_FAVOURITE_CODES = ['LB', 'H', 'EV'];

export const shuttleIcon = msDirectionsBus;
