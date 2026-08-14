export type CampusCode = 'sgw' | 'loy';

export type ServiceSearchResult = {
  id: string;
  label: string;
  buildingName: string;
  /** Maps XML `<label>` — the building code when present. */
  buildingCode?: string;
  kind: 'service' | 'department';
};

export type FeaturedEvent = {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
  backgroundColor?: string;
  textColor?: string;
  imageUrl?: string;
};

export type ShuttleCampus = 'loy' | 'sgw';

export type ShuttleDepartureStatus = {
  loyMessage: string;
  sgwMessage: string;
  isHoliday: boolean;
  isWeekend: boolean;
};

/** Place-model building summary for map markers and Campus search. */
export type BuildingSummary = {
  id: string;
  campusId: CampusCode;
  code: string;
  name: string;
  longName?: string;
  address?: string;
  lat: number;
  lng: number;
  amenities: string[];
};

export type CampusMapDefaults = {
  id: CampusCode;
  name: string;
  defaultLat: number;
  defaultLng: number;
  /** Approximate MapView latitudeDelta for initial camera. */
  latitudeDelta: number;
  longitudeDelta: number;
};

export const CAMPUS_MAP_DEFAULTS: Record<CampusCode, CampusMapDefaults> = {
  sgw: {
    id: 'sgw',
    name: 'Sir George Williams',
    defaultLat: 45.4973,
    defaultLng: -73.579,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  },
  loy: {
    id: 'loy',
    name: 'Loyola',
    defaultLat: 45.4584,
    defaultLng: -73.6402,
    latitudeDelta: 0.014,
    longitudeDelta: 0.014,
  },
};
