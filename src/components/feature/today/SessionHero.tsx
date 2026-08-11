import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {
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
   * Reanimated transform for the hero photo. `cover` resolves against this
   * hero's own box, so the detail hero and the list card crop the photo
   * differently; the expand uses this to hold the card's crop at progress 0.
   */
  imageStyle?: StyleProp<ImageStyle>;
  /**
   * Fires once the photo has actually painted. The expand overlay uses this to
   * know when it is safe to cover (and then hide) the list card underneath.
   */
  onImageLoad?: () => void;
  /**
   * 0–1 expand progress. Drives the overlay morph with transforms only — the
   * overlay's own layout is fixed so no frame of the expand dirties Yoga.
   */
  morphProgress?: SharedValue<number>;
  /**
   * Negative px offset for right-anchored overlay content. The detail hero is
   * laid out at screen width but the clip window is card width while collapsed,
   * so right-anchored cells shift left by the window's missing width to land on
   * the card's right padding.
   */
  rightShift?: SharedValue<number>;
  /**
   * Negative px offset lifting title + meta so they hug the bottom of a clip
   * window that is still shorter than the hero.
   */
  contentShift?: SharedValue<number>;
  /**
   * Detail chrome top (safe-area aligned). When set with morphProgress, the
   * status badge translates from card padding into this row beside the close
   * control — position only, so its box never re-lays out.
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
  imageStyle,
  onImageLoad,
  morphProgress,
  rightShift,
  contentShift,
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
    <Animated.Image
      source={session.image}
      resizeMode="cover"
      // Avoid Android’s default Image fade-in (reads as a photo flash on expand).
      fadeDuration={0}
      onLoad={onImageLoad}
      style={[
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
          : { width: '100%', height },
        imageStyle,
      ]}
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
      morphProgress={morphProgress}
      rightShift={rightShift}
      contentShift={contentShift}
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
        <ProgressiveImageTreatment
        source={session.image}
        imageStyle={imageStyle}
        {...treatment}
      />
        {overlay}
      </Animated.View>
    );
  }

  return (
    <View style={rootStyle}>
      {image}
      <ProgressiveImageTreatment
        source={session.image}
        imageStyle={imageStyle}
        {...treatment}
      />
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
  morphProgress?: SharedValue<number>;
  rightShift?: SharedValue<number>;
  contentShift?: SharedValue<number>;
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
  morphProgress,
  rightShift,
  contentShift,
  chromeTop,
  chromeHorizontal,
  contentStyle,
  onViewDetails,
  onViewDetailsPressIn,
  onViewDetailsPressOut,
}: OverlayProps) {
  /**
   * The badge box is fixed; only its position animates. Translating instead of
   * moving top/left/right keeps the morph off the layout thread — a badge that
   * re-lays-out 60×/sec is what made the expand drop frames.
   */
  const badgeTransform = useAnimatedStyle(() => {
    const t = morphProgress?.value ?? 0;
    const targetTop =
      chromeTop != null
        ? chromeTop + (HEADER_BAR_BUTTON_SIZE - SESSION_STATUS_BADGE_HEIGHT) / 2
        : SESSION_HERO_CONTENT_PAD;
    const targetLeft = chromeHorizontal ?? SESSION_HERO_CONTENT_PAD;
    return {
      transform: [
        { translateY: (targetTop - SESSION_HERO_CONTENT_PAD) * t },
        { translateX: (targetLeft - SESSION_HERO_CONTENT_PAD) * t },
      ],
    };
  });

  // Lifts title + meta so they sit on the bottom edge of a still-collapsed window.
  const columnTransform = useAnimatedStyle(() => ({
    transform: [{ translateY: contentShift?.value ?? 0 }],
  }));

  // Right-anchored cell tracks the clip window's right edge, not the hero's.
  const rightCellTransform = useAnimatedStyle(() => ({
    transform: [{ translateX: rightShift?.value ?? 0 }],
  }));

  return (
    <View pointerEvents="box-none" style={[absoluteFill, contentStyle]}>
      {showStatusBadge ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, badgeTransform]}
        >
          <SessionStatusBadge label={session.statusLabel} />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.column, columnTransform]}>
        <View style={styles.title}>
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
              lineHeight: 32 * 1.15,
            }}
          >
            {session.title}
          </Text>
        </View>

        <View style={styles.meta}>
          <MetaField label="Ends" value={session.ends} />
          <MetaField label="Room" value={session.room} />
          <Animated.View style={[styles.rightCell, rightCellTransform]}>
            {showProfessor ? (
              <Animated.View
                pointerEvents="none"
                style={[{ position: 'absolute', right: 0, bottom: 0 }, profStyle]}
              >
                <MetaField label="Prof" value={session.professor} />
              </Animated.View>
            ) : null}
            {showActions ? (
              <Animated.View
                pointerEvents={actionsInteractive ? 'auto' : 'none'}
                accessibilityElementsHidden={!actionsInteractive}
                importantForAccessibility={
                  actionsInteractive ? 'auto' : 'no-hide-descendants'
                }
                style={cardActionsStyle}
              >
                <SessionHeroActions
                  interactive={actionsInteractive}
                  onViewDetails={onViewDetails}
                  onViewDetailsPressIn={onViewDetailsPressIn}
                  onViewDetailsPressOut={onViewDetailsPressOut}
                />
              </Animated.View>
            ) : !showProfessor ? (
              <MetaField label="Prof" value={session.professor} />
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Every box below is fixed. The expand morph only ever writes `transform` and
 * `opacity` on top of these, so no frame of it can dirty layout.
 */
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: SESSION_HERO_CONTENT_PAD,
    left: SESSION_HERO_CONTENT_PAD,
    right: SESSION_HERO_CONTENT_PAD,
    height: SESSION_STATUS_BADGE_HEIGHT,
    justifyContent: 'center',
    zIndex: 2,
  },
  column: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: SESSION_HERO_CONTENT_PAD,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    padding: SESSION_HERO_CONTENT_PAD,
    backgroundColor: todayTheme.sessionMetaFooter,
  },
  rightCell: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});

/**
 * A flat control, deliberately NOT liquid glass.
 *
 * The expand has to hide this button (it scales away as the card opens) and
 * hide the sheet that contains it (parked until the hero photo paints). Every
 * mechanism for that — alpha, offscreen parking, zero scale — leaves a
 * UIVisualEffectView with no backdrop to sample, so it renders flat and only
 * corrects once the overlay is torn down. That read as the CTA flashing a
 * pressed state on close. A flat fill cannot degrade, and the two copies stay
 * identical through the whole morph.
 */
export function SessionHeroActions({
  interactive = true,
  onViewDetails,
  onViewDetailsPressIn,
  onViewDetailsPressOut,
}: {
  /** When false the control is decorative (expand overlay) but looks identical. */
  interactive?: boolean;
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

  // One style object, shared by both branches — the list card and the expand
  // overlay must be identical by construction, not by coincidence.
  const surface = {
    height: SESSION_ACTIONS_ROW_HEIGHT,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderCurve: 'continuous' as const,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: todayTheme.sessionButton,
  };

  if (!interactive) {
    return <View style={surface}>{label}</View>;
  }

  return (
    <Pressable
      onPress={onViewDetails}
      onPressIn={onViewDetailsPressIn}
      onPressOut={onViewDetailsPressOut}
      accessibilityRole="button"
      accessibilityLabel="View details"
      style={surface}
    >
      {label}
    </Pressable>
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
