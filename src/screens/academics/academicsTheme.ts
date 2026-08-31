/**
 * Academics surface palette, taken literally from the design canvas rather
 * than rounded to CDS roles — same reasoning as `meTheme`: the flow uses a
 * warmer, lower-contrast neutral ramp and rounding flattens the hierarchy.
 */
export const academicsTheme = {
  /** Matches the Home (Today) tab surface so the tabs share one page fill. */
  pageBackground: '#F7F7F8',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.05)',

  /** Masthead gradient runs brand → this, matching the Me hero. */
  heroGradientEnd: '#5E1626',
  heroStatLabel: 'rgba(255, 255, 255, 0.72)',
  heroSubtitle: 'rgba(255, 255, 255, 0.82)',
  heroMeta: 'rgba(255, 255, 255, 0.7)',
  heroDivider: 'rgba(255, 255, 255, 0.18)',
  heroChrome: 'rgba(255, 255, 255, 0.16)',
  heroPill: 'rgba(255, 255, 255, 0.22)',

  headingText: '#0F0F10',
  metaText: '#7A7A7C',
  mutedText: '#A8A8AA',
  chevron: '#C98A99',

  /** Chip fill for an unselected calendar filter. */
  filterIdle: '#FFFFFF',
  filterBorder: 'rgba(0, 0, 0, 0.1)',
  pendingFill: '#F0F0F1',
  pendingBorder: 'rgba(0, 0, 0, 0.08)',
  pendingText: '#B4B4B6',
} as const;
