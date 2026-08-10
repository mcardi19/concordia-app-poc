import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassActionButton, Text } from '@/components/design-system';
import { MaterialSymbol, msClose } from '@/components/icons';
import {
  SESSION_HERO_MIN_HEIGHT,
  SessionHero,
} from '@/components/feature/today/SessionHero';
import { useSessionExpansionStore } from '@/components/feature/today/sessionExpansionStore';
import {
  cardScaleSV,
  sourceHiddenSV,
} from '@/components/feature/today/sessionExpansionShared';
import { useTheme } from '@/design-system/theme';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { RootStackScreenProps } from '@/navigation/types';
import { todayTheme } from './todayTheme';

type Props = RootStackScreenProps<'SessionDetail'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DETAIL_HERO_HEIGHT = Math.max(
  Math.round(SCREEN_W * 1.15),
  SESSION_HERO_MIN_HEIGHT,
);

/**
 * Springs, not timing curves. A fixed-duration ease-out always reads as a cut
 * because it arrives with zero velocity on a schedule; a critically damped
 * spring decelerates into the frame the way the App Store expand does.
 * `dampingRatio: 1` = fastest settle with no overshoot.
 */
const OPEN_SPRING = { duration: 520, dampingRatio: 1 } as const;
const CLOSE_SPRING = { duration: 420, dampingRatio: 1 } as const;

/** Hide the list card once the sheet has started covering it. */
const SOURCE_HIDE_PROGRESS = 0.04;
/** Repaint the list card under the overlay before the collapse fully lands. */
const SOURCE_REVEAL_PROGRESS = 0.06;
/** Full-screen frost behind the expanding sheet (expo-blur max is 100). */
const BACKDROP_BLUR_INTENSITY = 100;
/**
 * Quantise blur intensity. Each distinct value re-rasterises the whole
 * UIVisualEffectView, so a per-frame ramp costs ~60 of them; in 12-point steps
 * it costs ~9 and looks identical in motion.
 */
const BLUR_STEP = 12;
const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/**
 * Never wrap BlurView in a view with animated opacity — that disables
 * UIVisualEffectView. Drive intensity + a separate dim instead.
 */
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

/**
 * Transparent-modal host for the App Store Today–style shared expand.
 *
 * Performance contract: the clip window (`sheetStyle`) is the ONLY node whose
 * layout animates. Everything inside it is laid out once at final size and
 * absolutely positioned, so resizing the window is a single cheap Yoga pass
 * with a fully cached subtree instead of a re-layout + text re-measure of the
 * whole detail view every frame. All content adjustment is transform/opacity.
 */
