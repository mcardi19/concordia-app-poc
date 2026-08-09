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

const OPEN_SPRING = { damping: 28, stiffness: 240, mass: 0.9 };
/** No overshoot — close must land exactly on the card without a bounce-chop. */
const CLOSE_SPRING = {
  damping: 34,
  stiffness: 300,
  mass: 0.85,
  overshootClamping: true,
};
const REDUCED_MS = 180;
/** Radius bleed eases in late so it does not make width hit the screen early. */
const BLEED_START = 0.88;
/** Full-screen backdrop blur (expo-blur max is 100). */
const BACKDROP_BLUR_INTENSITY = 100;
const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

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
  const setSourceHidden = useSessionExpansionStore((s) => s.setSourceHidden);
  const reset = useSessionExpansionStore((s) => s.reset);

  const progress = useSharedValue(0);
  const [closing, setClosing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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
        progress.value = withTiming(
          to,
          { duration: REDUCED_MS, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished && onDone) {
              runOnJS(onDone)();
            }
          },
        );
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
    // Settle on the card, reveal it under the overlay, then dismiss.
    // Do not reset() here — clearing session while mounted blanks the sheet.
    setSourceHidden(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        navigation.goBack();
      });
    });
  }, [navigation, setSourceHidden]);

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

  // Open from pressed frame; close retargets these to resting before collapsing.
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

    // Paint the overlay on the pressed card first (source still visible under it),
    // then hide the list card and expand — avoids a one-frame hole/flash.
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        setSourceHidden(true);
        animateTo(1, onOpenSettled);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    // Mount-only handoff.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = useCallback(() => {
    if (closing || !restingOrigin) {
      return;
    }
    setClosing(true);
    setScrollEnabled(false);
    // Retarget progress 0 to the resting card before collapsing (at progress 1
    // this does not move the sheet; it only changes the close destination).
    originX.value = restingOrigin.x;
    originY.value = restingOrigin.y;
    originW.value = restingOrigin.width;
    originH.value = restingOrigin.height;
    animateTo(0, finishClose);
  }, [
    animateTo,
    closing,
    finishClose,
    originH,
    originW,
    originX,
    originY,
    restingOrigin,
  ]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0.85, 1], Extrapolation.CLAMP),
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
      <Animated.View
        pointerEvents={closing ? 'none' : 'auto'}
        style={[StyleSheet.absoluteFillObject, backdropStyle]}
      >
        {/* Stacked blurs — one pass is not strong enough for App Store–style frost. */}
        <BlurView
          intensity={BACKDROP_BLUR_INTENSITY}
          tint="dark"
          experimentalBlurMethod={androidBlurMethod}
          style={StyleSheet.absoluteFillObject}
        />
        <BlurView
          intensity={BACKDROP_BLUR_INTENSITY}
          tint="dark"
          experimentalBlurMethod={androidBlurMethod}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(0,0,0,0.28)' },
          ]}
        />
      </Animated.View>

      <Animated.View style={[sheetStyle, sheetChromeStyle]}>
        {scrollEnabled ? (
          <Animated.ScrollView
            scrollEnabled
            bounces
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: tabBarInset + theme.spacing.xl + edgeBleed,
            }}
          >
            {body}
          </Animated.ScrollView>
        ) : (
          <View>{body}</View>
        )}

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
