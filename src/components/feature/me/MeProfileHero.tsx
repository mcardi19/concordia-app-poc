import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msChevronLeft,
  msNotifications,
  msSettings,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import {
  HEADER_BAR_BUTTON_SIZE,
  HEADER_CHROME_HORIZONTAL_INSET,
  HEADER_CHROME_TOP_GAP,
  HEADER_ICON_SIZE,
} from '@/navigation/HeaderIconButton';
import { meTheme } from '@/screens/me/meTheme';
import type { MeProfileStat, StudentProfile } from '@/types/profile';

type Props = {
  profile: StudentProfile;
  stats: MeProfileStat[];
  onEditPress?: () => void;
  /**
   * How far the ID card rides up over the masthead edge. The hero reserves it
   * below the stats so the card never covers them; the screen measures the
   * card and passes half its height, putting the edge at the card's midpoint.
   */
  idCardOverlap?: number;
  /**
   * Scroll offset from Me home. Negative values (top rubber-band) pin the
   * identity content while the page travels under it.
   */
  scrollY: SharedValue<number>;
};

type HeaderChromeProps = {
  /** Unread count on the bell. Hidden at 0. */
  notificationCount?: number;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  /**
   * Me is pushed into whichever tab stack opened it and renders with
   * `headerShown: false`, so this chrome carries the only visible way back —
   * without it the edge-swipe is the sole exit.
   */
  onBackPress?: () => void;
};

type ChromeAction = {
  icon: Parameters<typeof MaterialSymbol>[0]['icon'];
  label: string;
  badge?: number;
  onPress?: () => void;
};

/** Same metrics as the Home tab bar-button chrome. */
const CHROME_SIZE = HEADER_BAR_BUTTON_SIZE;
const AVATAR_SIZE = 76;
/** Page content inset — matches Home `screenHorizontal` and header chrome. */
const CONTENT_INSET = HEADER_CHROME_HORIZONTAL_INSET;
/** Gap between hits inside the notifications + settings pill. */
const CHROME_PAIR_GAP = 6;

/**
 * App is forced light UI, so liquid glass `auto` resolves light — near-white on
 * burgundy and unreadable with white glyphs. Always pin dark glass here.
 */
const CHROME_GLASS_SCHEME = 'dark' as const;

/**
 * The chrome is a fixed overlay, so it outlives the burgundy masthead: once
 * the page scrolls, clear glass sampled the light grey body and the white
 * glyphs vanished into it. A dark tint keeps the pills readable over both.
 */
const CHROME_GLASS_TINT = 'rgba(63, 15, 26, 0.72)';

/**
 * Share of the top rubber-band pull the masthead edge travels. The pull is
 * already damped by iOS, so this is a second, gentler damping on top: the
 * header grows about half as fast as the page moves, which is what opens the
 * gap under the ID card. Raise for a more pronounced stretch.
 */
export const HERO_STRETCH_RATIO = 0.45;

/** Wash paints 1pt past the edge so no seam shows against the grey body. */
const HERO_EDGE_BLEED = 1;

/** Masthead fill runs this far above the hero to cover the top bounce gap. */
const WASH_TOP_EXTENSION = 400;

/**
 * Starting overlap, used until the ID card reports its real height on first
 * layout. Close to half the rendered card so the correction is invisible.
 */
export const ID_CARD_OVERLAP = 49;

/** Gap between the stats row and the top of the overlapping ID card. */
const ID_CARD_CLEARANCE = 18;

/** Screen-space distance the masthead edge has grown, given a scroll offset. */
export function heroStretch(scrollY: number): number {
  'worklet';
  return Math.max(0, -scrollY) * HERO_STRETCH_RATIO;
}

