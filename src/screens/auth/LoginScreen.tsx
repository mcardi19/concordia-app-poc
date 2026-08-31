import React from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/design-system';
import { MaterialSymbol, msSchool, msSecurity } from '@/components/icons';
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

/**
 * The one door into the app. There is no form to get wrong — this is an SSO
 * redirect, so the only job here is making that redirect feel like it
 * belongs to Concordia before the student ever leaves the app.
 */
export function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: theme.color.background }]}>
      <View style={[styles.hero, { paddingTop: insets.top + 28 }]}>
        <View style={[styles.crest, { backgroundColor: `${theme.color.primary}12` }]}>
          <MaterialSymbol icon={msSchool} size={30} color={theme.color.primary} />
        </View>
        <Text style={[styles.wordmark, { color: theme.color.primary }]}>CONCORDIA</Text>
        <Text style={[styles.wordmarkSub, { color: theme.color.text.secondary }]}>
          University
        </Text>
      </View>

      {/*
        Copy at the top, action at the bottom: the button is the only thing to
        do on this screen, so it belongs in the thumb's reach rather than
        halfway up under the text.
      */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View>
          <Text variant="heading2" style={styles.heading}>
            Sign in to continue
          </Text>
          <Text variant="body" color="secondary" style={styles.body}>
            Sign in to see your schedule, grades, and campus services in one
            place.
          </Text>

          <Button
            onPress={login}
            disabled={isLoading}
            accessibilityLabel={isLoading ? 'Signing in' : 'Sign in with Concordia'}
            style={styles.signInButton}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.color.text.inverse} />
            ) : (
              <Text
                variant="body"
                style={[styles.signInLabel, { color: theme.color.text.inverse }]}
              >
                Sign in with Concordia
              </Text>
            )}
          </Button>

          <Pressable
            onPress={() => Linking.openURL(PASSWORD_RESET_URL)}
            accessibilityRole="link"
            accessibilityLabel="Forgot your password? Opens Concordia password reset in your browser"
            hitSlop={8}
            style={({ pressed }) => [styles.forgotRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text variant="bodySmall" color="brand" style={styles.forgotLabel}>
              Forgot your password?
            </Text>
          </Pressable>

          <View style={styles.trustRow}>
            <MaterialSymbol icon={msSecurity} size={14} color={theme.color.text.subtle} />
            <Text variant="caption" color="subtle" style={styles.trustLabel}>
              Secured by Concordia single sign-on
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  crest: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
  },
  wordmarkSub: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
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
  },
  body: {
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 28,
  },
  signInButton: {
    height: 56,
  },
  signInLabel: {
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
  },
});
