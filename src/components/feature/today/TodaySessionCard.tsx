import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/design-system/theme';
import type { TodaySession } from './todayData';
import { SessionHero } from './SessionHero';
import { useSessionExpansionStore } from './sessionExpansionStore';
import {
  PRESS_SCALE,
  SPRING_PRESS,
  SPRING_RELEASE,
  cardScaleSV,
  sourceHiddenSV,
} from './sessionExpansionShared';
import { todayShadowMedium } from './todayShadows';

type Props = {
  session: TodaySession;
};

/**
 * Distance the card is parked while the expand overlay stands in for it.
 * Deliberately a transform rather than `opacity: 0`: the "View details" control
 * is a GlassView, and a visual effect view held at alpha 0 renders incorrectly
 * for a frame when it comes back — which read as the button returning in a
 * pressed state and then settling.
 */
const OFFSCREEN_PARK = Dimensions.get('window').width * 2;

/**
 * Homepage session card. Press measures viewport geometry, seeds the expand
 * store, then presents the transparent detail host (no stack push animation).
 */
export function TodaySessionCard({ session }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();
  const cardRef = useRef<View>(null);
  const openingRef = useRef(false);
  const sourceHidden = useSessionExpansionStore((s) => s.sourceHidden);
  const open = useSessionExpansionStore((s) => s.open);
  const setMeasureResting = useSessionExpansionStore((s) => s.setMeasureResting);

  // UI-thread hide — must not wait on a React commit or the card holes out.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sourceHiddenSV.value === 1 ? OFFSCREEN_PARK : 0 },
      { scale: cardScaleSV.value },
    ],
  }));

  useEffect(() => {
    if (!sourceHidden) {
      openingRef.current = false;
      // Close handoff may leave scale at PRESS_SCALE and bounce via cardScaleSV.
    } else {
      // Under the overlay — resting layout so close can remasure accurately.
      cardScaleSV.value = 1;
    }
  }, [sourceHidden]);

  // cardRef is untransformed, so this reports the resting frame at any scale.
  useEffect(() => {
    const radius = theme.radius.xl;
    setMeasureResting((callback) => {
      cardRef.current?.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) {
          const fallback = useSessionExpansionStore.getState().restingOrigin;
          if (fallback) {
            callback(fallback);
          }
          return;
        }
        callback({ x, y, width, height, borderRadius: radius });
      });
    });
    return () => setMeasureResting(null);
  }, [setMeasureResting, theme.radius.xl]);

  const onPressIn = useCallback(() => {
    openingRef.current = false;
    cardScaleSV.value = withSpring(PRESS_SCALE, SPRING_PRESS);
  }, []);

  const onPressOut = useCallback(() => {
    /**
     * Always release, including while opening. Holding PRESS_SCALE until the
     * overlay covered the card meant every frame of latency before the expand
     * started read as the card sticking down. The overlay now opens from the
     * resting frame, so there is nothing left for the hold to line up with.
     */
    cardScaleSV.value = withSpring(1, SPRING_RELEASE);
  }, []);

  const onPress = useCallback(() => {
    openingRef.current = true;
    cardRef.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) {
        openingRef.current = false;
        cardScaleSV.value = withSpring(1, SPRING_RELEASE);
        return;
      }
      const radius = theme.radius.xl;
      /**
       * cardRef now sits outside the scale transform, so this is already the
       * resting layout frame — no dividing PRESS_SCALE back out. The pressed
       * frame is derived from it instead, centred like the scale is.
       */
      const restingOrigin = { x, y, width, height, borderRadius: radius };
      const pressedW = width * PRESS_SCALE;
      const pressedH = height * PRESS_SCALE;
      const pressedOrigin = {
        x: x + (width - pressedW) / 2,
        y: y + (height - pressedH) / 2,
        width: pressedW,
        height: pressedH,
        borderRadius: radius,
      };
      open(session, pressedOrigin, restingOrigin);
      navigation.dispatch(CommonActions.navigate({ name: 'SessionDetail' }));
    });
  }, [navigation, open, session, theme.radius.xl]);

  return (
    <View ref={cardRef} collapsable={false}>
      <Animated.View
        pointerEvents={sourceHidden ? 'none' : 'auto'}
        style={[todayShadowMedium, animatedStyle]}
      >
        <View
          style={{
            borderRadius: theme.radius.xl,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}
        >
          <SessionHero
            session={session}
            onViewDetails={onPress}
            onViewDetailsPressIn={onPressIn}
            onViewDetailsPressOut={onPressOut}
            style={{
              borderRadius: theme.radius.xl,
              borderCurve: 'continuous',
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
