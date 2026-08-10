import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
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
  PRESS_SCALE,
  SPRING_RELEASE,
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

/** Full open/close morph duration (card ↔ fullscreen). */
const TRANSITION_MS = 280;
/** Decelerate into the final frame — soft landing instead of a hard cut. */
const TRANSITION_EASING = Easing.bezier(0.22, 1, 0.36, 1);
/** Radius bleed eases in late so it does not make width hit the screen early. */
const BLEED_START = 0.88;
/** Hide list card once the sheet has started covering it. */
const SOURCE_HIDE_PROGRESS = 0.04;
/** Full-screen frost behind the expanding sheet (expo-blur max is 100). */
const BACKDROP_BLUR_INTENSITY = 100;
const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

/**
 * Never wrap BlurView in a view with animated opacity — that disables
 * UIVisualEffectView. Drive intensity + a separate dim instead.
 */
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

/**
 * Transparent-modal host for the App Store Today–style shared expand.
 * One progress value morphs measured card geometry → full screen.
 * Screen insets close proportionally so width and height edges arrive together.
 * Corner radius stays at the card value for the whole interaction.
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
      progress.value = withTiming(
        to,
        {
          duration: reduceMotion ? 0 : TRANSITION_MS,
          easing: TRANSITION_EASING,
        },
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
    // Land on the tap-sized frame, reveal the list card at PRESS_SCALE under it,
    // wait for that paint, dismiss the overlay, then spring back to resting.
    progress.value = 0;
    cardScaleSV.value = PRESS_SCALE;
    sourceHiddenSV.value = 0;
    setSourceHidden(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          navigation.goBack();
          cardScaleSV.value = withSpring(1, SPRING_RELEASE);
        });
      });
    });
  }, [navigation, progress, setSourceHidden]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  /**
   * Corner radius never animates. The sheet expands to a rect larger than the
   * screen so the constant radius sits outside the clipped viewport — full-bleed
   * without squaring corners mid-flight.
   * Continuous/squircle curves need more bleed than the nominal radius.
   */
  const cardRadius =
    pressedOrigin?.borderRadius ?? restingOrigin?.borderRadius ?? theme.radius.xl;
  const edgeBleed = Math.max(cardRadius * 5, 60);

  // Open from pressed frame; close retargets to a derived tap-sized frame.
  const originX = useSharedValue(pressedOrigin?.x ?? 0);
  const originY = useSharedValue(pressedOrigin?.y ?? 0);
  const originW = useSharedValue(pressedOrigin?.width ?? SCREEN_W);
  const originH = useSharedValue(
    pressedOrigin?.height ?? SESSION_HERO_MIN_HEIGHT,
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

  // Hide the source only after the sheet has started covering it.
  useAnimatedReaction(
    () => progress.value,
    (p) => {
      if (p > SOURCE_HIDE_PROGRESS && sourceHiddenSV.value === 0) {
        sourceHiddenSV.value = 1;
        // Resting layout under opacity 0 so close can remasure accurately.
        cardScaleSV.value = 1;
        runOnJS(setSourceHidden)(true);
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
      // Collapse to the tap/pressed frame (centred scale of the live resting card),
      // then the list card bounces back to resting after handoff.
      const pressedW = resting.width * PRESS_SCALE;
      const pressedH = resting.height * PRESS_SCALE;
      originX.value = resting.x + (resting.width - pressedW) / 2;
      originY.value = resting.y + (resting.height - pressedH) / 2;
      originW.value = pressedW;
      originH.value = pressedH;
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

  const backdropBlurProps = useAnimatedProps(() => ({
    // Blur ramps with the expand — not via parent opacity (that kills the effect).
    intensity: interpolate(
      progress.value,
      [0, 0.35, 1],
      [0, BACKDROP_BLUR_INTENSITY * 0.7, BACKDROP_BLUR_INTENSITY],
      Extrapolation.CLAMP,
    ),
  }));

  const backdropDimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.35, 1],
      [0, 0.22, 0.4],
      Extrapolation.CLAMP,
    ),
  }));

  const sheetStyle = useAnimatedStyle(() => {
    const p = progress.value;
    // Close screen insets in lockstep: remainingLeft/originX === remainingTop/originY.
    // That makes left/right and top/bottom edges meet the screen at the same progress.
    const flushLeft = originX.value * (1 - p);
    const flushTop = originY.value * (1 - p);
    const flushW = originW.value + (SCREEN_W - originW.value) * p;
    const flushH = originH.value + (SCREEN_H - originH.value) * p;
    // Radius bleed only after the flush rect has nearly filled the screen.
    const bleed =
      edgeBleed * interpolate(p, [BLEED_START, 1], [0, 1], Extrapolation.CLAMP);
    return {
      position: 'absolute' as const,
      left: flushLeft - bleed,
      top: flushTop - bleed,
      width: flushW + bleed * 2,
      height: flushH + bleed * 2,
    };
  });

  // Static chrome — not inside useAnimatedStyle, so Reanimated cannot tween it.
  const sheetChromeStyle = {
    borderRadius: cardRadius,
    borderCurve: 'continuous' as const,
    overflow: 'hidden' as const,
    backgroundColor: todayTheme.pageBackground,
  };

  const heroHeightStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const bleed =
      edgeBleed * interpolate(p, [BLEED_START, 1], [0, 1], Extrapolation.CLAMP);
    return {
      height:
        originH.value + (DETAIL_HERO_HEIGHT - originH.value) * p + bleed,
      width: '100%' as const,
      overflow: 'hidden' as const,
    };
  });

  const detailChromeStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const bleed =
      edgeBleed * interpolate(p, [BLEED_START, 1], [0, 1], Extrapolation.CLAMP);
    return {
      position: 'absolute' as const,
      top: topBarOffset + bleed,
      left: horizontalInset + bleed,
      right: horizontalInset + bleed,
      height: HEADER_BAR_BUTTON_SIZE,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'flex-end' as const,
      zIndex: 10,
      opacity: interpolate(p, [0.55, 0.9], [0, 1], Extrapolation.CLAMP),
    };
  });

  const bodyStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const bleed =
      edgeBleed * interpolate(p, [BLEED_START, 1], [0, 1], Extrapolation.CLAMP);
    return {
      paddingTop: 16,
      paddingHorizontal: horizontalInset + bleed,
      gap: theme.spacing.lg,
      backgroundColor: todayTheme.pageBackground,
      minHeight: SCREEN_H - DETAIL_HERO_HEIGHT * 0.45,
    };
  });

  // Fade out the card CTA; do not replace it with Prof in the detail hero.
  const cardActionsOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 0.5], [1, 0.35, 0], Extrapolation.CLAMP),
  }));

  if (!session || !pressedOrigin || !restingOrigin) {
    return <View style={styles.root} />;
  }

  const body = (
    <>
      <Animated.View style={heroHeightStyle}>
        <SessionHero
          session={session}
          fillContainer
          showStatusBadge
          showActions
          actionsInteractive={false}
          cardActionsStyle={cardActionsOpacityStyle}
          contentInset={edgeBleed}
          contentInsetProgress={progress}
          contentInsetBleedStart={BLEED_START}
          chromeTop={topBarOffset}
          chromeHorizontal={horizontalInset}
          style={{ width: '100%' }}
        />
      </Animated.View>

      {/*
        Always opaque — the expanding sheet is a window that clips this
        surface into view; do not fade or slide the detail body in.
      */}
      <Animated.View style={bodyStyle}>
        <Text variant="heading3">Class details</Text>
        <Text variant="body" color="secondary">
          {session.courseCode} · {session.title}. Ends at {session.ends} in{' '}
          {session.room} with {session.professor}.
        </Text>
      </Animated.View>
    </>
  );

  return (
    <View style={styles.root}>
      {/*
        Backdrop frost: intensity fades up with expand progress.
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

      <Animated.View style={[sheetStyle, sheetChromeStyle]}>
        <Animated.ScrollView
          ref={scrollRef}
          scrollEnabled={scrollEnabled && !closing}
          bounces={scrollEnabled && !closing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: tabBarInset + theme.spacing.xl + edgeBleed,
          }}
        >
          {body}
        </Animated.ScrollView>

        <Animated.View
          pointerEvents={scrollEnabled && !closing ? 'box-none' : 'none'}
          style={detailChromeStyle}
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
});
