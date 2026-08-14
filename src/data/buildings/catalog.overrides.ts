import type { BuildingCatalogRecord } from './types';

/**
 * Hand-curated fields from concordia.ca/maps/buildings detail pages.
 * The sync script merges these with XML-derived services, departments, and amenities.
 */
export const CATALOG_OVERRIDES: Record<
  string,
  Partial<Omit<BuildingCatalogRecord, 'campusId' | 'code'>>
> = {
  'sgw-EV': {
    aliases: [
      'EV',
      'Engineering, Computer Science and Visual Arts Integrated Complex',
      'EV Building',
      'Engineering and Visual Arts',
    ],
    overview:
      'Opened in 2005, the 17-storey EV complex unites the Gina Cody School of Engineering and Computer Science and the Faculty of Fine Arts. Two towers connected on every floor, with labs, studios, a fitness centre, and an underground tunnel to GM and Guy-Concordia metro.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
  },
  'sgw-GM': {
    aliases: ['GM', 'Guy-De Maisonneuve', 'Guy De Maisonneuve', 'Guy-Concordia'],
    overview:
      'Completed in 1966 above Guy-Concordia metro, GM now houses administrative offices and School of Performance studios. Connected to EV and the metro by underground tunnels.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
  },
  'sgw-GN': {
    aliases: ['GN', 'Grey Nuns', 'Grey Nuns Building', 'Grey Nuns Mother House'],
    library: 'greynuns',
    overview:
      'Former Grey Nuns Mother House (1871), acquired in 2007. Residence for about 600 undergraduates, with a reading room, observation nursery, and kitchen serving both campuses.',
    accessibility: [
      'Accessibility ramp',
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
    venues: ['Classroom entrance (1175 St-Mathieu St.)', 'Grey Nuns Garden'],
  },
  'sgw-H': {
    aliases: ['H', 'Hall', 'Henry F. Hall', 'Hall Building', 'Henry F. Hall Building'],
    overview:
      'Completed in 1966, the Hall Building is a Brutalist academic and social hub. Social-science departments, classrooms, engineering labs, the Student Success Centre, Concordia Theatre, Hive Café, Reggie’s, and the People’s Potato.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
    venues: [
      'Concordia Theatre',
      "Reggie's",
      'Sir George Williams University Alumni Auditorium',
    ],
  },
  'sgw-LB': {
    aliases: [
      'LB',
      'McConnell',
      'J.W. McConnell',
      'J.W. McConnell Building',
      'Webster',
      'Webster Library',
    ],
    library: 'webster',
    overview:
      'Opened in 1992. Lower floors hold student services, bookstore, print shop and gallery; floors 2–5 are the R. Howard Webster Library. Linked by tunnel to Hall and Guy-Concordia metro.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
    venues: [
      '4TH SPACE',
      'Atrium',
      'J.A. De Sève Cinema',
      'Leonard and Bina Ellen Art Gallery',
      'SHIFT Centre for Social Transformation',
    ],
  },
  'sgw-LS': {
    aliases: ['LS', 'Learning Square', 'Learning Square (LS Building)'],
  },
  'sgw-MB': {
    aliases: ['MB', 'John Molson', 'John Molson Building', 'JMSB', 'Molson'],
    overview:
      'Opened in 2009 at Guy and De Maisonneuve. 15 storeys with teaching amphitheatres, case rooms, research labs, and a tunnel under Guy Street to the metro and EV. LEED Silver.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
    venues: ['Concordia Conference Centre, 9th Floor', 'Cloud Deck', 'Goodman Institute'],
  },
  'sgw-VA': {
    aliases: ['VA', 'Visual Arts', 'Visual Arts Building'],
  },
  'loy-CC': {
    aliases: ['CC', 'Central', 'Central Building'],
  },
  'loy-DO': {
    aliases: ['DO', 'Stinger Dome', 'Stinger Dome (seasonal)'],
  },
  'loy-FC': {
    aliases: ['FC', 'F.C. Smith Building', 'F. C. Smith Building'],
  },
  'loy-SH': {
    aliases: ['SH', 'Future Buildings Laboratory', 'Solar House'],
  },
  'loy-SP': {
    aliases: ['SP', 'Science Complex', 'Richard J. Renaud Science Complex', 'Renaud'],
  },
  'loy-VE': {
    aliases: ['VE', 'Vanier Extension'],
    library: 'vanier',
  },
  'loy-VL': {
    aliases: ['VL', 'Vanier', 'Vanier Library', 'Georges P. Vanier Library'],
    library: 'vanier',
    overview:
      'Named for Loyola alumnus Georges P. Vanier. Library since 1964; doubled in 1989 with the Vanier Extension. Silent and collaborative study, 22 learning spaces, and bookable group rooms.',
    accessibility: [
      'Accessible entrance with an automated door',
      'Accessible elevator',
    ],
  },
};

/** Official directory from concordia.ca/maps/buildings.html */
export const WEBSITE_DIRECTORY: Array<{
  campusId: 'sgw' | 'loy';
  code: string;
  name: string;
  address: string;
}> = [
  { campusId: 'sgw', code: 'B', name: 'B Annex', address: '2160 Bishop St.' },
  { campusId: 'sgw', code: 'CL', name: 'CL Annex', address: '1665 Ste-Catherine St. W.' },
  { campusId: 'sgw', code: 'D', name: 'D Annex', address: '2140 Bishop St.' },
  { campusId: 'sgw', code: 'EN', name: 'EN Annex', address: '2070 Mackay St.' },
  { campusId: 'sgw', code: 'ER', name: 'ER Building', address: '2155 Guy St.' },
  {
    campusId: 'sgw',
    code: 'EV',
    name: 'Engineering, Computer Science and Visual Arts Integrated Complex',
    address: '1515 Ste-Catherine St. W.',
  },
  { campusId: 'sgw', code: 'FA', name: 'FA Annex', address: '2060 Mackay St.' },
  {
    campusId: 'sgw',
    code: 'FB',
    name: 'Faubourg Building',
    address: '1250 Guy St. / 1600 Ste-Catherine St. W.',
  },
  {
    campusId: 'sgw',
    code: 'FG',
    name: 'Faubourg Ste-Catherine Building',
    address: '1610 Ste-Catherine St. W.',
  },
  { campusId: 'sgw', code: 'GA', name: 'Grey Nuns Annex', address: '1211-1215 St-Mathieu St.' },
  {
    campusId: 'sgw',
    code: 'GM',
    name: 'Guy-De Maisonneuve Building',
    address: '1550 De Maisonneuve Blvd. W.',
  },
  {
    campusId: 'sgw',
    code: 'GN',
    name: 'Grey Nuns Building',
    address: '1190 Guy St. / 1175 St-Mathieu St.',
  },
  {
    campusId: 'sgw',
    code: 'H',
    name: 'Henry F. Hall Building',
    address: '1455 De Maisonneuve Blvd. W.',
  },
  { campusId: 'sgw', code: 'K', name: 'K Annex', address: '2150 Bishop St.' },
  {
    campusId: 'sgw',
    code: 'LB',
    name: 'J.W. McConnell Building',
    address: '1400 De Maisonneuve Blvd. W.',
  },
  { campusId: 'sgw', code: 'LD', name: 'LD Building', address: '1424 Bishop St.' },
  { campusId: 'sgw', code: 'LS', name: 'Learning Square', address: '1535 De Maisonneuve Blvd. W.' },
  { campusId: 'sgw', code: 'MB', name: 'John Molson Building', address: '1450 Guy St.' },
  { campusId: 'sgw', code: 'MI', name: 'MI Annex', address: '2130 Bishop St.' },
  { campusId: 'sgw', code: 'MU', name: 'MU Annex', address: '2170 Bishop St.' },
  { campusId: 'sgw', code: 'P', name: 'P Annex', address: '2020 Mackay St.' },
  { campusId: 'sgw', code: 'PR', name: 'PR Annex', address: '2100 Mackay St.' },
  { campusId: 'sgw', code: 'Q', name: 'Q Annex', address: '2010 Mackay St.' },
  { campusId: 'sgw', code: 'R', name: 'R Annex', address: '2050 Mackay St.' },
  { campusId: 'sgw', code: 'RR', name: 'RR Annex', address: '2040 Mackay St.' },
  { campusId: 'sgw', code: 'T', name: 'T Annex', address: '2030 Mackay St.' },
  { campusId: 'sgw', code: 'V', name: 'V Annex', address: '2110 Mackay St.' },
  {
    campusId: 'sgw',
    code: 'VA',
    name: 'Visual Arts Building',
    address: '1395 René-Lévesque Blvd. W.',
  },
  { campusId: 'sgw', code: 'X', name: 'X Annex', address: '2080 Mackay St.' },
  { campusId: 'loy', code: 'AD', name: 'Administration Building', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'BB', name: 'BB Annex', address: '3502 Belmore Ave.' },
  { campusId: 'loy', code: 'BH', name: 'BH Annex', address: '3500 Belmore Ave.' },
  { campusId: 'loy', code: 'CC', name: 'Central Building', address: '7141 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'CJ',
    name: 'Communication Studies and Journalism Building',
    address: '7141 Sherbrooke St. W.',
  },
  { campusId: 'loy', code: 'DO', name: 'Stinger Dome', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'FC', name: 'F.C. Smith Building', address: '7141 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'GE',
    name: 'Centre for Structural and Functional Genomics',
    address: '7141 Sherbrooke St. W.',
  },
  { campusId: 'loy', code: 'HA', name: 'Hingston Hall, wing HA', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'HB', name: 'Hingston Hall, wing HB', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'HC', name: 'Hingston Hall, wing HC', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'HU', name: 'Applied Science Hub', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'JR', name: 'Jesuit Residence', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'PC', name: 'PERFORM Centre', address: '7200 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'PS',
    name: 'Physical Services Building',
    address: '7141 Sherbrooke St. W.',
  },
  { campusId: 'loy', code: 'PT', name: 'Oscar Peterson Concert Hall', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'PY', name: 'Psychology Building', address: '7141 Sherbrooke St. W.' },
  { campusId: 'loy', code: 'QA', name: 'Quadrangle', address: '7141 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'RA',
    name: 'Recreation and Athletics Complex',
    address: '7200 Sherbrooke St. W.',
  },
  {
    campusId: 'loy',
    code: 'RF',
    name: 'Loyola Jesuit Hall and Conference Centre',
    address: '7141 Sherbrooke St. W.',
  },
  { campusId: 'loy', code: 'SC', name: 'Student Centre', address: '7141 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'SH',
    name: 'Future Buildings Laboratory',
    address: '7141 Sherbrooke St. W.',
  },
  {
    campusId: 'loy',
    code: 'SP',
    name: 'Richard J. Renaud Science Complex',
    address: '7141 Sherbrooke St. W.',
  },
  { campusId: 'loy', code: 'TA', name: 'Terrebonne Building', address: '7079 de Terrebonne St.' },
  { campusId: 'loy', code: 'VE', name: 'Vanier Extension', address: '7141 Sherbrooke St. W.' },
  {
    campusId: 'loy',
    code: 'VL',
    name: 'Vanier Library Building',
    address: '7141 Sherbrooke St. W.',
  },
];
