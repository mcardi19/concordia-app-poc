/**
 * Search & discovery palette (design: "Search / Discovery").
 *
 * Literal values from the design source rather than semantic tokens, matching
 * how the Me and Schedule surfaces are handled — the discovery screens use a
 * warmer neutral ramp than the CDS roles, and rounding to the nearest token
 * flattens the grouped-card hierarchy.
 */
export const searchTheme = {
  pageBackground: '#F3F3F3',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  rowDivider: 'rgba(0, 0, 0, 0.07)',

  headingText: '#0F0F10',
  bodyText: '#2A2428',
  metaText: '#7A7A7C',
  /** Group labels above each card. */
  eyebrowText: '#9A9498',
  eyebrowCount: '#C4BEC2',
  chevron: '#C4BEC2',

  /** Neutral chip behind a recent-search icon. */
  recentFill: '#F5F2F3',

  /** Service open/closed dots. */
  statusOpen: '#3A8A5A',
  statusNeutral: '#7A7A7C',
} as const;
