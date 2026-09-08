import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { setStatusBarStyle } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { MaterialSymbol, msSecurity } from '@/components/icons';
import { todayShadowMedium } from '@/components/feature/today/todayShadows';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';

/**
 * IDSS self-serve reset. Deliberately opened in the browser rather than the
 * in-app SSO flow: this is a separate system from the sign-in redirect, and
 * resetting a NetName is something a student should watch happen in a real
 * address bar.
 */
const PASSWORD_RESET_URL =
  'https://fcms.concordia.ca/idss/pages/account/passwordreset.aspx';

/** School of Graduate Studies campus loop — muted, behind the sign-in copy. */
const LOGIN_VIDEO = {
  uri: 'https://pegasus.concordia.ca/Flv_Content/sgs/video/CU-SGS-LP.mp4',
} as const;

/**
 * Native player methods throw once `useVideoPlayer` has released the
 * shared object — Fast Refresh and sign-in unmount both hit that window.
 */
function withPlayer(run: () => void) {
  try {
    run();
  } catch {
    // Already released.
  }
}

/**
 * The one door into the app. There is no form to get wrong — this is an SSO
 * redirect, so the only job here is making that redirect feel like it
 * belongs to Concordia before the student ever leaves the app.
 */
export function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  const player = useVideoPlayer(LOGIN_VIDEO, (next) => {
    next.loop = true;
    next.muted = true;
    next.audioMixingMode = 'mixWithOthers';
  });

  /*
    play() in the setup callback races the VideoView attaching. The first
    visit still starts because the network load buys time; coming back to
    login (sign-out) the player is ready before the surface exists and
    never retries. Drive playback from ready / focus / foreground instead.
  */
  const startPlayback = useCallback(() => {
    withPlayer(() => {
      player.muted = true;
      player.loop = true;
      player.play();
    });
  }, [player]);

  useEffect(() => {
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') startPlayback();
    });
    const endSub = player.addListener('playToEnd', () => {
      withPlayer(() => player.replay());
    });
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') startPlayback();
    });

    if (player.status === 'readyToPlay') startPlayback();

    return () => {
      statusSub.remove();
      endSub.remove();
      appSub.remove();
    };
  }, [player, startPlayback]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      startPlayback();
      return () => setStatusBarStyle('auto');
    }, [startPlayback]),
  );

  return (
    <View style={styles.root}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        pointerEvents="none"
        accessible={false}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(0, 0, 0, 0.28)',
          'transparent',
          'rgba(0, 0, 0, 0.52)',
          'rgba(0, 0, 0, 0.86)',
        ]}
        locations={[0, 0.28, 0.58, 1]}
        style={styles.scrim}
      />

      {/*
        Copy and action sit at the foot over the video. The button is the
        only thing to do on this screen, so it belongs in the thumb's reach.
      */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <Text
          variant="heading2"
          color="inverse"
          brandFace={fonts.brandSemiBold}
          style={styles.heading}
        >
          Sign in to continue
        </Text>
        <Text variant="body" color="inverse" style={styles.body}>
          Sign in to see your schedule, grades, and campus services in one
          place.
        </Text>

        <Pressable
          onPress={login}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={isLoading ? 'Signing in' : 'Sign in'}
          style={({ pressed }) => [
            styles.signInButton,
            todayShadowMedium,
            {
              backgroundColor:
                pressed && !isLoading ? theme.color.primaryHover : theme.color.primary,
              opacity: isLoading ? 0.88 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text variant="body" color="inverse" style={styles.signInLabel}>
              Sign in
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(PASSWORD_RESET_URL)}
          accessibilityRole="link"
          accessibilityLabel="Forgot your password? Opens Concordia password reset in your browser"
          hitSlop={8}
          style={({ pressed }) => [styles.forgotRow, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text variant="bodySmall" color="inverse" style={styles.forgotLabel}>
            Forgot your password?
          </Text>
        </Pressable>

        <View style={styles.trustRow}>
          <MaterialSymbol icon={msSecurity} size={14} color="rgba(255, 255, 255, 0.72)" />
          <Text variant="caption" color="inverse" style={styles.trustLabel}>
            Secured by Concordia single sign-on
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  forgotRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  forgotLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  /*
    One block, pushed to the foot. The copy reads as the button's own caption
    rather than a paragraph stranded at the top of an empty page.
  */
  sheet: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: semanticSpacing.screenHorizontal + 6,
    paddingTop: 36,
  },
  heading: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: 40 * -0.01,
  },
  body: {
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 28,
    opacity: 0.86,
  },
  signInButton: {
    height: 56,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  trustLabel: {
    fontSize: 12,
    opacity: 0.72,
  },
});
