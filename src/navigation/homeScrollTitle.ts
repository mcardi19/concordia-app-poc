/**
 * Helpers for Today large/compact Home title.
 *
 * The morph is not scroll-scrubbed. Crossing a distance threshold (the large
 * title reaching the header) starts a fixed-duration timing. Scroll velocity
 * only decides *when* it runs, never how fast.
 *
 * With a transparent header + `contentInsetAdjustmentBehavior="automatic"`,
 * `contentOffset.y` at rest is often negative (≈ `-adjustedContentInset.top`).
 * Distance-from-top must use inset, never raw offset alone.
 */

/**
 * Scroll distance (pt) at which the in-flow greeting has tucked under the
 * header. Crossing this starts the collapse timing.
 */
export const HOME_GREETING_COLLAPSE_AT = 64;

/**
 * Scrolling back up past this brings the large greeting in — before the
 * page is fully at rest, so it does not wait for the true top.
 */
export const HOME_GREETING_EXPAND_AT = 44;

/** Large in-flow greeting fade. */
export const HOME_GREETING_DURATION = 280;

/** Compact header title + date — slower so they settle after the large title. */
export const HOME_GREETING_COMPACT_DURATION = 520;

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

/**
 * Whether the compact header greeting should be showing, with hysteresis so a
 * value sitting on the trigger does not flip every frame.
 */
export function homeGreetingCollapsedForScroll(
  scrollDistance: number,
  currentlyCollapsed: boolean,
  collapseAt: number = HOME_GREETING_COLLAPSE_AT,
  expandAt: number = HOME_GREETING_EXPAND_AT,
): boolean {
  if (currentlyCollapsed) {
    return scrollDistance > expandAt;
  }
  return scrollDistance >= collapseAt;
}