function ChromeHit({ icon, label, badge, onPress }: ChromeAction) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.chromeHit, { opacity: pressed ? 0.6 : 1 }]}
    >
      <MaterialSymbol
        icon={icon}
        size={HEADER_ICON_SIZE}
        color={theme.color.text.inverse}
      />
      {badge != null && badge > 0 ? (
        <View style={[styles.badge, { borderColor: theme.color.primary }]}>
          <Text
            variant="caption"
            style={{
              fontSize: 10,
              lineHeight: 11,
              fontWeight: '700',
              color: theme.color.primary,
            }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Dark glass wrapper for a single chrome control, with the flat fallback. */
function ChromeGlass({
  style,
  children,
}: {
  style: object;
  children: React.ReactNode;
}) {
  const glass = React.useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return <View style={[style, styles.chromeFallback]}>{children}</View>;
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme={CHROME_GLASS_SCHEME}
      tintColor={CHROME_GLASS_TINT}
      style={style}
    >
      {children}
    </GlassView>
  );
}

/**
 * Notifications + settings as one dark glass pill. Avoid GlassContainer merge —
 * merged shapes drop `colorScheme` and render light (white) on the burgundy hero.
 */
function ChromePair({
  left,
  right,
}: {
  left: ChromeAction;
  right: ChromeAction;
}) {
  const glass = React.useMemo(() => canUseLiquidGlass(), []);
  const content = (
    <View style={styles.chromePairRow}>
      <ChromeHit {...left} />
      <ChromeHit {...right} />
    </View>
  );

  if (!glass) {
    return <View style={[styles.chromePair, styles.chromeFallback]}>{content}</View>;
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme={CHROME_GLASS_SCHEME}
      tintColor={CHROME_GLASS_TINT}
      style={styles.chromePair}
    >
      {content}
    </GlassView>
  );
}

/**
 * Same reasoning as the chrome: forced light UI resolves `auto` glass to
 * near-white on the burgundy, which would swallow the white initials. Dark
 * scheme with a light tint keeps the disc reading a touch brighter than the
 * masthead, the way the flat 16% fill did.
 */
const AVATAR_GLASS_TINT = 'rgba(255, 255, 255, 0.18)';

/** Initials fallback — the design's avatar is a photo placeholder. */
function Avatar({ name }: { name: string }) {
  const theme = useTheme();
  const glass = React.useMemo(() => canUseLiquidGlass(), []);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const content = (
    <Text
      variant="heading2"
      style={{ fontSize: 30, lineHeight: 34, color: theme.color.text.inverse }}
    >
      {initials}
    </Text>
  );

  if (!glass) {
    return <View style={[styles.avatar, styles.avatarFallback]}>{content}</View>;
  }

  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme={CHROME_GLASS_SCHEME}
      tintColor={AVATAR_GLASS_TINT}
      style={styles.avatar}
    >
      {content}
    </GlassView>
  );
}

/**
 * Notifications + settings. Rendered as a fixed overlay on Me home so
 * the actions stay pinned while the masthead scrolls underneath.
 */
export function MeHeaderChrome({
  notificationCount = 0,
  onNotificationsPress,
  onSettingsPress,
  onBackPress,
}: HeaderChromeProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.chromeOverlay,
        {
          top: insets.top + HEADER_CHROME_TOP_GAP,
          paddingHorizontal: HEADER_CHROME_HORIZONTAL_INSET,
        },
      ]}
    >
      {onBackPress ? (
        <ChromeGlass style={styles.chromeRound}>
          <ChromeHit icon={msChevronLeft} label="Back" onPress={onBackPress} />
        </ChromeGlass>
      ) : null}

      {/* Pushes the trailing pair right when there is no back control. */}
      <View style={styles.chromeSpring} />

      {/* Notifications + settings share one dark pill. */}
      <ChromePair
        left={{
          icon: msNotifications,
          label: 'Notifications',
          badge: notificationCount,
          onPress: onNotificationsPress,
        }}
        right={{
          icon: msSettings,
          label: 'Settings',
          onPress: onSettingsPress,
        }}
      />

    </View>
  );
}

/**
 * Burgundy gradient masthead: avatar, identity, and the academic metadata
 * strip. On top rubber-band the wash grows (content stays pinned) so the ID
 * card and grey body move down with the expanded header edge. Chrome actions
 * live in `MeHeaderChrome` (fixed overlay).
 */
