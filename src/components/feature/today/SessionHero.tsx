import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {
  ProgressiveImageTreatment,
  Text,
  type ProgressiveImageTreatmentProps,
} from '@/components/design-system';
import { MaterialSymbol, msChevronRightSemibold } from '@/components/icons';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';
import { useFacultyProfile } from '@/hooks';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { useTodayTheme } from '@/screens/today/todayTheme';
import type { TodaySession } from './todayData';
import { SessionStatusBadge } from './SessionStatusBadge';
import {
  SESSION_CARD_SHARED_TAG,
  sessionCardSharedTransition,
} from './sessionSharedTransition';

/**
 * Near-black derived from brand `#912338` (rgb 145, 35, 56), scaled to ~11%
 * so the photo overlay reads as ink rather than a burgundy wash.
 */
const BRAND_INK = '16, 4, 6';
const SESSION_HERO_SCRIM_COLORS = [
  'transparent',
  `rgba(${BRAND_INK}, 0.62)`,
  `rgba(${BRAND_INK}, 0.96)`,
] as const;
const ON_SCRIM_TEXT_COLOR = '#FFFFFF';
const ON_PHOTO_BADGE_WASH = 'rgba(255, 255, 255, 0.2)';

const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/**
 * The session card is the only surface opted into Gill Sans Nova for now.
 * Roman family (CDS `gill-sans-nova`) at SemiBold.
 */
const SESSION_CARD_BRAND_FACE = fonts.brandSemiBold;

export const SESSION_HERO_MIN_HEIGHT = 400;
export const SESSION_HERO_CONTENT_PAD = 20;
/** Outer clip for the session card (larger than token `xl` / 12). */
export const SESSION_CARD_RADIUS = 24;
/** Photo shift inside the clip: up is negative. Extra height fills the gap. */
export const SESSION_HERO_IMAGE_OFFSET_Y = -4;
/** Natural height of the in-session pill (padding + label line). */
export const SESSION_STATUS_BADGE_HEIGHT = 34;
/** @deprecated CTA removed from the homepage card. */
export const SESSION_ACTIONS_ROW_HEIGHT = 44;
/** @deprecated Kept for export stability. */
export const SESSION_ACTIONS_GAP = 0;
/** @deprecated No separate actions block under the meta row. */
export const SESSION_ACTIONS_BLOCK = 0;

const PROF_AVATAR = 28;
const META_CHEVRON_SIZE = 44;
const META_CHEVRON_ICON = 24;

type Props = {
  session: TodaySession;
  /** When false, hides the in-session badge. */
  showStatusBadge?: boolean;
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
  imageStyle,
  onImageLoad,
  morphProgress,
  contentShift,
  chromeTop,
  chromeHorizontal,
  sharedTransition = false,
  style,
  contentStyle,
  height = SESSION_HERO_MIN_HEIGHT,
  fillContainer = false,
  treatment,
}: Props) {
  const todayTheme = useTodayTheme();

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
              top: SESSION_HERO_IMAGE_OFFSET_Y,
              right: 0,
              bottom: 0,
              left: 0,
              width: '100%',
            }
          : {
              width: '100%',
              height: height - SESSION_HERO_IMAGE_OFFSET_Y,
              marginTop: SESSION_HERO_IMAGE_OFFSET_Y,
            },
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
      todayTheme={todayTheme}
      showStatusBadge={showStatusBadge}
      morphProgress={morphProgress}
      contentShift={contentShift}
      chromeTop={chromeTop}
      chromeHorizontal={chromeHorizontal}
      contentStyle={contentStyle}
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
  todayTheme: ReturnType<typeof useTodayTheme>;
  showStatusBadge: boolean;
  morphProgress?: SharedValue<number>;
  contentShift?: SharedValue<number>;
  chromeTop?: number;
  chromeHorizontal?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

