import type { CampusCode } from './campus';

/**
 * Campus service records — the shape behind the service detail screen.
 *
 * Modelled against what concordia.ca actually publishes, which is the reason
 * for several of the choices below. The site describes services in prose, not
 * markup: there is no JSON-LD, `og:description` is empty, and opening times
 * read "Walk-ins with nurses and doctors begin at 9 a.m." — a start with no
 * end. So the schema has to represent partial knowledge without inventing the
 * rest, and has to say where each record came from.
 */

/** How you actually reach a service. Often more useful than opening hours. */
export type ServiceAccess =
  | 'drop-in'
  | 'appointment'
  | 'both'
  | 'online'
  | 'phone'
  | 'emergency';

/**
 * One opening rule.
 *
 * `closesMinutes` is optional on purpose. Several services publish only when
 * they open ("walk-ins begin at 9 a.m."), and guessing a closing time would
 * put a confident, wrong "until 5 p.m." in front of a student standing at a
 * locked door.
 */
export type ServiceHours = {
  /** Day indices, 0 = Sunday, matching `Date.getDay()`. */
  days: number[];
  /** Minutes from midnight. */
  opensMinutes: number;
  /** Minutes from midnight, when published. */
  closesMinutes?: number;
  /** Qualifier shown next to the time — "walk-ins", "phone only". */
  note?: string;
};

export type ServiceLocation = {
  campus: CampusCode;
  /** Joins the building catalog and the campus map. */
  buildingCode?: string;
  /** Full room, e.g. "GM-200". */
  room?: string;
  /** When there is no room to go to — "Online only", "Phone line". */
  note?: string;
};

export type ServiceContact = {
  /** Main switchboard, usually 514-848-2424. */
  phone?: string;
  /** Dialled after the switchboard; kept apart so it can be shown as "ext. 3565". */
  extension?: string;
  email?: string;
  /** Canonical concordia.ca page. Every record has one — it is the source. */
  url: string;
  /** Separate booking system, where one exists. */
  bookingUrl?: string;
};

/**
 * How much to trust a record.
 *
 * `verified` means a person read the page and confirmed each field.
 * `scraped` means it came from the crawler and has not been checked — the UI
 * should not present its hours as authoritative.
 * `stub` means name and link only, pending someone doing the work.
 */
export type ServiceProvenance = 'verified' | 'scraped' | 'stub';

/**
 * A call to action on the detail screen.
 *
 * `kind` decides how it is opened, so a record never has to carry a `tel:` or
 * `mailto:` prefix — the screen builds those from `contact`.
 */
export type ServiceAction = {
  label: string;
  kind: 'book' | 'call' | 'email' | 'link' | 'directions';
  /** Needed only by `link` and `book`; the rest come off `contact`. */
  url?: string;
  /** Exactly one action per service should be primary. */
  primary?: boolean;
};

/**
 * An extra row in the Details table.
 *
 * Location and Hours are derived, so these are the service-specific ones —
 * "Wait: Same-week appointments", "Booking: Walk-in + online", "Cost: Free
 * with valid student ID". Free-form because the useful field genuinely
 * differs between a clinic and a housing office.
 */
export type ServiceDetail = {
  label: string;
  value: string;
};

export type CampusService = {
  id: string;
  name: string;
  /** One line, shown under the name in search results and lists. */
  summary: string;
  /** Full description for the detail screen. */
  description?: string;
  /** Keys from `SERVICE_CATEGORIES`, so browse and search agree. */
  categoryKeys: string[];
  location: ServiceLocation;
  access: ServiceAccess;
  /** Empty when the service publishes no schedule — not the same as closed. */
  hours: ServiceHours[];
  contact: ServiceContact;
  /** Shown above everything else — crisis lines, urgent notices. */
  urgentNote?: string;
  /** Category name shown as the hero eyebrow, e.g. "Health & wellbeing". */
  categoryLabel: string;
  actions: ServiceAction[];
  /** Service-specific Details rows, after the derived Location and Hours. */
  details: ServiceDetail[];
  provenance: ServiceProvenance;
  /** ISO date a person last confirmed this against the site. */
  lastVerified?: string;
};

/** What the status dot and label should say right now. */
export type ServiceStatus = {
  kind: 'open' | 'closed' | 'unknown' | 'always';
  label: string;
  /** Dot colour token — green when open, neutral otherwise. */
  tone: 'positive' | 'neutral';
};
