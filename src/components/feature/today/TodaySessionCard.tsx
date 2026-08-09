import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/design-system/theme';
import type { TodaySession } from './todayData';
import { SessionHero } from './SessionHero';
import { useSessionExpansionStore } from './sessionExpansionStore';
import { sourceHiddenSV } from './sessionExpansionShared';
import { todayShadowMedium } from './todayShadows';

type Props = {
  session: TodaySession;
};

const PRESS_SCALE = 0.97;
const SPRING_PRESS = { damping: 24, stiffness: 380, mass: 0.75 };
const SPRING_RELEASE = { damping: 22, stiffness: 260, mass: 0.85 };

/**
 * Homepage session card. Press measures viewport geometry, seeds the expand
 * store, then presents the transparent detail host (no stack push animation).
 */
export function TodaySessionCard({ session }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();
  const cardRef = useRef<View>(null);
  const scale = useSharedValue(1);
  const openingRef = useRef(false);
  const sourceHidden = useSessionExpansionStore((s) => s.sourceHidden);
  const open = useSessionExpansionStore((s) => s.open);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    // UI-thread hide — must not wait on a React commit or the card holes out.
    opacity: sourceHiddenSV.value === 1 ? 0 : 1,
  }));

  useEffect(() => {
    if (!sourceHidden) {
      openingRef.current = false;
      scale.value = 1;
    } else {
      // Opacity is 0 under the overlay — restore resting scale for close handoff.
      scale.value = 1;
    }
  }, [sourceHidden, scale]);

  const onPressIn = useCallback(() => {
    openingRef.current = false;
    scale.value = withSpring(PRESS_SCALE, SPRING_PRESS);
  }, [scale]);

  const onPressOut = useCallback(() => {
    queueMicrotask(() => {
      if (!openingRef.current) {
        scale.value = withSpring(1, SPRING_RELEASE);
      }
      // If opening, keep PRESS_SCALE until the overlay covers and hides us.
    });
  }, [scale]);

  const onPress = useCallback(() => {
    openingRef.current = true;
    // Keep the pressed scale until the overlay covers this card (no scale pop / flash).
    cardRef.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) {
        openingRef.current = false;
        scale.value = withSpring(1, SPRING_RELEASE);
        return;
      }
      const radius = theme.radius.xl;
      const pressedOrigin = { x, y, width, height, borderRadius: radius };
      const layoutWidth = width / PRESS_SCALE;
      const layoutHeight = height / PRESS_SCALE;
      const restingOrigin = {
        x: x - (layoutWidth - width) / 2,
        y: y - (layoutHeight - height) / 2,
        width: layoutWidth,
        height: layoutHeight,
        borderRadius: radius,
      };
      open(session, pressedOrigin, restingOrigin);
      navigation.dispatch(CommonActions.navigate({ name: 'SessionDetail' }));
    });
  }, [navigation, open, scale, session, theme.radius.xl]);

  return (
    <Animated.View
      pointerEvents={sourceHidden ? 'none' : 'auto'}
      style={[todayShadowMedium, animatedStyle]}
    >
      <View
        ref={cardRef}
        collapsable={false}
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
  );
}
