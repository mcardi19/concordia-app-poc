import React from 'react';
import {
  Image,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {
  GlassActionButton,
  ProgressiveImageTreatment,
  Text,
  type ProgressiveImageTreatmentProps,
} from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { todayTheme } from '@/screens/today/todayTheme';
import type { TodaySession } from './todayData';
import { SessionStatusBadge } from './SessionStatusBadge';
import {
  SESSION_CARD_SHARED_TAG,
  sessionCardSharedTransition,
} from './sessionSharedTransition';

export const SESSION_HERO_MIN_HEIGHT = 440;
export const SESSION_HERO_CONTENT_PAD = 20;
/** Natural height of the in-session pill (padding + label line). */
export const SESSION_STATUS_BADGE_HEIGHT = 34;
/** CTA button height in the meta row. */
export const SESSION_ACTIONS_ROW_HEIGHT = 44;
/** @deprecated Actions sit in the meta row; kept for export stability. */
export const SESSION_ACTIONS_GAP = 0;
/** @deprecated No separate actions block under the meta row. */
export const SESSION_ACTIONS_BLOCK = 0;

type Props = {
  session: TodaySession;
  /** When false, hides the in-session badge. */
  showStatusBadge?: boolean;
  /** When false, hides View details. */
  showActions?: boolean;
  /** Show professor field (used during expand to crossfade with CTA). */
  showProfessor?: boolean;
  /** When false, View details is visual-only (expand overlay). */
  actionsInteractive?: boolean;
  /** Reanimated style for the card CTA during expand. */
  cardActionsStyle?: StyleProp<ViewStyle>;
  /** Reanimated style for the professor meta field during expand. */
  profStyle?: StyleProp<ViewStyle>;
  /**
   * Extra inset for overlay content (not the image). Used when the hero sheet
   * bleeds past the screen so title/meta stay in the visible frame.
   */
  contentInset?: number;
  /** 0–1 progress that eases contentInset in (keeps card handoff aligned). */
  contentInsetProgress?: SharedValue<number>;
  /**
   * Progress at which sheet radius bleed begins. Bleed inset stays 0 until then
   * so content does not pull inward before the flush rect fills the screen.
   */
  contentInsetBleedStart?: number;
  /**
   * Detail chrome top (safe-area aligned). When set with contentInsetProgress,
   * the status badge morphs from card padding into this row beside the close control.
   */
  chromeTop?: number;
  /** Detail chrome horizontal inset (matches close button). */
  chromeHorizontal?: number;
  /** Enable Reanimated shared-element morph for the hero image. */
  sharedTransition?: boolean;
  onViewDetails?: () => void;
  onViewDetailsPressIn?: () => void;
  onViewDetailsPressOut?: () => void;
  onLocationPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Explicit height helps shared-element bounds differ between screens. */
  height?: number;
  /** Stretch to parent; image covers the container (for animated hero height). */
  fillContainer?: boolean;
  /** Progressive blur / warm tint stack over the hero image. */
  treatment?: ProgressiveImageTreatmentProps;
};

export function SessionHero({
  session,
  showStatusBadge = true,
  showActions = true,
  showProfessor = false,
  actionsInteractive = true,
  cardActionsStyle,
  profStyle,
  contentInset = 0,
  contentInsetProgress,
  contentInsetBleedStart = 0,
  chromeTop,
  chromeHorizontal,
  sharedTransition = false,
  onViewDetails,
  onViewDetailsPressIn,
  onViewDetailsPressOut,
  style,
  contentStyle,
  height = SESSION_HERO_MIN_HEIGHT,
  fillContainer = false,
  treatment,
}: Props) {
  const theme = useTheme();

  const image = (
    <Image
      source={session.image}
      resizeMode="cover"
      // Avoid Android’s default Image fade-in (reads as a photo flash on expand).
      fadeDuration={0}
      style={
        fillContainer
          ? {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }
          : { width: '100%', height }
      }
    />
  );

  const rootStyle = fillContainer
    ? [{ flex: 1, overflow: 'hidden' as const }, style]
    : [{ height, overflow: 'hidden' as const }, style];

  const overlay = (
    <SessionHeroOverlay
      session={session}
      theme={theme}
      showStatusBadge={showStatusBadge}
      showActions={showActions}
      showProfessor={showProfessor}
      actionsInteractive={actionsInteractive}
      cardActionsStyle={cardActionsStyle}
      profStyle={profStyle}
      contentInset={contentInset}
      contentInsetProgress={contentInsetProgress}
      contentInsetBleedStart={contentInsetBleedStart}
      chromeTop={chromeTop}
      chromeHorizontal={chromeHorizontal}
      contentStyle={contentStyle}
      onViewDetails={onViewDetails}
      onViewDetailsPressIn={onViewDetailsPressIn}
      onViewDetailsPressOut={onViewDetailsPressOut}
    />
  );

  if (sharedTransition) {
    return (
      <Animated.View
        sharedTransitionTag={SESSION_CARD_SHARED_TAG}
        sharedTransitionStyle={sessionCardSharedTransition}
        style={rootStyle}
      >
        {image}
        <ProgressiveImageTreatment {...treatment} />
        {overlay}
      </Animated.View>
    );
  }

  return (
    <View style={rootStyle}>
      {image}
      <ProgressiveImageTreatment {...treatment} />
      {overlay}
    </View>
  );
}

type OverlayProps = {
  session: TodaySession;
  theme: ReturnType<typeof useTheme>;
  showStatusBadge: boolean;
  showActions: boolean;
  showProfessor: boolean;
  actionsInteractive: boolean;
  cardActionsStyle?: StyleProp<ViewStyle>;
  profStyle?: StyleProp<ViewStyle>;
  contentInset: number;
  contentInsetProgress?: SharedValue<number>;
  contentInsetBleedStart: number;
  chromeTop?: number;
  chromeHorizontal?: number;
  contentStyle?: StyleProp<ViewStyle>;
  onViewDetails?: () => void;
  onViewDetailsPressIn?: () => void;
  onViewDetailsPressOut?: () => void;
};

function SessionHeroOverlay({
  session,
  theme,
  showStatusBadge,
  showActions,
  showProfessor,
  actionsInteractive,
  cardActionsStyle,
  profStyle,
  contentInset,
  contentInsetProgress,
  contentInsetBleedStart,
  chromeTop,
  chromeHorizontal,
  contentStyle,
  onViewDetails,
  onViewDetailsPressIn,
  onViewDetailsPressOut,
}: OverlayProps) {
  const bleedExtra = (t: number) => {
    'worklet';
    if (!contentInsetProgress) {
      return contentInset;
    }
    if (contentInsetBleedStart <= 0) {
      return interpolate(t, [0, 1], [0, contentInset]);
    }
    return (
      contentInset *
      interpolate(
        t,
        [contentInsetBleedStart, 1],
        [0, 1],
        Extrapolation.CLAMP,
      )
    );
  };

  const badgeStyle = useAnimatedStyle(() => {
    const t = contentInsetProgress?.value ?? 0;
    const extra = bleedExtra(t);
    // Morph into the detail close-button row (same top + vertical centre).
    const topBase =
      chromeTop != null && contentInsetProgress
        ? interpolate(t, [0, 1], [SESSION_HERO_CONTENT_PAD, chromeTop])
        : SESSION_HERO_CONTENT_PAD;
    const sideBase =
      chromeHorizontal != null && contentInsetProgress
        ? interpolate(t, [0, 1], [SESSION_HERO_CONTENT_PAD, chromeHorizontal])
        : SESSION_HERO_CONTENT_PAD;
    const rowHeight =
      chromeTop != null && contentInsetProgress
        ? interpolate(
            t,
            [0, 1],
            [SESSION_STATUS_BADGE_HEIGHT, HEADER_BAR_BUTTON_SIZE],
          )
        : SESSION_STATUS_BADGE_HEIGHT;
    return {
      position: 'absolute' as const,
      top: topBase + extra,
      left: sideBase + extra,
      right: sideBase + extra,
      height: rowHeight,
      justifyContent: 'center' as const,
      zIndex: 2,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const t = contentInsetProgress?.value ?? 0;
    const extra = bleedExtra(t);
    return {
      gap: 8,
      marginBottom: 16,
      paddingHorizontal: SESSION_HERO_CONTENT_PAD + extra,
    };
  });

  const metaStyle = useAnimatedStyle(() => {
    const t = contentInsetProgress?.value ?? 0;
    const extra = bleedExtra(t);
    const pad = SESSION_HERO_CONTENT_PAD + extra;
    return {
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      gap: 16,
      paddingTop: SESSION_HERO_CONTENT_PAD,
      paddingBottom: SESSION_HERO_CONTENT_PAD,
      paddingLeft: pad,
      paddingRight: pad,
      backgroundColor: todayTheme.sessionMetaFooter,
    };
  });

  return (
    <View pointerEvents="box-none" style={[absoluteFill, contentStyle]}>
      {showStatusBadge ? (
        <Animated.View pointerEvents="none" style={badgeStyle}>
          <SessionStatusBadge label={session.statusLabel} />
        </Animated.View>
      ) : null}

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={titleStyle}>
          <Text
            variant="body"
            style={{
              fontWeight: '600',
              color: todayTheme.sessionCourseCode,
              fontSize: 15,
              lineHeight: 15 * 1.2,
              letterSpacing: 0.4,
            }}
          >
            {session.courseCode}
          </Text>
          <Text
            variant="heading2"
            style={{
              color: theme.color.text.inverse,
              fontSize: 32,
              lineHeight: 32 * 0.94,
            }}
          >
            {session.title}
          </Text>
        </Animated.View>

        <Animated.View style={metaStyle}>
          <MetaField label="Ends" value={session.ends} />
          <MetaField label="Room" value={session.room} />
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            {showProfessor ? (
              <Animated.View
                pointerEvents="none"
                style={[{ position: 'absolute', right: 0, bottom: 0 }, profStyle]}
              >
                <MetaField label="Prof" value={session.professor} />
              </Animated.View>
            ) : null}
            {showActions ? (
              <Animated.View style={cardActionsStyle}>
                <SessionHeroActions
                  onViewDetails={actionsInteractive ? onViewDetails : undefined}
                  onViewDetailsPressIn={
                    actionsInteractive ? onViewDetailsPressIn : undefined
                  }
                  onViewDetailsPressOut={
                    actionsInteractive ? onViewDetailsPressOut : undefined
                  }
                />
              </Animated.View>
            ) : !showProfessor ? (
              <MetaField label="Prof" value={session.professor} />
            ) : null}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

export function SessionHeroActions({
  onViewDetails,
  onViewDetailsPressIn,
  onViewDetailsPressOut,
}: {
  onViewDetails?: () => void;
  onViewDetailsPressIn?: () => void;
  onViewDetailsPressOut?: () => void;
  /** @deprecated Location CTA removed from the homepage primary card. */
  onLocationPress?: () => void;
}) {
  const theme = useTheme();

  const label = (
    <Text
      variant="body"
      style={{
        fontWeight: '600',
        color: theme.color.text.inverse,
        fontSize: 16,
        lineHeight: 16 * 1.2,
      }}
    >
      View details
    </Text>
  );

  if (!onViewDetails) {
    return (
      <View
        style={{
          height: SESSION_ACTIONS_ROW_HEIGHT,
          paddingHorizontal: 18,
          borderRadius: 10,
          borderCurve: 'continuous',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: todayTheme.sessionButton,
        }}
      >
        {label}
      </View>
    );
  }

  return (
    <GlassActionButton
      onPress={onViewDetails}
      onPressIn={onViewDetailsPressIn}
      onPressOut={onViewDetailsPressOut}
      pressScaleEnabled={false}
      accessibilityLabel="View details"
      style={{
        height: SESSION_ACTIONS_ROW_HEIGHT,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderCurve: 'continuous',
        overflow: 'hidden',
      }}
      fallbackBackgroundColor={todayTheme.sessionButton}
    >
      {label}
    </GlassActionButton>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 64 }}>
      <Text
        variant="body"
        style={{
          fontWeight: '500',
          color: todayTheme.sessionMetaLabel,
          fontSize: 16,
          lineHeight: 16 * 1.2,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          fontWeight: '600',
          color: '#FFFFFF',
          fontSize: 17,
          lineHeight: 17 * 1.2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: '100%' as const,
  height: '100%' as const,
};