export function SessionDetailScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarScrollInset();
  const horizontalInset = theme.spacing.screenHorizontal;
  const topBarOffset = insets.top + 6;

  const session = useSessionExpansionStore((s) => s.session);
  const pressedOrigin = useSessionExpansionStore((s) => s.pressedOrigin);
  const restingOrigin = useSessionExpansionStore((s) => s.restingOrigin);
  const measureResting = useSessionExpansionStore((s) => s.measureResting);
  const setSourceHidden = useSessionExpansionStore((s) => s.setSourceHidden);
  const setRestingOrigin = useSessionExpansionStore((s) => s.setRestingOrigin);
  const reset = useSessionExpansionStore((s) => s.reset);

  const progress = useSharedValue(0);
  /** UI-thread close flag — the source reveal reaction must not lag a commit. */
  const collapsing = useSharedValue(0);
  const [closing, setClosing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const scrollRef = React.useRef<Animated.ScrollView>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const animateTo = useCallback(
    (to: number, onDone?: () => void) => {
      if (reduceMotion) {
        progress.value = withTiming(to, { duration: 0 }, (finished) => {
          if (finished && onDone) {
            runOnJS(onDone)();
          }
        });
        return;
      }
      progress.value = withSpring(
        to,
        to === 1 ? OPEN_SPRING : CLOSE_SPRING,
        (finished) => {
          if (finished && onDone) {
            runOnJS(onDone)();
          }
        },
      );
    },
    [progress, reduceMotion],
  );

  const onOpenSettled = useCallback(() => {
    setScrollEnabled(true);
  }, []);

  const finishClose = useCallback(() => {
    // The list card was already revealed at SOURCE_REVEAL_PROGRESS and has had
    // real frames to paint, so dismiss immediately — no rAF chain. The old
    // triple-rAF wait froze the last ~50ms of every close.
    progress.value = 0;
    cardScaleSV.value = 1;
    navigation.goBack();
  }, [navigation, progress]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const cardRadius =
    pressedOrigin?.borderRadius ?? restingOrigin?.borderRadius ?? theme.radius.xl;
  /**
   * Corner radius at full screen. The old build hid the radius by expanding the
   * sheet past the viewport, which forced every child to carry a matching
   * animated bleed inset (and therefore re-layout). Interpolating the radius
   * instead keeps content in plain screen coordinates. Devices with a home
   * indicator have rounded displays; 44 is a close approximation of the real
   * 47–55pt corner and reads as flush against the dark backdrop.
   */
  const screenRadius = insets.bottom > 0 ? 44 : 0;

  // Open from pressed frame; close retargets to a derived tap-sized frame.
  const originX = useSharedValue(pressedOrigin?.x ?? 0);
  const originY = useSharedValue(pressedOrigin?.y ?? 0);
  const originW = useSharedValue(pressedOrigin?.width ?? SCREEN_W);
  const originH = useSharedValue(
    pressedOrigin?.height ?? SESSION_HERO_MIN_HEIGHT,
  );

  /** Live clip-window size — content transforms are derived from these. */
  const frameW = useDerivedValue(
    () => originW.value + (SCREEN_W - originW.value) * progress.value,
  );
  const frameH = useDerivedValue(
    () => originH.value + (SCREEN_H - originH.value) * progress.value,
  );
  /**
   * Content is laid out at screen width but the window is card width while
   * collapsed. Left-anchored content already lines up with the card (the window
   * origin is the card origin); right-anchored content shifts left by the
   * window's missing width so it lands on the card's right padding.
   */
  const rightShift = useDerivedValue(() => frameW.value - SCREEN_W);
  /** Hold the meta row on the window's bottom edge until the hero fits. */
  const contentShift = useDerivedValue(() =>
    Math.min(0, frameH.value - DETAIL_HERO_HEIGHT),
  );

  useLayoutEffect(() => {
    if (!session || !pressedOrigin || !restingOrigin) {
      navigation.goBack();
      return;
    }
    originX.value = pressedOrigin.x;
    originY.value = pressedOrigin.y;
    originW.value = pressedOrigin.width;
    originH.value = pressedOrigin.height;
    // Keep the list card visible under the overlay until expand has covered it —
    // hiding earlier flashes the homepage behind a not-yet-painted sheet image.
    animateTo(1, onOpenSettled);
    // Mount-only handoff.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Source card handoff, both directions, entirely on the UI thread.
  useAnimatedReaction(
    () => progress.value,
    (p) => {
      if (collapsing.value === 0) {
        if (p > SOURCE_HIDE_PROGRESS && sourceHiddenSV.value === 0) {
          sourceHiddenSV.value = 1;
          // Resting layout under opacity 0 so close can remeasure accurately.
          cardScaleSV.value = 1;
          runOnJS(setSourceHidden)(true);
        }
        return;
      }
      if (p < SOURCE_REVEAL_PROGRESS && sourceHiddenSV.value === 1) {
        // Card is already at resting scale under the overlay, and the overlay is
        // collapsing onto that exact frame — so this is a pure opacity swap.
        cardScaleSV.value = 1;
        sourceHiddenSV.value = 0;
        runOnJS(setSourceHidden)(false);
      }
    },
    [setSourceHidden],
  );

  const onClose = useCallback(() => {
    if (closing || !restingOrigin) {
      return;
    }
    setClosing(true);
    setScrollEnabled(false);
    // Reset scroll so the collapsing window shows the hero, matching the card.
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const startCollapse = (resting: typeof restingOrigin) => {
      if (!resting) {
        return;
      }
      setRestingOrigin(resting);
      /**
       * Collapse onto the card's resting frame, not the tap-scaled one. The
       * overlay renders its content at scale 1; landing on a 0.97 frame meant
       * handing off to a card whose type and photo were 3% smaller, which read
       * as the title and image jumping. Exact frame = exact handoff. The cost
       * is the old press-scale bounce on close, which cannot survive a
       * pixel-accurate landing.
       */
      originX.value = resting.x;
      originY.value = resting.y;
      originW.value = resting.width;
      originH.value = resting.height;
      collapsing.value = 1;
      animateTo(0, finishClose);
    };

    // Remeasure at scale 1 — derived resting from the press can be a few px off.
    if (measureResting) {
      measureResting(startCollapse);
    } else {
      startCollapse(restingOrigin);
    }
  }, [
    animateTo,
    closing,
    collapsing,
    finishClose,
    measureResting,
    originH,
    originW,
    originX,
    originY,
    restingOrigin,
    setRestingOrigin,
  ]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const backdropBlurProps = useAnimatedProps(() => {
    const raw = interpolate(
      progress.value,
      [0, 0.35, 1],
      [0, BACKDROP_BLUR_INTENSITY * 0.7, BACKDROP_BLUR_INTENSITY],
      Extrapolation.CLAMP,
    );
    // Snapped — an unchanged value is diffed away and never reaches the view.
    return { intensity: Math.round(raw / BLUR_STEP) * BLUR_STEP };
  });

  /**
   * Intrinsic pixel size of the hero photo, needed to reproduce `cover` by hand.
   * Local `require()` assets resolve synchronously.
   */
  const heroImage = useMemo(() => {
    if (!session) {
      return null;
    }
    const resolved = Image.resolveAssetSource(session.image as ImageSourcePropType);
    return resolved && resolved.width > 0 && resolved.height > 0
      ? { w: resolved.width, h: resolved.height }
      : null;
  }, [session]);

  /**
   * `cover` fits the photo to whichever box it is laid out in, so the detail
   * hero (screen width × DETAIL_HERO_HEIGHT) and the list card crop the same
   * photo at different scales and centres — that mismatch is what made the
   * image jump at handoff.
   *
   * This re-derives cover for the live clip window and expresses the delta as a
   * transform: scale the element by targetCoverScale / laidOutCoverScale, then
   * recentre it on the window. At progress 0 that reproduces the card's crop
   * exactly; at progress 1 it resolves to identity.
   */
  const heroImageStyle = useAnimatedStyle(() => {
    if (!heroImage) {
      return { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] };
    }
    const windowW = frameW.value;
    const windowH = Math.min(frameH.value, DETAIL_HERO_HEIGHT);
    const target = Math.max(windowW / heroImage.w, windowH / heroImage.h);
    const laidOut = Math.max(
      SCREEN_W / heroImage.w,
      DETAIL_HERO_HEIGHT / heroImage.h,
    );
    return {
      transform: [
        { translateX: (windowW - SCREEN_W) / 2 },
        { translateY: (windowH - DETAIL_HERO_HEIGHT) / 2 },
        { scale: laidOut > 0 ? target / laidOut : 1 },
      ],
    };
  });

  const backdropDimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.35, 1],
      [0, 0.22, 0.4],
      Extrapolation.CLAMP,
    ),
  }));

  // The one node that resizes. Its children are fixed-size, so this is a single
  // cheap layout pass rather than a re-layout of the whole detail view.
  const sheetStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      left: originX.value * (1 - p),
      top: originY.value * (1 - p),
      width: frameW.value,
      height: frameH.value,
      // Non-layout prop: updates without dirtying Yoga.
      borderRadius:
        cardRadius +
        (screenRadius - cardRadius) *
          interpolate(p, [0.45, 1], [0, 1], Extrapolation.CLAMP),
    };
  });

  const detailChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.55, 0.9],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateX: rightShift.value }],
  }));

  // Fade out the card CTA; do not replace it with Prof in the detail hero.
  const cardActionsOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.3, 0.5],
      [1, 0.35, 0],
      Extrapolation.CLAMP,
    ),
  }));

  if (!session || !pressedOrigin || !restingOrigin) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      {/*
        Backdrop frost: intensity steps up with expand progress.
        Dim is a sibling — never put opacity on the BlurView’s parent.
      */}
      <View
        pointerEvents={closing ? 'none' : 'auto'}
        style={StyleSheet.absoluteFillObject}
      >
        <AnimatedBlurView
          animatedProps={backdropBlurProps}
          intensity={0}
          tint="dark"
          experimentalBlurMethod={androidBlurMethod}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: '#000000' },
            backdropDimStyle,
          ]}
        />
      </View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/*
          Fixed screen-sized scroller. Pinning width/height means the resizing
          window above never changes this subtree's constraints, so its content
          size and text metrics are measured once for the whole interaction.
        */}
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scroller}
          scrollEnabled={scrollEnabled && !closing}
          bounces={scrollEnabled && !closing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: tabBarInset + theme.spacing.xl,
          }}
        >
          <SessionHero
            session={session}
            height={DETAIL_HERO_HEIGHT}
            showStatusBadge
            showActions
            actionsInteractive={false}
            cardActionsStyle={cardActionsOpacityStyle}
            imageStyle={heroImageStyle}
            morphProgress={progress}
            rightShift={rightShift}
            contentShift={contentShift}
            chromeTop={topBarOffset}
            chromeHorizontal={horizontalInset}
            style={styles.hero}
          />

          {/*
            Always opaque — the expanding sheet is a window that clips this
            surface into view; do not fade or slide the detail body in.
          */}
          <View
            style={{
              paddingTop: 16,
              paddingHorizontal: horizontalInset,
              gap: theme.spacing.lg,
              backgroundColor: todayTheme.pageBackground,
              minHeight: SCREEN_H - DETAIL_HERO_HEIGHT * 0.45,
            }}
          >
            <Text variant="heading3">Class details</Text>
            <Text variant="body" color="secondary">
              {session.courseCode} · {session.title}. Ends at {session.ends} in{' '}
              {session.room} with {session.professor}.
            </Text>
          </View>
        </Animated.ScrollView>

        <Animated.View
          pointerEvents={scrollEnabled && !closing ? 'box-none' : 'none'}
          style={[
            styles.chrome,
            { top: topBarOffset, paddingRight: horizontalInset },
            detailChromeStyle,
          ]}
        >
          <GlassActionButton
            onPress={onClose}
            accessibilityLabel="Close"
            style={{
              width: HEADER_BAR_BUTTON_SIZE,
              height: HEADER_BAR_BUTTON_SIZE,
              borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}
            fallbackBackgroundColor="rgba(0,0,0,0.35)"
          >
            <MaterialSymbol icon={msClose} size={22} color={theme.color.primary} />
          </GlassActionButton>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  sheet: {
    position: 'absolute',
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: todayTheme.pageBackground,
  },
  // Screen-sized and screen-anchored so the clip window slides over it.
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  hero: {
    width: SCREEN_W,
  },
  // Fixed width so the resizing parent never re-lays this row (or its blur) out.
  chrome: {
    position: 'absolute',
    left: 0,
    width: SCREEN_W,
    height: HEADER_BAR_BUTTON_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
});