export function MeProfileHero({
  profile,
  stats,
  onEditPress,
  scrollY,
  idCardOverlap = ID_CARD_OVERLAP,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  /**
   * Counter the rubber-band translate so avatar / name / stats stay fixed on
   * screen; the growing empty region below them is the stretched container.
   */
  const contentStyle = useAnimatedStyle(() => {
    const pull = Math.max(0, -scrollY.value);
    return { transform: [{ translateY: -pull }] };
  });

  return (
    <View
      style={[
        styles.hero,
        {
          paddingTop: insets.top + HEADER_CHROME_TOP_GAP,
          // Reserve the strip the card overlaps, so it never covers the stats.
          paddingBottom: idCardOverlap + ID_CARD_CLEARANCE,
        },
      ]}
    >
      {/*
        Flat brand masthead. Deliberately static: the visible lower edge is the
        grey body's top, which the screen drives with a transform, so nothing
        here has to animate — and animating `top`/`bottom` here re-ran layout
        every frame, which is what made the header jitter under the finger.
        The upward extension covers the top rubber-band gap at any pull.
      */}
      <View
        pointerEvents="none"
        style={[styles.wash, { backgroundColor: theme.color.primary }]}
      />

      <Animated.View style={contentStyle}>
        {/* Reserves the fixed chrome row so identity layout matches the overlay. */}
        <View style={styles.chromeSpacer} />

        <View style={[styles.identity, { paddingHorizontal: CONTENT_INSET }]}>
          <Avatar name={profile.displayName} />

          <View style={styles.nameRow}>
            <Text
              variant="heading2"
              style={{
                fontSize: 27,
                lineHeight: 30,
                color: theme.color.text.inverse,
              }}
            >
              {toTitleCase(profile.displayName)}
            </Text>
            <Pressable
              onPress={onEditPress}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={8}
            >
              <Text
                variant="bodySmall"
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.color.text.inverse,
                }}
              >
                Edit
              </Text>
            </Pressable>
          </View>

          <Text
            variant="bodySmall"
            style={{ fontSize: 14, color: meTheme.heroSubtitle, marginTop: 3 }}
          >
            {profile.program} · {profile.yearLabel}
          </Text>
        </View>

        <View style={[styles.statsRow, { paddingHorizontal: CONTENT_INSET }]}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.id}>
              {index > 0 ? <View style={styles.statDivider} /> : null}
              <View style={[styles.stat, { paddingLeft: index === 0 ? 0 : 14 }]}>
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 0.2,
                    color: meTheme.heroStatLabel,
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </Text>
                <Text
                  variant="heading3"
                  numberOfLines={1}
                  style={{
                    fontSize: 20,
                    lineHeight: 21,
                    fontWeight: '600',
                    letterSpacing: -0.6,
                    color: theme.color.text.inverse,
                  }}
                >
                  {stat.value}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

/** Profile records store the name upper-cased; the hero shows it cased. */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, lead: string, char: string) => lead + char.toUpperCase());
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'visible',
  },
  wash: {
    position: 'absolute',
    left: 0,
    right: 0,
    /** Beyond any rubber-band pull, so the bounce never exposes the page. */
    top: -WASH_TOP_EXTENSION,
    bottom: -HERO_EDGE_BLEED,
  },
  chromeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chromeSpacer: {
    height: CHROME_SIZE,
  },
  chromePair: {
    height: CHROME_SIZE,
    borderRadius: CHROME_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  chromeRound: {
    width: CHROME_SIZE,
    height: CHROME_SIZE,
    borderRadius: CHROME_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  chromeSpring: {
    flex: 1,
  },
  chromePairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CHROME_PAIR_GAP,
  },
  /** Only applied when liquid glass is unavailable. */
  chromeFallback: {
    backgroundColor: meTheme.heroChrome,
  },
  chromeHit: {
    width: CHROME_SIZE,
    height: CHROME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  identity: {
    alignItems: 'flex-start',
    marginTop: 18,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: meTheme.heroAvatarBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  avatarFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: meTheme.heroDivider,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: meTheme.heroDivider,
  },
  stat: {
    flex: 1,
  },
});
