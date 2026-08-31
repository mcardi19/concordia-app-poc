import { useAppearance } from '@/design-system/theme';

/**
 * Me tab surface + accent palette (design: "05 · Me (Iteration M)").
 *
 * These are literal values from the design source rather than semantic tokens:
 * Iteration M uses a warmer, lower-contrast neutral ramp than the CDS roles,
 * and rounding them to the nearest token flattens the card hierarchy.
 */
const meThemeLight = {
  /** Matches the Home (Today) tab surface so the tabs share one page fill. */
  pageBackground: '#F7F7F8',
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

  /*
    Settings, the notifications inbox, and the edit-profile drawer. Unlike the
    keys above these are consumed through `useMeTheme()` from the start, so
    both halves of the pair are real values rather than placeholders.
  */

  /**
   * Destructive rows — sign out. The design's muted brick, not CDS `error`
   * (magenta): next to burgundy a true magenta reads as a second brand.
   */
  danger: '#B04A4A',
  /** Hairline between rows inside one grouped card. */
  rowDivider: 'rgba(0, 0, 0, 0.06)',
  /**
   * Hairline between rows that sit straight on the page, with no card around
   * them — the notifications inbox. Heavier than `rowDivider`: inside a white
   * card the surface edge already does most of the separating, and on open
   * page background a 6% line all but disappears.
   */
  listDivider: 'rgba(0, 0, 0, 0.14)',
  /** Resting form field in the edit-profile drawer. */
  fieldBorder: 'rgba(0, 0, 0, 0.08)',
  /** Unselected filter chip on the notifications inbox. */
  chipIdleBackground: '#FFFFFF',
  chipIdleBorder: 'rgba(0, 0, 0, 0.08)',
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

  /* Settings / notifications / edit profile — real dark values, see light. */

  /** Lifted off the light brick, which disappears against a dark page. */
  danger: '#E08585',
  rowDivider: 'rgba(255, 255, 255, 0.10)',
  listDivider: 'rgba(255, 255, 255, 0.20)',
  fieldBorder: 'rgba(255, 255, 255, 0.14)',
  chipIdleBackground: '#242426',
  chipIdleBorder: 'rgba(255, 255, 255, 0.12)',
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
