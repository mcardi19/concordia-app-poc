import React, { useMemo, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { GlassView } from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msNotificationsSemibold,
  msSearchSemibold,
  msSecuritySemibold,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { searchTheme } from '@/screens/search/searchTheme';
import { profileFromAuthUser } from '@/screens/me/accountData';
import { useAuthStore } from '@/state/authStore';
import {
  HEADER_BAR_BUTTON_SIZE,
  HEADER_CHROME_HORIZONTAL_INSET,
  HEADER_ICON_SIZE,
} from './HeaderIconButton';
import { HomeGreetingCompact } from './HomeHeaderTitle';

/** Gap below the safe-area top before the chrome row. */
export const HOME_HEADER_TOP_GAP = 6;
/** Chrome height below the safe-area top — the action capsules set the band. */
export const HOME_HEADER_BAND = HOME_HEADER_TOP_GAP + HEADER_BAR_BUTTON_SIZE;

/** Gap between hits inside the search + notifications pill. */
const ACTION_PAIR_GAP = 6;

/** Unread count shown on the Home notifications action. */
const NOTIFICATION_BADGE_COUNT = 2;

type Props = {
  onEmergency: () => void;
  onSearch: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  dateLabel: string;
  scrollY: Animated.Value;
};

/**
 * Home top chrome, rendered by the screen rather than the navigator (Today
 * sets `headerShown: false`).
 *
 * Order, leading → trailing: Emergency, the compact greeting (fades in on
 * scroll), then Search + Notifications (one shared glass pill) and the
 * profile initials badge.
 */
export function HomeHeaderBar({
  onEmergency,
  onSearch,
  onNotifications,
  onProfile,
  dateLabel,
  scrollY,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const glass = useMemo(() => canUseLiquidGlass(), []);
  const user = useAuthStore((state) => state.user);
  const initials = useMemo(
    () => initialsFromDisplayName(profileFromAuthUser(user).displayName),
    [user],
  );

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + HOME_HEADER_TOP_GAP }]}
    >
      <View style={styles.row}>
        <GlassActionButton
          icon={msSecuritySemibold}
          accessibilityLabel="Emergency and crisis help"
          onPress={onEmergency}
          glass={glass}
          tint={theme.color.primary}
        />

        <HomeGreetingCompact
          inline
          dateLabel={dateLabel}
          color={theme.color.text.primary}
          subtitleColor={theme.color.text.subtler}
          scrollY={scrollY}
        />

        <View style={styles.pairWrap}>
          <GlassActionPair glass={glass}>
            <ActionHit
              icon={msSearchSemibold}
              accessibilityLabel="Search"
              onPress={onSearch}
              tint={theme.color.primary}
            />
            <ActionHit
              icon={msNotificationsSemibold}
              accessibilityLabel={`Notifications, ${NOTIFICATION_BADGE_COUNT} unread`}
              onPress={onNotifications}
              tint={theme.color.primary}
            />
          </GlassActionPair>
          <View
            pointerEvents="none"
            style={[styles.badge, { backgroundColor: theme.color.primary }]}
          >
            <Text
              variant="caption"
              style={[styles.badgeText, { color: theme.color.text.inverse }]}
            >
              {NOTIFICATION_BADGE_COUNT}
            </Text>
          </View>
        </View>

        <ProfileInitialsButton initials={initials} onPress={onProfile} glass={glass} />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  icon: MsIconDefinition;
  accessibilityLabel: string;
  onPress: () => void;
  glass: boolean;
  tint: string;
};

type ActionHitProps = {
  icon: MsIconDefinition;
  accessibilityLabel: string;
  onPress: () => void;
  tint: string;
};

/** First letter of the given name — "MAYA R. OKONKWO" reads as M. */
function initialsFromDisplayName(name: string): string {
  const first = name.trim().split(/\s+/).find(Boolean);
  return (first?.[0] ?? '').toUpperCase();
}

/** Brand-filled initials badge — the Home profile affordance. */
function ProfileInitialsButton({
  initials,
  onPress,
  glass,
}: {
  initials: string;
  onPress: () => void;
  glass: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Profile"
      hitSlop={4}
    >
      <GlassSurface glass={glass} style={styles.capsule}>
        <View
          style={[
            styles.initialsBadge,
            { backgroundColor: theme.color.primary },
          ]}
        >
          <Text
            variant="caption"
            numberOfLines={1}
            style={[styles.initialsText, { color: theme.color.text.inverse }]}
          >
            {initials}
          </Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

/** A single header action: a liquid-glass (or fallback) capsule around the glyph. */
function GlassActionButton({ icon, accessibilityLabel, onPress, glass, tint }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      <GlassSurface glass={glass} style={styles.capsule}>
        <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={tint} />
      </GlassSurface>
    </Pressable>
  );
}

/** Search + Notifications share one pill so they read as a coupled pair. */
function GlassActionPair({
  glass,
  children,
}: {
  glass: boolean;
  children: ReactNode;
}) {
  return (
    <GlassSurface glass={glass} style={styles.pair}>
      <View style={styles.pairRow}>{children}</View>
    </GlassSurface>
  );
}

function ActionHit({ icon, accessibilityLabel, onPress, tint }: ActionHitProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [styles.hit, { opacity: pressed ? 0.55 : 1 }]}
    >
      <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={tint} />
    </Pressable>
  );
}

function GlassSurface({
  glass,
  style,
  children,
}: {
  glass: boolean;
  style: object;
  children: ReactNode;
}) {
  if (!glass) {
    return <View style={[style, styles.fallbackSurface]}>{children}</View>;
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme="light"
      style={style}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 12,
    paddingHorizontal: HEADER_CHROME_HORIZONTAL_INSET,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  /** Circular action capsule, sized to the standard bar-button hit area. */
  capsule: {
    alignItems: 'center',
    justifyContent: 'center',
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Lets the badge sit on the pill corner without being clipped by the glass. */
  pairWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  pair: {
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACTION_PAIR_GAP,
  },
  hit: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    zIndex: 1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 11,
    fontWeight: '700',
  },
  /** Only applied when liquid glass is unavailable (Android, older iOS). */
  fallbackSurface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: searchTheme.cardBorder,
    backgroundColor: searchTheme.cardBackground,
  },
  initialsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: HEADER_BAR_BUTTON_SIZE - 8,
    height: HEADER_BAR_BUTTON_SIZE - 8,
    borderRadius: (HEADER_BAR_BUTTON_SIZE - 8) / 2,
    borderCurve: 'continuous',
  },
  initialsText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    includeFontPadding: false,
    // Uppercase glyphs sit high on the em box; this drops them to optical centre.
    transform: [{ translateY: 1.5 }],
  },
});
