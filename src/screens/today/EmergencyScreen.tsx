import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { MeGlassCard, MeSectionLabel } from '@/components/feature/me';
import { MaterialSymbol, msCall, msChevronRight, msNorthEast } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { useMeTheme } from '@/screens/me/meTheme';
import {
  CONCORDIA_EMERGENCY_URL,
  CRISIS_HELPLINES,
  EMERGENCY_CALLS,
  EMERGENCY_RESOURCES,
  type EmergencyCall,
  type Helpline,
} from './emergencyData';

/** Apple Maps search rather than a hardcoded directory URL we cannot verify. */
const ER_MAP_URL = Platform.select({
  ios: 'maps://?q=emergency%20room',
  default: 'https://maps.apple.com/?q=emergency%20room',
});

/**
 * Emergency & crisis.
 *
 * Reached from the shield action in the Home header. Ordered by how fast it
 * has to work: the two numbers you dial without reading anything, then the
 * 24/7 lines, then the things you look up. Nothing here is behind a tap that
 * could be mistaken for something else — every row's action is a call or a
 * page, and it says which.
 */
export function EmergencyScreen() {
  const theme = useTheme();
  const meTheme = useMeTheme();
  const bottomPadding = useTabBarContentPadding();
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

  const open = useCallback((url: string) => {
    void Linking.openURL(url);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: meTheme.pageBackground }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + 8, paddingBottom: bottomPadding + 24 },
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentInsetAdjustmentBehavior="never"
      >
        {/*
          The design's masthead headline is the navigation title here, so only
          its eyebrow and brand rule remain — repeating "Emergency & crisis"
          under a header that already says it wastes the first screenful.
        */}
        <View style={styles.masthead}>
          <Text variant="caption" color="brand" style={styles.eyebrow}>
            If you need help right now
          </Text>
          <View style={[styles.rule, { backgroundColor: theme.color.primary }]} />
        </View>

        <View style={styles.callStack}>
          {EMERGENCY_CALLS.map((call) => (
            <CallAction key={call.telHref} call={call} onPress={() => open(call.telHref)} />
          ))}
        </View>

        <Section label="24/7 crisis help-lines">
          <MeGlassCard style={styles.card}>
            {CRISIS_HELPLINES.map((line, index) => (
              <HelplineRow
                key={line.telHref}
                line={line}
                last={index === CRISIS_HELPLINES.length - 1}
                onPress={() => open(line.telHref)}
              />
            ))}
          </MeGlassCard>
        </Section>

        <Section label="Hospital emergency rooms">
          <MeGlassCard style={styles.card} contentStyle={styles.erCard}>
            <Text variant="body" style={[styles.rowTitle, { color: meTheme.headingText }]}>
              Find ERs & wait times in Montreal
            </Text>
            <Text variant="bodySmall" style={[styles.rowDetail, { color: meTheme.metaText }]}>
              Including psychiatric emergency departments. Unsure if you need the ER? Call{' '}
              <Text variant="bodySmall" color="brand" style={styles.inlineStrong}>
                8-1-1
              </Text>{' '}
              or read Health Services&rsquo; guide.
            </Text>
            <View style={styles.linkRow}>
              <LinkButton label="Open ER map" onPress={() => open(ER_MAP_URL)} />
              <LinkButton
                label="Read guide"
                onPress={() => open(CONCORDIA_EMERGENCY_URL)}
              />
            </View>
          </MeGlassCard>
        </Section>

        <Section label="More resources">
          <MeGlassCard style={styles.card}>
            {EMERGENCY_RESOURCES.map((resource, index) => (
              <Pressable
                key={resource.label}
                onPress={() => open(resource.url)}
                accessibilityRole="link"
                accessibilityLabel={`${resource.label}. ${resource.detail}`}
                style={({ pressed }) => [
                  styles.resourceRow,
                  index < EMERGENCY_RESOURCES.length - 1
                    ? [styles.divider, { borderBottomColor: theme.color.borderSubtle }]
                    : null,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={styles.rowText}>
                  <Text variant="body" style={[styles.rowTitle, { color: meTheme.headingText }]}>
                    {resource.label}
                  </Text>
                  <Text variant="bodySmall" style={[styles.rowDetail, { color: meTheme.metaText }]}>
                    {resource.detail}
                  </Text>
                </View>
                <MaterialSymbol icon={msChevronRight} size={20} color={meTheme.chevron} />
              </Pressable>
            ))}
          </MeGlassCard>
        </Section>

        <Text variant="caption" style={[styles.footer, { color: meTheme.metaText }]}>
          Concordia is located on the unceded Indigenous lands of the Kanien&rsquo;kehá:ka
          Nation. If you&rsquo;re in immediate danger, call 911 first.
        </Text>
      </Animated.ScrollView>

      <ScrollCurtain
        color={meTheme.pageBackground}
        height={headerHeight + CURTAIN_FADE_DEPTH}
        blurHeight={headerHeight + CURTAIN_BLUR_DEPTH}
        blurred
        opacity={curtainOpacity}
      />
    </View>
  );
}

/** One of the two numbers you dial without reading the rest of the page. */
function CallAction({ call, onPress }: { call: EmergencyCall; onPress: () => void }) {
  const theme = useTheme();
  const meTheme = useMeTheme();
  const primary = call.primary === true;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Call ${call.name}, ${call.scope}, ${call.phone}`}
      style={({ pressed }) => [
        styles.call,
        primary
          ? [
              styles.callPrimary,
              { backgroundColor: theme.color.primary, shadowColor: theme.color.primary },
            ]
          : [
              styles.callSecondary,
              { backgroundColor: meTheme.cardBackground, borderColor: `${theme.color.primary}30` },
            ],
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.callIcon,
          {
            backgroundColor: primary ? 'rgba(255,255,255,0.15)' : `${theme.color.primary}10`,
          },
        ]}
      >
        <MaterialSymbol
          icon={msCall}
          size={18}
          color={primary ? theme.color.text.inverse : theme.color.primary}
        />
      </View>

      <View style={styles.rowText}>
        <Text
          variant="caption"
          style={[
            styles.callScope,
            { color: primary ? 'rgba(255,255,255,0.75)' : meTheme.metaText },
          ]}
        >
          {call.scope}
        </Text>
        <Text
          variant="body"
          style={[
            styles.callName,
            { color: primary ? theme.color.text.inverse : meTheme.headingText },
          ]}
        >
          {call.name}
        </Text>
        <Text
          variant="body"
          style={[
            styles.callPhone,
            { color: primary ? theme.color.text.inverse : theme.color.primary },
          ]}
        >
          {call.phone}
        </Text>
      </View>

      <MaterialSymbol
        icon={msChevronRight}
        size={20}
        color={primary ? 'rgba(255,255,255,0.7)' : meTheme.chevron}
      />
    </Pressable>
  );
}

/** A 24/7 line: what it is, who it is for, and the number as the tap target. */
function HelplineRow({
  line,
  last,
  onPress,
}: {
  line: Helpline;
  last: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const meTheme = useMeTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Call ${line.name}, ${line.phone}`}
      style={({ pressed }) => [
        styles.helpline,
        !last ? [styles.divider, { borderBottomColor: theme.color.borderSubtle }] : null,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text variant="body" style={[styles.rowTitle, { color: meTheme.headingText }]}>
        {line.name}
      </Text>
      <Text variant="bodySmall" style={[styles.rowDetail, { color: meTheme.metaText }]}>
        {line.detail}
      </Text>
      <View style={styles.helplineMeta}>
        <View style={[styles.phoneChip, { backgroundColor: `${theme.color.primary}10` }]}>
          <MaterialSymbol icon={msCall} size={12} color={theme.color.primary} />
          <Text variant="bodySmall" style={[styles.phoneChipLabel, { color: theme.color.primary }]}>
            {line.phone}
          </Text>
        </View>
        {line.alt ? (
          <Text variant="caption" style={[styles.altLabel, { color: meTheme.metaText }]}>
            {line.alt}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const meTheme = useMeTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.linkButton,
        { backgroundColor: meTheme.stackFill, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text variant="bodySmall" style={[styles.linkLabel, { color: meTheme.headingText }]}>
        {label}
      </Text>
      <MaterialSymbol icon={msNorthEast} size={14} color={meTheme.headingText} />
    </Pressable>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MeSectionLabel>{label}</MeSectionLabel>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {},
  masthead: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rule: {
    height: 1.5,
    marginTop: 10,
  },
  callStack: {
    gap: 10,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 18,
  },
  call: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  /** Lifted on a brand shadow — the one thing to reach for first. */
  callPrimary: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
    }),
  },
  callSecondary: {
    borderWidth: 1,
  },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callScope: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  callName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: 3,
  },
  callPhone: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginTop: 4,
  },
  section: {
    paddingTop: 16,
    marginTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  card: {
    marginHorizontal: semanticSpacing.screenHorizontal,
  },
  erCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  helpline: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helplineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
    borderCurve: 'continuous',
  },
  phoneChipLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  altLabel: {
    fontSize: 12,
    lineHeight: 15,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  rowDetail: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  inlineStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 7,
    borderCurve: 'continuous',
  },
  linkLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 28,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
  },
});
