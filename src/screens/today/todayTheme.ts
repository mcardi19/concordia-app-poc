import { useAppearance } from '@/design-system/theme';

/** Today tab accents and page surface. */
const todayThemeLight = {
  pageBackground: '#F7F7F8',
  cardBackground: '#FFFFFF',
  accentMuted: 'rgba(0, 0, 0, 0.05)',
  labelCaps: '#912338',
  /** Primary session card CTA — brand fill, white label. */
  sessionButton: '#912338',
  sessionButtonLabel: '#FFFFFF',
  /** 1px rule above the Ends / Room / CTA row. */
  sessionMetaRule: 'rgba(255, 255, 255, 0.2)',
  sessionMetaLabel: 'rgba(255, 255, 255, 0.72)',
  sessionCourseCode: 'rgba(255, 255, 255, 0.88)',
} as const;

const todayThemeDark = {
  pageBackground: '#121214',
  cardBackground: '#1C1C1E',
  accentMuted: 'rgba(255, 255, 255, 0.06)',
  labelCaps: '#D9748C',
  /** Primary session card CTA — the lighter dark-mode brand tint, dark label
   *  (white-on-tint contrast is too weak at this fill's lightness). */
  sessionButton: '#D9748C',
  sessionButtonLabel: '#121214',
  /** Sits on the hero photo's scrim, not the page — same in both themes. */
  sessionMetaRule: 'rgba(255, 255, 255, 0.2)',
  sessionMetaLabel: 'rgba(255, 255, 255, 0.72)',
  sessionCourseCode: 'rgba(255, 255, 255, 0.88)',
} as const;

export function useTodayTheme() {
  const { scheme } = useAppearance();
  return scheme === 'dark' ? todayThemeDark : todayThemeLight;
}