function SessionHeroOverlay({
  session,
  todayTheme,
  showStatusBadge,
  morphProgress,
  contentShift,
  chromeTop,
  chromeHorizontal,
  contentStyle,
}: OverlayProps) {
  const theme = useTheme();
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

  // Open affordance — gone the moment the overlay stands in for the card.
  const expanding = morphProgress != null;
  const chevronStyle = useAnimatedStyle(() => ({
    opacity: expanding ? 0 : 1,
  }));

  const hasPlace = Boolean(session.room && session.room !== '—');
  const hasTime = Boolean(session.timeRange);
  const hasType = Boolean(session.componentLabel);
  const hasCode = Boolean(session.courseCode);
  const hasProfessor = Boolean(session.professor && session.professor !== '—');
  const hasMeta = hasPlace || hasTime || hasCode || hasType;

  return (
    <View pointerEvents="box-none" style={[absoluteFill, contentStyle]}>
      <LinearGradient
        pointerEvents="none"
        colors={SESSION_HERO_SCRIM_COLORS}
        locations={[0.22, 0.54, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrim}
      />

      {showStatusBadge ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, badgeTransform]}
        >
          <SessionStatusBadge label={session.statusLabel} tone={session.statusTone} />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.column, columnTransform]}>
        <View style={styles.title}>
          {hasProfessor ? (
            <SessionProfessorRow
              name={session.professor}
              fpid={session.professorFpid}
            />
          ) : null}

          <Text
            variant="heading2"
            brandFace={SESSION_CARD_BRAND_FACE}
            style={{
              color: ON_SCRIM_TEXT_COLOR,
              fontSize: 40,
              lineHeight: 40,
              letterSpacing: 40 * -0.01,
              fontVariant: ['tabular-nums'],
              marginBottom: 6,
            }}
          >
            {session.title}
          </Text>

          {hasMeta ? (
            <View style={styles.metaWithChevron}>
              <View style={styles.metaColumn}>
                {hasCode || hasType ? (
                  <Text
                    variant="body"
                    style={[styles.courseMeta, { color: todayTheme.sessionCourseCode }]}
                  >
                    {hasCode ? session.courseCode : null}
                    {hasCode && hasType ? ' · ' : null}
                    {hasType ? session.componentLabel : null}
                  </Text>
                ) : null}

                {hasPlace || hasTime ? (
                  <View style={styles.placeTimeRow}>
                    {hasPlace ? <LocationBadge label={session.room} /> : null}
                    {hasTime ? (
                      <Text variant="body" style={styles.time}>
                        {session.timeRange}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.metaChevron,
                  { backgroundColor: ON_SCRIM_TEXT_COLOR },
                  chevronStyle,
                ]}
              >
                <MaterialSymbol
                  icon={msChevronRightSemibold}
                  size={META_CHEVRON_ICON}
                  color={theme.color.primary}
                />
              </Animated.View>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

function LocationBadge({ label }: { label: string }) {
  return (
    <View style={styles.locationBadge}>
      <BlurView
        pointerEvents="none"
        intensity={28}
        tint="light"
        experimentalBlurMethod={androidBlurMethod}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.locationWash} />
      <Text variant="body" style={styles.locationLabel}>
        {label}
      </Text>
    </View>
  );
}

function professorInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '').toUpperCase();
}

function SessionProfessorRow({
  name,
  fpid,
}: {
  name: string;
  fpid?: string;
}) {
  const { data: profile } = useFacultyProfile(fpid);
  const photoUrl = profile?.photoUrl;

  return (
    <View style={styles.professorRow}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.professorAvatar} />
      ) : (
        <View style={[styles.professorAvatar, styles.professorAvatarFallback]}>
          <Text variant="caption" style={styles.professorInitials}>
            {professorInitials(name)}
          </Text>
        </View>
      )}
      <Text variant="body" numberOfLines={1} style={styles.professorName}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
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
    paddingHorizontal: SESSION_HERO_CONTENT_PAD,
    paddingBottom: SESSION_HERO_CONTENT_PAD,
  },
  metaWithChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaColumn: {
    flex: 1,
    gap: 8,
  },
  metaChevron: {
    alignItems: 'center',
    justifyContent: 'center',
    width: META_CHEVRON_SIZE,
    height: META_CHEVRON_SIZE,
    borderRadius: META_CHEVRON_SIZE / 2,
  },
  placeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  locationBadge: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  locationWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ON_PHOTO_BADGE_WASH,
  },
  locationLabel: {
    fontWeight: '600',
    color: ON_SCRIM_TEXT_COLOR,
    fontSize: 14,
    lineHeight: 14 * 1.2,
  },
  time: {
    fontWeight: '500',
    color: ON_SCRIM_TEXT_COLOR,
    fontSize: 18,
    lineHeight: 18 * 1.2,
    fontVariant: ['tabular-nums'],
  },
  courseMeta: {
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 15 * 1.2,
    letterSpacing: 0,
  },
  professorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  professorAvatar: {
    width: PROF_AVATAR,
    height: PROF_AVATAR,
    borderRadius: PROF_AVATAR / 2,
  },
  professorAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  professorInitials: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: ON_SCRIM_TEXT_COLOR,
  },
  professorName: {
    flex: 1,
    fontWeight: '600',
    color: ON_SCRIM_TEXT_COLOR,
    fontSize: 15,
    lineHeight: 15 * 1.25,
  },
});

/**
 * @deprecated CTA removed from the homepage session card. Kept so existing
 * imports compile; renders nothing.
 */
export function SessionHeroActions(_props: {
  interactive?: boolean;
  onViewDetails?: () => void;
  onViewDetailsPressIn?: () => void;
  onViewDetailsPressOut?: () => void;
  onLocationPress?: () => void;
}) {
  return null;
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
