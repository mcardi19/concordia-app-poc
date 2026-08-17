import { classesOn } from '@/components/feature/today/todaySession';
import { getDayKey } from '@/components/feature/schedule/scheduleUtils';
import type { ScheduleEvent } from '@/components/feature/schedule/scheduleTypes';
import { buildingForRoom, walkMinutesFromCoords } from './buildingPresentation';
import type { BuildingSummary, CampusCode } from '@/types/campus';

/**
 * The campus map's contextual layer.
 *
 * ---------------------------------------------------------------------------
 * Why this is a ranker and not nine cards
 * ---------------------------------------------------------------------------
 *
 * The design (Contextual map experiences) draws nine cards, one per situation:
 * going to class, leave-now, shuttle stop, arrived near a building,
 * accessibility disruption, emergency closure, cross-campus commute, nearby
 * discovery, and one showing several of them competing.
 *
 * Nine bespoke layouts do not scale — each has its own copy and its own
 * actions, so a tenth situation means a tenth card. The frame worth keeping
 * is the one that looks least like a feature: several situations compete,
 * one wins the slot, the rest stand down. That generalises; the cards are
 * just its instances.
 *
 * So this is a list of providers. Each looks at the moment and returns a card
 * or nothing, and the map shows the highest-ranked. Adding a situation is a
 * provider, not a screen.
 *
 * ---------------------------------------------------------------------------
 * What is deliberately missing, and what it would take
 * ---------------------------------------------------------------------------
 *
 * These are not oversights. Each needs something the app does not have, and a
 * card for a trigger that can never fire is worse than no card:
 *
 *   Arrived near a building  Needs continuous location. Everything here uses
 *                            one-shot `getCurrentPositionAsync`; a geofence
 *                            means Always-permission and a battery cost.
 *
 *   Accessibility disruption Needs a facilities status feed. None exists.
 *
 *   Emergency closure        Needs a safety alert feed. None exists. This one
 *                            is also Priority 1 and non-dismissible, so it
 *                            should not ship until its source is trustworthy.
 *
 *   Happening nearby         `useFeaturedEvents` exists but carries no
 *                            proximity, and the events screen already lists
 *                            them. Low value until events are placed.
 *
 *   Shuttle                  Covered better by the map's own shuttle layer
 *                            and the tracker screen than by a card.
 *
 * The two that are built are the two the map can answer better than anywhere
 * else. Home already says what is up next; the map adds where it is and how
 * long the walk takes. `timeToGo` in particular is the only genuinely new
 * capability in the set — nothing else in the app tells you when to leave.
 */

/** Lower wins. Mirrors the design's priority model, minus the tiers we cannot fill. */
export type CampusContextPriority = 1 | 2 | 3;

export type CampusContextTone = 'brand' | 'amber' | 'slate';

export type CampusContextCard = {
  id: string;
  priority: CampusContextPriority;
  tone: CampusContextTone;
  eyebrow: string;
  title: string;
  detail?: string;
  /** Location and time as two facts — never concatenated, so they cannot wrap as one line. */
  meta: {
    location: string;
    time: string;
  };
  primaryAction: string;
  /** Where the map should fly, and what Directions should target. */
  building?: BuildingSummary;
};

export type CampusContextInput = {
  now: Date;
  buildings: BuildingSummary[];
  coords: { latitude: number; longitude: number } | null;
  campusId: CampusCode;
};

type Provider = (input: CampusContextInput) => CampusContextCard | null;

/** Beyond this the next class is not yet worth a card. */
const UP_NEXT_WINDOW_MINUTES = 90;

/**
 * Slack on top of the walk before "leave now" fires — nobody wants to be told
 * to leave at the exact minute that makes them late.
 */
const LEAVE_BUFFER_MINUTES = 5;

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function formatGap(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** The next class still to start today, ignoring one already running. */
function nextClass(now: Date): ScheduleEvent | undefined {
  const minutes = toMinutes(now);
  return classesOn(getDayKey(now)).find((event) => event.startMinutes > minutes);
}

function walkTo(
  event: ScheduleEvent,
  input: CampusContextInput
): { building?: BuildingSummary; walkMinutes?: number } {
  const building = buildingForRoom(event.room, input.buildings, input.campusId);
  if (!building || !input.coords) return { building };
  return {
    building,
    walkMinutes: walkMinutesFromCoords(
      { lat: input.coords.latitude, lng: input.coords.longitude },
      { lat: building.lat, lng: building.lng }
    ),
  };
}

/**
 * "Leave now" — the only thing here the app could not already tell you.
 *
 * Fires once the walk plus a buffer no longer fits before the class starts,
 * which needs a location fix; without one there is no walk to compare against
 * and this stays silent rather than guessing.
 */
const timeToGo: Provider = (input) => {
  const event = nextClass(input.now);
  if (!event) return null;

  const { building, walkMinutes } = walkTo(event, input);
  if (!building || walkMinutes == null) return null;

  const minutesUntilStart = event.startMinutes - toMinutes(input.now);
  const slack = minutesUntilStart - walkMinutes - LEAVE_BUFFER_MINUTES;
  if (slack > 0) return null;

  return {
    id: `time-to-go-${event.id}`,
    priority: 2,
    tone: slack < 0 ? 'amber' : 'brand',
    eyebrow: 'Time to go',
    title: slack < 0 ? 'Leave now to make it on time' : 'Time to leave',
    detail: `${event.courseCode} starts at ${formatClock(event.startMinutes)}`,
    meta: {
      location: event.room ?? building.code,
      time: `${walkMinutes} min walk`,
    },
    primaryAction: 'Directions',
    building,
  };
};

/**
 * "Up next" — the same class Home announces, but here it carries the map's
 * own answer: where it is and how long the walk takes.
 */
const upNext: Provider = (input) => {
  const event = nextClass(input.now);
  if (!event) return null;

  const minutesUntilStart = event.startMinutes - toMinutes(input.now);
  if (minutesUntilStart > UP_NEXT_WINDOW_MINUTES) return null;

  const { building, walkMinutes } = walkTo(event, input);

  return {
    id: `up-next-${event.id}`,
    priority: 2,
    tone: 'brand',
    eyebrow: 'Up next · calendar',
    title: event.courseCode,
    detail: `Starts in ${formatGap(minutesUntilStart)}`,
    meta: {
      location: event.room ?? building?.code ?? 'Room TBA',
      time: walkMinutes != null ? `${walkMinutes} min walk` : formatClock(event.startMinutes),
    },
    primaryAction: 'Directions',
    building,
  };
};

/** Ordered by escalation: the later a situation is, the earlier it is asked. */
const PROVIDERS: Provider[] = [timeToGo, upNext];

/**
 * The card the map should show, or nothing.
 *
 * First by priority, then by provider order — `timeToGo` is asked before
 * `upNext` so the escalation wins while both describe the same class.
 */
export function resolveCampusContext(input: CampusContextInput): CampusContextCard | null {
  const cards = PROVIDERS.map((provider) => provider(input)).filter(
    (card): card is CampusContextCard => card != null
  );
  if (cards.length === 0) return null;
  return cards.reduce((best, card) => (card.priority < best.priority ? card : best));
}
