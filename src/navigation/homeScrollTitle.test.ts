import {
  HOME_GREETING_COLLAPSE_AT,
  HOME_GREETING_EXPAND_AT,
  homeGreetingCollapsedForScroll,
  nextTopBaseline,
  scrollDistanceFromTop,
} from './homeScrollTitle';

describe('scrollDistanceFromTop', () => {
  it('uses inset when provided (automatic content inset)', () => {
    expect(scrollDistanceFromTop(-100, 100)).toBe(0);
    expect(scrollDistanceFromTop(-60, 100)).toBe(40);
  });

  it('uses top baseline when inset is missing (common on some RN builds)', () => {
    // Resting offset stuck at -91 with insetTop reported as 0
    expect(scrollDistanceFromTop(-91, 0, -91)).toBe(0);
    expect(scrollDistanceFromTop(-51, 0, -91)).toBe(40);
  });

  it('works when offset is already 0-based', () => {
    expect(scrollDistanceFromTop(0, 0, 0)).toBe(0);
    expect(scrollDistanceFromTop(12, 0, 0)).toBe(12);
  });

  it('clamps rubber-band above the top to 0', () => {
    expect(scrollDistanceFromTop(-120, 100)).toBe(0);
    expect(scrollDistanceFromTop(-120, 0, -100)).toBe(0);
  });
});

describe('nextTopBaseline', () => {
  it('locks the first sample and ignores later offsets', () => {
    expect(nextTopBaseline(-90, null)).toBe(-90);
    expect(nextTopBaseline(-40, -90)).toBe(-90);
    expect(nextTopBaseline(-110, -90)).toBe(-90);
  });
});

describe('homeGreetingCollapsedForScroll', () => {
  it('stays expanded until the greeting reaches the header', () => {
    expect(homeGreetingCollapsedForScroll(0, false)).toBe(false);
    expect(homeGreetingCollapsedForScroll(HOME_GREETING_COLLAPSE_AT - 1, false)).toBe(
      false,
    );
    expect(homeGreetingCollapsedForScroll(HOME_GREETING_COLLAPSE_AT, false)).toBe(
      true,
    );
  });

  it('expands before the page is fully back at the top', () => {
    expect(homeGreetingCollapsedForScroll(HOME_GREETING_EXPAND_AT + 20, true)).toBe(
      true,
    );
    expect(homeGreetingCollapsedForScroll(HOME_GREETING_EXPAND_AT + 1, true)).toBe(
      true,
    );
    expect(homeGreetingCollapsedForScroll(HOME_GREETING_EXPAND_AT, true)).toBe(
      false,
    );
    expect(homeGreetingCollapsedForScroll(16, true)).toBe(false);
  });

  it('does not chatter between the two thresholds', () => {
    const mid = (HOME_GREETING_EXPAND_AT + HOME_GREETING_COLLAPSE_AT) / 2;
    expect(homeGreetingCollapsedForScroll(mid, false)).toBe(false);
    expect(homeGreetingCollapsedForScroll(mid, true)).toBe(true);
  });
});
