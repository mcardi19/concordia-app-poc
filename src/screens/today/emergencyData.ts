/**
 * Emergency & crisis resources (design: "01b · Emergency & crisis").
 *
 * Numbers and copy come from the design, which cites
 * concordia.ca/health/emergency.html as its source.
 */

/** The one page every resource row is known to be reachable from. */
export const CONCORDIA_EMERGENCY_URL = 'https://www.concordia.ca/health/emergency.html';

export type EmergencyCall = {
  /** "On campus" / "Off campus". */
  scope: string;
  name: string;
  /** As printed — dialled through `telHref`. */
  phone: string;
  telHref: string;
  /** The one to reach for first, rendered as the filled button. */
  primary?: boolean;
};

export const EMERGENCY_CALLS: EmergencyCall[] = [
  {
    scope: 'On campus',
    name: 'Campus Safety & Prevention',
    phone: '514-848-3717',
    telHref: 'tel:5148483717',
    primary: true,
  },
  {
    scope: 'Off campus',
    name: 'Emergency services',
    phone: '911',
    telHref: 'tel:911',
  },
];

export type Helpline = {
  name: string;
  detail: string;
  phone: string;
  telHref: string;
  /** Secondary route — a text line or a website, shown as plain text. */
  alt?: string;
};

export const CRISIS_HELPLINES: Helpline[] = [
  {
    name: 'Tracom crisis intervention',
    detail: 'In-person intervention by crisis workers and short-term housing.',
    phone: '514-483-3033',
    telHref: 'tel:5144833033',
  },
  {
    name: 'Suicidal thoughts or feelings',
    detail: 'Free, confidential support in French and English.',
    // 1-866-APPELLE dials 1-866-277-3553.
    phone: '1-866-APPELLE',
    telHref: 'tel:18662773553',
    alt: 'Text 535353 · suicide.ca',
  },
  {
    name: 'Sexual assault crisis line',
    detail: '24/7 support for survivors, friends and family.',
    phone: '514-933-9007',
    telHref: 'tel:5149339007',
  },
];

export type EmergencyResource = {
  label: string;
  detail: string;
  url: string;
};

/**
 * Deep links are not in the design, and guessing concordia.ca slugs would ship
 * dead links on a page people reach in a crisis — so every row goes to the
 * emergency hub, which links onward to all of them. Swap in the real URLs as
 * they are confirmed.
 */
export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    label: 'Mental health services',
    detail: 'Counselling, helplines, tools',
    url: CONCORDIA_EMERGENCY_URL,
  },
  {
    label: 'Medical services',
    detail: 'On-campus clinic & community',
    url: CONCORDIA_EMERGENCY_URL,
  },
  {
    label: 'Sexual Assault Resource Centre',
    detail: 'Confidential support & advocacy',
    url: CONCORDIA_EMERGENCY_URL,
  },
  {
    label: 'Access Centre for Students',
    detail: 'Disability & accessibility',
    url: CONCORDIA_EMERGENCY_URL,
  },
  {
    label: 'Responding to a student in distress',
    detail: 'For faculty & staff',
    url: CONCORDIA_EMERGENCY_URL,
  },
];
