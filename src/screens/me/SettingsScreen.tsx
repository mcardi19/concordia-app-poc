import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { MeSettingsGroup, type MeSettingsRow } from '@/components/feature/me';
import {
  MaterialSymbol,
  msChevronRight,
  msHelp,
  msInfo,
  msLanguage,
  msLock,
  msLogout,
  msNotifications,
  msSecurity,
  msWbSunny,
} from '@/components/icons';
import { useAppearance, useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/state/authStore';
import { profileFromAuthUser } from './accountData';
import { useMeTheme } from './meTheme';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Settings'>;

const APP_VERSION = 'v2.4.0';

/** Preference labels, so the Appearance row shows the live choice. */
const APPEARANCE_LABEL = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const;

/**
 * S6 · Settings — the account header plus every cross-cutting preference,
 * grouped.
 *
 * Rows whose destination screen is not built yet are rendered but inert: the
 * design's shape is the point, and a row that silently does nothing is more
 * honest than one that navigates somewhere unrelated. `Appearance` and the
 * account header are wired; sign-out is real.
 */
export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const me = useMeTheme();
  const { logout, isLoading } = useAuth();
  const { preference } = useAppearance();
  const user = useAuthStore((s) => s.user);
  const profile = useMemo(() => profileFromAuthUser(user), [user]);

  /* Local-only until there is a real biometric-preference store. */
  const [biometrics, setBiometrics] = useState(true);

  /* Transparent bar, so the curtain is what keeps content legible under it. */
  const headerHeight = useHeaderHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const curtainOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [...CURTAIN_FADE_IN, 9999],
        outputRange: [0, 1, 1],
        extrapolate: 'clamp',
      }),
    [scrollY],
  );

  const initials = useMemo(
    () =>
      profile.displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    [profile.displayName],
  );

  const preferenceRows: MeSettingsRow[] = [
    { id: 'notifications', label: 'Notifications', icon: msNotifications, value: 'On' },
    { id: 'language', label: 'Language', icon: msLanguage, value: 'English' },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: msWbSunny,
      value: APPEARANCE_LABEL[preference],
      onPress: () => navigation.navigate('Appearance'),
    },
    {
      id: 'biometrics',
      label: 'Face ID & passcode',
      icon: msLock,
      toggle: biometrics,
      onToggle: setBiometrics,
    },
  ];

  const accountRows: MeSettingsRow[] = [
    { id: 'privacy', label: 'Privacy & data', icon: msSecurity },
    { id: 'help', label: 'Help & support', icon: msHelp },
    { id: 'about', label: 'About', icon: msInfo, value: APP_VERSION },
  ];

  const signOutRows: MeSettingsRow[] = [
    {
      id: 'sign-out',
      label: isLoading ? 'Signing out…' : 'Sign out',
      icon: msLogout,
      danger: true,
      onPress: isLoading ? undefined : () => logout(),
    },
  ];

  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: me.pageBackground }]}>
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 8 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Account header — the one row that is a person, not a preference. */}
        <Pressable
          onPress={openProfile}
          accessibilityRole="button"
          accessibilityLabel={`${profile.displayName}. Edit profile`}
          style={({ pressed }) => [styles.account, pressed ? { opacity: 0.6 } : null]}
        >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: theme.color.primary,
              shadowColor: theme.color.primary,
            },
          ]}
        >
          <Text variant="heading3" style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <View style={styles.accountText}>
          <Text variant="body" numberOfLines={1} style={[styles.accountName, { color: me.headingText }]}>
            {profile.displayName}
          </Text>
          {/*
            The design reads "Netname m_okonkwo · ID 40219104", but the
            student record has no netname field — showing the program instead
            of inventing one keeps both facts real.
          */}
          <Text variant="bodySmall" numberOfLines={1} style={[styles.accountMeta, { color: me.metaText }]}>
            {profile.program} · ID {profile.studentId}
          </Text>
        </View>

          <MaterialSymbol icon={msChevronRight} size={20} color={me.chevron} />
        </Pressable>

        <MeSettingsGroup label="Preferences" rows={preferenceRows} />
        <MeSettingsGroup label="Account & data" rows={accountRows} />
        <MeSettingsGroup rows={signOutRows} />

        <Text variant="caption" style={[styles.footer, { color: me.metaText }]}>
          Concordia University · Montréal{'\n'}Made with care for students
        </Text>
      </Animated.ScrollView>

      {/* Above the list, below the bar — drawn only once content scrolls up. */}
      <ScrollCurtain
        color={me.pageBackground}
        height={headerHeight + CURTAIN_FADE_DEPTH}
        blurHeight={headerHeight + CURTAIN_BLUR_DEPTH}
        blurred
        opacity={curtainOpacity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  /* The rows carry their own screen margin, so the page must not add one. */
  content: {
    paddingBottom: 40,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  accountText: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  accountMeta: {
    fontSize: 14,
    marginTop: 3,
  },
  footer: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 28,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
});
