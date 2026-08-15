import type { CampusCode } from '@/types/campus';

/** Open Data library branch this building maps to, if any. */
export type LibraryBranch = 'webster' | 'vanier' | 'greynuns';

/**
 * Consolidated building record — website directory, crawled detail pages,
 * maps-XML snapshot, and optional manual overrides. Coordinates come from
 * Open Data `facilities/buildinglist/`.
 */
export type BuildingCatalogRecord = {
  campusId: CampusCode;
  code: string;
  name: string;
  address: string;
  /** Official campus-maps page, e.g. https://www.concordia.ca/maps/buildings/h.html */
  sourceUrl: string;
  aliases?: string[];
  /** Crawled from the building detail page. */
  overview?: string;
  accessibility?: string[];
  /** Restricted-access notes (e.g. VA building). */
  accessHours?: string[];
  venues?: string[];
  /** Merged from website detail page + maps XML. */
  services?: string[];
  /** Merged from website detail page + maps XML. */
  departments?: string[];
  /** From maps XML amenity icons. */
  amenities?: string[];
  /** Hero image from the building detail page, when present. */
  imageUrl?: string;
  library?: LibraryBranch;
};
