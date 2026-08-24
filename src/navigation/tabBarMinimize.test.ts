import { tabBarMinimizeDecision } from './tabBarMinimize';
import type { TabBarMinimizeBehavior } from './tabBarMinimize';

/**
 * The rule runs on the UI thread once per scroll frame, so its thresholds are
 * hard to observe by hand — a wrong anchor reads as "the tab bar sometimes
 * doesn't come back", not as an obvious break.
 */
describe('tabBarMinimizeDecision', () => {
  it('re-expands at the top of the page', () => {
    expect(tabBarMinimizeDecision(0, 500, 'none').behavior).toBe('onScrollDown');
  });

  it('ignores top rubber-band, which reports a negative offset', () => {
    expect(tabBarMinimizeDecision(-120, 0, 'onScrollDown').behavior).toBe('onScrollDown');
  });

  it('holds the anchor while the offset stays inside the threshold', () => {
    const decision = tabBarMinimizeDecision(103, 100, 'onScrollDown');
    expect(decision.behavior).toBe('onScrollDown');
    // Anchor must not follow the frame, or the delta resets to ~0 every frame.
    expect(decision.anchorY).toBe(100);
  });

  it('accumulates a slow scroll-up into a direction change', () => {
    let anchor = 100;
    let behavior: TabBarMinimizeBehavior = 'onScrollDown';

    // 3pt per frame — each step alone is under the 6pt threshold.
    for (const y of [97, 94, 91, 88]) {
      const decision = tabBarMinimizeDecision(y, anchor, behavior);
      anchor = decision.anchorY;
      behavior = decision.behavior;
    }

    expect(behavior).toBe('none');
  });

  it('re-expands on a decisive scroll down', () => {
    expect(tabBarMinimizeDecision(200, 100, 'none').behavior).toBe('onScrollDown');
  });
});
