import {
  largeHomeOpacityForScroll,
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

describe('largeHomeOpacityForScroll', () => {
  const fadeEnd = 10;

  it('is fully visible at the top', () => {
    expect(largeHomeOpacityForScroll(0, fadeEnd)).toBe(1);
  });

  it('is gone by fadeEnd — before a session card can overlap', () => {
    expect(largeHomeOpacityForScroll(10, fadeEnd)).toBe(0);
    expect(largeHomeOpacityForScroll(40, fadeEnd)).toBe(0);
  });

  it('interpolates through the fade range', () => {
    expect(largeHomeOpacityForScroll(5, fadeEnd)).toBe(0.5);
  });

  it('regression: negative raw offset without baseline keeps opacity at 1', () => {
    expect(largeHomeOpacityForScroll(scrollDistanceFromTop(-60, 0, null), fadeEnd)).toBe(1);
    expect(largeHomeOpacityForScroll(scrollDistanceFromTop(-60, 0, -100), fadeEnd)).toBe(0);
  });
});
