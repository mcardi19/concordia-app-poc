import type { CampusCode } from '@/types/campus';

/** Open Data library branch this building maps to, if any. */
export type LibraryBranch = 'webster' | 'vanier' | 'greynuns';

/**
 * Consolidated building record — website directory, maps-XML snapshot,
 * and hand-curated detail pages. Coordinates come from Open Data
 * `facilities/buildinglist/`.
 */
export type BuildingCatalogRecord = {
  campusId: CampusCode;
  code: string;
  name: string;
  address: string;
  /** Official campus-maps page, e.g. https://www.concordia.ca/maps/buildings/h.html */
  sourceUrl: string;
  aliases?: string[];
  overview?: string;
  accessibility?: string[];
  venues?: string[];
  /** From maps XML `<services>` links. */
  services?: string[];
  /** From maps XML `<departments>` links. */
  departments?: string[];
  /** From maps XML amenity icons. */
  amenities?: string[];
  library?: LibraryBranch;
};
