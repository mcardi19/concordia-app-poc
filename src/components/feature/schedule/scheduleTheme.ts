/**
 * Schedule tab palette (design: "Timetable flow · Schedule views").
 * Literal values from the design source — the neutral ramp is warmer and
 * lower-contrast than the CDS roles, and rounding to tokens flattens the
 * timeline hierarchy.
 *
 * Type uses the shared `Text` component (SF Pro / System on iOS) — never Inter.
 */
export const scheduleTheme = {
  pageBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  /** Rule under the week strip and all-day banner. */
  mastheadBorder: 'rgba(0, 0, 0, 0.24)',

  /** Hour labels and hairlines on the time rail. */
  railLabel: '#A8A8AA',
  railLine: 'rgba(0, 0, 0, 0.05)',

  headingText: '#0F0F10',
  bodyText: '#1A1216',
  metaText: '#9A9A9C',
  timeText: '#2A2226',
  timeSubText: '#8A8A8C',
  dividerText: '#3A3236',
  dividerMuted: '#B0AEB0',

  /** Agenda rails: class vs study block. */
  agendaRail: '#E4DEE0',
  agendaRailStudy: '#D8D2D4',
  studyLabel: '#9A9A9C',

  /** All-day banner: front card, stacked card behind it. */
  allDayFill: '#F6EEF0',
  allDayStackFill: '#FBF4F6',

  /**
   * Course blocks on the timeline — an 18% wash of `#912338` on white, about
   * twice the strength of the all-day fill. A block is the densest thing on
   * the grid, so it carries more of the brand than the banner above it.
   */
  eventFill: '#EBD7DB',

  /** Floating add button. */
  fabFill: '#F4E7EA',

  /** Neutral tints for non-class blocks. */
  tintStudy: '#7A7A7C',
  tintMutedBlock: '#C8C8CA',
} as const;

/** Timeline geometry, shared so the rail and the blocks cannot drift. */
/** Full calendar day — 12 AM through 11 PM. */
export const DAY_HOUR_START = 0;
export const DAY_HOUR_END = 23;
/** Row height per hour in the single-day timeline. */
export const DAY_HOUR_HEIGHT = 44;
/** Tighter rows in the 3-day planner, where columns are narrow. */
export const PLANNER_HOUR_HEIGHT = 36;
/** Width of the left-hand hour label gutter. */
export const RAIL_WIDTH = 46;
/**
 * Gap between the hour gutter and the blocks, so a block never crowds the
 * time labels. Shared with the all-day card, which sits on the same axis and
 * has to start on the same edge as the blocks below it.
 */
export const GRID_INSET = 8;
/**
 * Line box of an hour label — `caption` is 12pt on a 1.4 ratio, and the rail
 * overrides the size but not the ratio. Exported so the hour hairlines can
 * centre on the label rather than guessing an offset from its top.
 */
export const HOUR_LABEL_LINE_HEIGHT = 12 * 1.4;
