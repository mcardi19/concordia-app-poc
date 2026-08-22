import { useAppearance } from '@/design-system/theme';

/**
 * Me tab surface + accent palette (design: "05 · Me (Iteration M)").
 *
 * These are literal values from the design source rather than semantic tokens:
 * Iteration M uses a warmer, lower-contrast neutral ramp than the CDS roles,
 * and rounding them to the nearest token flattens the card hierarchy.
 */
const meThemeLight = {
  /** Source is a near-flat linear-gradient(#F2EFEF → #F3F3F3); rendered flat. */
  pageBackground: '#F3F3F3',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  /**
   * Tint for the glass cards sitting on the grey page. Lighter than the ID
   * card's 0.82 — that one straddles the burgundy seam and needs the extra
   * opacity to read as one surface; these have only grey behind them, so a
   * heavier tint would hide the refraction entirely.
   */
  cardGlassTint: 'rgba(255, 255, 255, 0.6)',

  /** Hero gradient runs brand → this. */
  heroGradientEnd: '#5E1626',
  heroChrome: 'rgba(255, 255, 255, 0.14)',
  heroDivider: 'rgba(255, 255, 255, 0.18)',
  heroStatLabel: 'rgba(255, 255, 255, 0.72)',
  heroSubtitle: 'rgba(255, 255, 255, 0.7)',
  heroAvatarBorder: 'rgba(255, 255, 255, 0.3)',

  headingText: '#0F0F10',
  metaText: '#7A7A7C',
  labelText: '#8A8A8C',
  valueText: '#3A3A3C',
  chevron: '#C8C8CA',
  /** Chevrons on glass need more weight than the flat-card ones. */
  chevronStrong: '#57575A',

  /** Overlapping avatar / service stacks. */
  stackFill: '#F2F2F3',
  stackRing: '#FFFFFF',

  sheetHandle: '#D8D8DA',
  sheetRowBorder: 'rgba(0, 0, 0, 0.08)',

  barcode: '#1A1A1A',
} as const;

/**
 * Only the six keys `EmergencyScreen.tsx` actually reads (pageBackground,
 * cardBackground, headingText, metaText, chevron, stackFill) have a real,
 * considered dark value below — the rest of the Me tab still imports the
 * light palette directly and hasn't converted yet, so those keys just copy
 * the light value forward as an inert, unverified placeholder for type-shape
 * parity until that conversion happens.
 */
const meThemeDark = {
  pageBackground: '#121214',
  cardBackground: '#1C1C1E',
  /** Unverified — no dark-mode consumer yet. */
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  /** Unverified — no dark-mode consumer yet. */
  cardGlassTint: 'rgba(255, 255, 255, 0.6)',

  /** The hero stays burgundy-branded in both app themes — unchanged. */
  heroGradientEnd: '#5E1626',
  heroChrome: 'rgba(255, 255, 255, 0.14)',
  heroDivider: 'rgba(255, 255, 255, 0.18)',
  heroStatLabel: 'rgba(255, 255, 255, 0.72)',
  heroSubtitle: 'rgba(255, 255, 255, 0.7)',
  heroAvatarBorder: 'rgba(255, 255, 255, 0.3)',

  headingText: '#F5F5F7',
  metaText: 'rgba(255, 255, 255, 0.6)',
  /** Unverified — no dark-mode consumer yet. */
  labelText: '#8A8A8C',
  /** Unverified — no dark-mode consumer yet. */
  valueText: '#3A3A3C',
  chevron: 'rgba(255, 255, 255, 0.3)',
  /** Unverified — no dark-mode consumer yet. */
  chevronStrong: '#57575A',

  stackFill: '#242426',
  /** Unverified — no dark-mode consumer yet. */
  stackRing: '#FFFFFF',

  /** Unverified — no dark-mode consumer yet. */
  sheetHandle: '#D8D8DA',
  /** Unverified — no dark-mode consumer yet. */
  sheetRowBorder: 'rgba(0, 0, 0, 0.08)',

  /** Unverified — no dark-mode consumer yet. */
  barcode: '#1A1A1A',
} as const;

export function useMeTheme() {
  const { scheme } = useAppearance();
  return scheme === 'dark' ? meThemeDark : meThemeLight;
}

/**
 * Static light palette, kept for the rest of the Me tab's components, which
 * still import this directly and haven't converted to `useMeTheme()` yet —
 * they'll stay light-only in dark mode until that happens.
 */
export const meTheme = meThemeLight;
