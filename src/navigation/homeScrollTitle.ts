/**
 * Helpers for Today large/compact Home title scroll coupling.
 *
 * With a transparent header + `contentInsetAdjustmentBehavior="automatic"`,
 * `contentOffset.y` at rest is often negative (≈ `-adjustedContentInset.top`).
 * Fade animations must use distance-from-top, never raw offset alone.
 */

/** Scroll distance (pt) at which large Home is fully faded out. */
export const LARGE_HOME_FADE_END = 10;

/**
 * Compact title stays hidden until content has cleared the header band
 * (session card CTAs must not sit under the centred title).
 */
export const COMPACT_HOME_FADE_START = 56;
export const COMPACT_HOME_FADE_END = 84;

/**
 * Distance scrolled from the true top.
 *
 * Prefer `contentOffset.y + insetTop` when insetTop is known.
 * Otherwise fall back to `contentOffset.y - topBaseline` where topBaseline is
 * the resting (most negative / smallest) offset observed at the top.
 */
export function scrollDistanceFromTop(
  contentOffsetY: number,
  insetTop: number,
  topBaseline: number | null = null,
): number {
  if (insetTop > 0) {
    return Math.max(0, contentOffsetY + insetTop);
  }
  if (topBaseline != null) {
    return Math.max(0, contentOffsetY - topBaseline);
  }
  return Math.max(0, contentOffsetY);
}

/** Resolve the resting top offset used when insetTop is unavailable. Locked after first sample. */
export function nextTopBaseline(
  contentOffsetY: number,
  previous: number | null,
): number {
  return previous ?? contentOffsetY;
}

/** Large Home opacity for a given scroll distance (1 at top → 0 at fadeEnd). */
export function largeHomeOpacityForScroll(
  scrollDistance: number,
  fadeEnd: number = LARGE_HOME_FADE_END,
): number {
  if (fadeEnd <= 0) {
    return scrollDistance <= 0 ? 1 : 0;
  }
  if (scrollDistance <= 0) {
    return 1;
  }
  if (scrollDistance >= fadeEnd) {
    return 0;
  }
  return 1 - scrollDistance / fadeEnd;
}
