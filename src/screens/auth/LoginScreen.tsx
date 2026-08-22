import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/design-system';
import { MaterialSymbol, msSchool, msSecurity } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';

/**
 * Bottom stop of the masthead gradient — matches the Academics and Me hero
 * bands, so this is the same brand gradient the student sees right after
 * signing in rather than a one-off shade.
 */
const HERO_GRADIENT_END = '#5E1626';

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
      <LinearGradient
        colors={[theme.color.primary, HERO_GRADIENT_END]}
        style={[styles.hero, { paddingTop: insets.top + 28 }]}
      >
        <View style={styles.crest}>
          <MaterialSymbol icon={msSchool} size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.wordmark}>CONCORDIA</Text>
        <Text style={styles.wordmarkSub}>University</Text>
      </LinearGradient>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <Text variant="heading2" style={styles.heading}>
          Sign in to continue
        </Text>
        <Text variant="body" color="secondary" style={styles.body}>
          Use your Concordia NetName to see your schedule, grades, and campus
          services in one place.
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

        <View style={styles.trustRow}>
          <MaterialSymbol icon={msSecurity} size={14} color={theme.color.text.subtle} />
          <Text variant="caption" color="subtle" style={styles.trustLabel}>
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
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderCurve: 'continuous',
  },
  crest: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#FFFFFF',
  },
  wordmarkSub: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: semanticSpacing.screenHorizontal + 6,
    paddingTop: 36,
  },
  heading: {
    marginBottom: 10,
  },
  body: {
    lineHeight: 21,
    marginBottom: 32,
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
