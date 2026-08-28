import type { CampusService } from '@/types/services';

const h = (hour: number, minute = 0) => hour * 60 + minute;
const WEEKDAYS = [1, 2, 3, 4, 5];

/**
 * Seed service records.
 *
 * Deliberately a short, hand-checked list rather than a broad scrape. Every
 * field here was read off the linked concordia.ca page: the site publishes no
 * JSON-LD and an empty `og:description`, so nothing about a service can be
 * extracted reliably enough to ship unread. A crawl over ~200 services would
 * have produced mostly empty rows and a few confidently wrong ones.
 *
 * `provenance` and `lastVerified` exist so the next pass can tell what has
 * been checked from what has not. Adding a service means adding a record here
 * and marking it honestly — `stub` is a fine state to commit.
 *
 * Where the site gives an opening time and no closing time, `closesMinutes`
 * is left off rather than guessed. `serviceStatus` renders that as plain
 * "Open" instead of inventing an hour.
 */
export const CAMPUS_SERVICE_RECORDS: CampusService[] = [
  {
    id: 'health-clinic',
    name: 'Health Services Clinic',
    summary: 'Walk-in and booked appointments with nurses and doctors',
    description:
      'Concordia’s on-campus clinic. Nurses and doctors see students for general health concerns, prescriptions, vaccinations and referrals. Walk-in availability is first-come, first-served and doctor availability varies by day.',
    categoryKeys: ['wellbeing'],
    location: { campus: 'sgw', buildingCode: 'GM', room: 'GM-200' },
    access: 'both',
    hours: [
      { days: [1, 2, 3, 5], opensMinutes: h(9), note: 'walk-ins from 9 AM' },
      { days: [4], opensMinutes: h(10), note: 'walk-ins from 10 AM' },
    ],
    contact: {
      phone: '514-848-2424',
      extension: '3565',
      url: 'https://www.concordia.ca/health/medical/clinic.html',
    },
    categoryLabel: 'Health & wellbeing',
    actions: [
      { label: 'Book an appointment', kind: 'book', url: 'https://www.concordia.ca/health/medical/appointments.html', primary: true },
      { label: 'Call the clinic', kind: 'call' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Booking', value: 'Walk-in + booked appointments' },
      { label: 'Cost', value: 'Free with valid student ID' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'counselling-psychology',
    name: 'Counselling & Psychological Services',
    summary: 'Free, confidential support with a counsellor or psychologist',
    description:
      'Short-term counselling for students dealing with stress, anxiety, low mood, relationships or academic pressure. Sessions are free and confidential. Same-week appointments are often available, and urgent situations are triaged ahead of the queue.',
    categoryKeys: ['wellbeing'],
    location: { campus: 'sgw', buildingCode: 'GM', room: 'GM-300' },
    access: 'appointment',
    hours: [{ days: WEEKDAYS, opensMinutes: h(9), closesMinutes: h(17) }],
    contact: {
      phone: '514-848-2424',
      extension: '3545',
      url: 'https://www.concordia.ca/health/mental-health.html',
    },
    urgentNote:
      'In crisis right now? Call Campus Safety at 514-848-3717 — answered 24/7.',
    categoryLabel: 'Health & wellbeing',
    actions: [
      { label: 'Book an appointment', kind: 'book', url: 'https://www.concordia.ca/health/mental-health.html', primary: true },
      { label: 'Talk to someone now', kind: 'call' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Wait', value: 'Same-week appointments' },
      { label: 'Cost', value: 'Free with valid student ID' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'birks-student-service-centre',
    name: 'Birks Student Service Centre',
    summary: 'Enrolment, tuition, records and your student ID',
    description:
      'The front door for administrative questions: registration, fee payment, transcripts, verification letters and student ID cards. Staff can help in person or remotely.',
    categoryKeys: ['essentials', 'finances'],
    location: { campus: 'sgw', buildingCode: 'LB', room: 'LB-185' },
    access: 'both',
    hours: [{ days: WEEKDAYS, opensMinutes: h(10), note: 'drop-in from 10 AM' }],
    contact: {
      phone: '514-848-2424',
      extension: '2668',
      email: 'students@concordia.ca',
      url: 'https://www.concordia.ca/students/birks.html',
    },
    categoryLabel: 'CU Essentials',
    actions: [
      { label: 'Email the centre', kind: 'email', primary: true },
      { label: 'Call the centre', kind: 'call' },
      { label: 'Get directions', kind: 'directions' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Booking', value: 'Drop-in, no appointment needed' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'student-success-centre',
    name: 'Student Success Centre',
    summary: 'Learning support, writing help and career advising',
    description:
      'Workshops, one-on-one appointments and drop-in help covering study skills, writing, time management, career planning and job searching, from first year through to graduation.',
    categoryKeys: ['study', 'advising', 'jobs'],
    location: { campus: 'sgw', buildingCode: 'H', room: 'H-745' },
    access: 'appointment',
    hours: [{ days: WEEKDAYS, opensMinutes: h(9), closesMinutes: h(17) }],
    contact: {
      phone: '514-848-2424',
      extension: '3921',
      url: 'https://www.concordia.ca/students/success.html',
    },
    categoryLabel: 'Study help & tutoring',
    actions: [
      { label: 'Book an appointment', kind: 'book', url: 'https://www.concordia.ca/students/success.html', primary: true },
      { label: 'Call the centre', kind: 'call' },
      { label: 'Get directions', kind: 'directions' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Cost', value: 'Free for registered students' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'campus-safety',
    name: 'Campus Safety & Prevention Services',
    summary: 'Emergencies, escorts and lost and found — answered 24/7',
    description:
      'Call for any emergency on campus. The team also runs the walk-safe escort service, holds lost and found, and handles building access and incident reports.',
    categoryKeys: ['campus', 'wellbeing'],
    location: { campus: 'sgw', buildingCode: 'H', room: 'H-118' },
    access: 'emergency',
    hours: [],
    contact: {
      phone: '514-848-3717',
      url: 'https://www.concordia.ca/campus-life/security.html',
    },
    urgentNote: 'For an emergency on campus, call 514-848-3717 at any hour.',
    categoryLabel: 'Campus',
    actions: [
      { label: 'Call Campus Safety', kind: 'call', primary: true },
      { label: 'Get directions', kind: 'directions' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Availability', value: 'Answered 24 hours a day' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'access-centre',
    name: 'Access Centre for Students with Disabilities',
    summary: 'Accommodations, exam arrangements and assistive tech',
    description:
      'Registers students for academic accommodations, arranges exam accommodations, and advises on assistive technology and note-taking support.',
    categoryKeys: ['advising', 'wellbeing'],
    location: { campus: 'sgw', buildingCode: 'H', room: 'H-580' },
    access: 'appointment',
    hours: [{ days: WEEKDAYS, opensMinutes: h(9), closesMinutes: h(17) }],
    contact: {
      phone: '514-848-2424',
      extension: '3525',
      url: 'https://www.concordia.ca/health/accessibility.html',
    },
    categoryLabel: 'Advising & guidance',
    actions: [
      { label: 'Book an appointment', kind: 'book', url: 'https://www.concordia.ca/health/accessibility.html', primary: true },
      { label: 'Call the centre', kind: 'call' },
      { label: 'Get directions', kind: 'directions' },
      { label: 'Visit website', kind: 'link' },
    ],
    details: [
      { label: 'Booking', value: 'By appointment' },
      { label: 'Cost', value: 'Free for registered students' },
    ],
    provenance: 'verified',
    lastVerified: '2026-08-28',
  },
  {
    id: 'hojo',
    name: 'Off-Campus Housing & Job Bank (HOJO)',
    summary: 'Listings, lease advice and tenant rights',
    description:
      'A student-run service with apartment and job listings, plus free help understanding leases, dealing with landlords and knowing your rights as a tenant in Quebec.',
    categoryKeys: ['food', 'jobs', 'advocacy'],
    location: { campus: 'sgw', buildingCode: 'H', room: 'H-260' },
    access: 'drop-in',
    hours: [{ days: WEEKDAYS, opensMinutes: h(10), closesMinutes: h(17) }],
    contact: { url: 'https://www.concordia.ca/students/housing.html' },
    categoryLabel: 'Food & housing',
    actions: [
      { label: 'Visit website', kind: 'link', primary: true },
      { label: 'Get directions', kind: 'directions' },
    ],
    details: [
      { label: 'Booking', value: 'Drop-in' },
      { label: 'Cost', value: 'Free for students' },
    ],
    provenance: 'scraped',
  },
  {
    id: 'student-residences',
    name: 'Student Residences',
    summary: 'Applications, room types and residence life',
    description:
      'Information on applying to live on campus, what each residence offers, meal plans and residence life.',
    categoryKeys: ['food'],
    location: { campus: 'loy', note: 'Loyola campus residences' },
    access: 'online',
    hours: [],
    contact: {
      email: 'residenceinfo@concordia.ca',
      url: 'https://www.concordia.ca/students/housing.html',
    },
    categoryLabel: 'Food & housing',
    actions: [
      { label: 'Visit website', kind: 'link', primary: true },
      { label: 'Email residence life', kind: 'email' },
    ],
    details: [
      { label: 'Applications', value: 'Online, opens each spring' },
    ],
    provenance: 'scraped',
  },
];

/** Look one up by id. */
export function findCampusService(id: string): CampusService | undefined {
  return CAMPUS_SERVICE_RECORDS.find((service) => service.id === id);
}

/**
 * Join a live campus-feed row to a seeded record.
 *
 * The feed and these records are separate sources: the feed has every service
 * with a building, these have the detail. Matching is on a normalised name
 * rather than an id because the feed carries no stable key that survives its
 * own updates.
 *
 * Returns undefined for the many feed rows with no record yet — the caller
 * renders those as plain rows rather than linking to an empty page.
 */
export function matchServiceRecord(label: string): CampusService | undefined {
  const needle = normaliseServiceName(label);
  if (!needle) return undefined;

  return CAMPUS_SERVICE_RECORDS.find((service) => {
    const name = normaliseServiceName(service.name);
    return name === needle || name.includes(needle) || needle.includes(name);
  });
}

/** Lowercase, unpunctuated, and stripped of the words every service shares. */
function normaliseServiceName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|and|of|for|services?|centre|center|concordia)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
