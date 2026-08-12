import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { useAuthStore } from '@/state/authStore';
import { meNotificationCount, profileFromAuthUser } from '@/screens/me/accountData';
import { HEADER_BAR_BUTTON_SIZE } from './HeaderIconButton';

const DISC = 30;

type Props = {
  /**
   * Tint for the disc. Defaults to brand; pass white-ish chrome on the
   * burgundy surfaces so the disc does not disappear into the masthead.
   */
  color?: string;
  /** Glyph colour inside the disc. Defaults to the inverse text role. */
  initialsColor?: string;
};

/** First letters of the first two name parts — "Maya R. Okonkwo" → "MR". */
export function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Header action that replaced the per-screen search button when search moved
 * to its own tab. Pushes Me into the current stack rather than switching tabs,
 * so the user keeps their place — every tab stack registers the Me routes for
 * exactly this reason (see `meRoutes`).
 */
export function HeaderProfileButton({ color, initialsColor }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const initials = useMemo(() => initialsFor(profileFromAuthUser(user).displayName), [user]);
  const badge = meNotificationCount;

  return (
    <Pressable
      onPress={() => navigation.navigate('MeHome' as never)}
      accessibilityRole="button"
      accessibilityLabel={
        badge > 0 ? `Profile, ${badge} notifications` : 'Profile'
      }
      hitSlop={4}
      style={({ pressed }) => [styles.hit, { opacity: pressed ? 0.55 : 1 }]}
    >
      <View style={[styles.disc, { backgroundColor: color ?? theme.color.primary }]}>
        <Text
          variant="caption"
          style={{
            fontSize: 12.5,
            lineHeight: 15,
            fontWeight: '700',
            letterSpacing: 0.2,
            color: initialsColor ?? theme.color.text.inverse,
          }}
        >
          {initials}
        </Text>
      </View>

      {badge > 0 ? (
        <View style={[styles.badge, { borderColor: theme.color.background }]}>
          <Text
            variant="caption"
            style={{ fontSize: 10, lineHeight: 12, fontWeight: '700', color: '#FFFFFF' }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    // Sits on the disc's upper-right, not the 44pt hit box's.
    top: (HEADER_BAR_BUTTON_SIZE - DISC) / 2 - 3,
    right: (HEADER_BAR_BUTTON_SIZE - DISC) / 2 - 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5342A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
});
