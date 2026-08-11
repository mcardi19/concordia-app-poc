import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msNotifications,
  msSearch,
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
  /** Unread count on the bell. Hidden at 0. */
  notificationCount?: number;
  onEditPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  onSearchPress?: () => void;
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
 * Tall enough to cover rubber-band overscroll above the hero. The masthead
 * LinearGradient itself extends by this amount so the wash continues with no seam.
 */
const OVERSCROLL_STRETCH = 400;
/** Used until onLayout reports the real masthead height. */
const ESTIMATED_HERO_BODY = 320;

/**
 * App is forced light UI, so liquid glass `auto` resolves light — near-white on
 * burgundy and unreadable with white glyphs. Always pin dark glass here.
 */
const CHROME_GLASS_SCHEME = 'dark' as const;

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
              fontSize: 9,
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

/** Circular glass control. Falls back to a translucent fill off iOS 26. */
function ChromeButton(props: ChromeAction) {
  const glass = React.useMemo(() => canUseLiquidGlass(), []);
  const content = <ChromeHit {...props} />;

  if (!glass) {
    return <View style={[styles.chrome, styles.chromeFallback]}>{content}</View>;
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme={CHROME_GLASS_SCHEME}
      style={styles.chrome}
    >
      {content}
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
      style={styles.chromePair}
    >
      {content}
    </GlassView>
  );
}

/** Initials fallback — the design's avatar is a photo placeholder. */
function Avatar({ name }: { name: string }) {
  const theme = useTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.avatar}>
      <Text
        variant="heading2"
        style={{ fontSize: 28, lineHeight: 32, color: theme.color.text.inverse }}
      >
        {initials}
      </Text>
    </View>
  );
}

/**
 * Burgundy gradient masthead: chrome row, avatar, identity, and the academic
 * metadata strip. The ID card overlaps its lower edge by design.
 */
export function MeProfileHero({
  profile,
  stats,
  notificationCount = 0,
  onEditPress,
  onNotificationsPress,
  onSettingsPress,
  onSearchPress,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [heroHeight, setHeroHeight] = React.useState(0);

  /**
   * Hold the top stop through the overscroll extension so the visible masthead
   * keeps the same primary → end wash as before the stretch was added.
   */
  const primaryHold =
    OVERSCROLL_STRETCH /
    (heroHeight > 0 ? heroHeight : OVERSCROLL_STRETCH + ESTIMATED_HERO_BODY);

  return (
    <LinearGradient
      colors={[theme.color.primary, theme.color.primary, meTheme.heroGradientEnd]}
      locations={[0, primaryHold, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.height;
        if (next > 0 && next !== heroHeight) {
          setHeroHeight(next);
        }
      }}
      style={[
        styles.hero,
        {
          marginTop: -OVERSCROLL_STRETCH,
          paddingTop: OVERSCROLL_STRETCH + insets.top + HEADER_CHROME_TOP_GAP,
        },
      ]}
    >
      {/*
        Approximates the design's radial top-left highlight. A true radial needs
        an SVG gradient; at 10% alpha the diagonal read is indistinguishable.
        Offset past the overscroll extension so the visible masthead is unchanged.
      */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 0.75 }}
        style={[StyleSheet.absoluteFillObject, { top: OVERSCROLL_STRETCH }]}
      />

      <View
        style={[
          styles.chromeRow,
          { paddingHorizontal: HEADER_CHROME_HORIZONTAL_INSET },
        ]}
      >
        {/* Notifications + settings share one dark pill; search stays its own. */}
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

        <ChromeButton icon={msSearch} label="Search" onPress={onSearchPress} />
      </View>

      <View style={[styles.identity, { paddingHorizontal: CONTENT_INSET }]}>
        <Avatar name={profile.displayName} />

        <View style={styles.nameRow}>
          <Text
            variant="heading2"
            style={{
              fontSize: 26,
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
                fontSize: 12.5,
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
          style={{ fontSize: 12.5, color: meTheme.heroSubtitle, marginTop: 3 }}
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
                  fontSize: 10.5,
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
    </LinearGradient>
  );
}

/** Profile records store the name upper-cased; the hero shows it cased. */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, lead: string, char: string) => lead + char.toUpperCase());
}

const styles = StyleSheet.create({
  /**
   * Overscroll extension is applied via negative marginTop + matching paddingTop
   * so the same LinearGradient paints continuously into the rubber-band region.
   */
  hero: {
    paddingBottom: 52,
  },
  chromeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  chrome: {
    width: CHROME_SIZE,
    height: CHROME_SIZE,
    borderRadius: CHROME_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  chromePair: {
    height: CHROME_SIZE,
    borderRadius: CHROME_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.5,
    borderColor: meTheme.heroAvatarBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
