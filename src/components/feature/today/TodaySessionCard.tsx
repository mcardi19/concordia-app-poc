import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageBackground, Platform, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialSymbol, msLocationOn } from '@/components/icons';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';
import type { TodaySession } from './todayData';
import { todayShadowBrandButton, todayShadowMedium } from './todayShadows';

type Props = {
  session: TodaySession;
  onViewDetails?: () => void;
  onLocationPress?: () => void;
};

export function TodaySessionCard({ session, onViewDetails, onLocationPress }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        ...todayShadowMedium,
      }}
    >
      <View style={{ borderRadius: theme.radius.xl, overflow: 'hidden' }}>
        <ImageBackground
          source={session.image}
          style={{ minHeight: 400 }}
          imageStyle={{ resizeMode: 'cover' }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)', 'rgba(0,0,0,0.96)']}
            locations={[0, 0.5, 0.72, 1]}
            style={absoluteFill}
          />
          <View
            style={{
              padding: 22,
              minHeight: 400,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PulsingStatusDot color={theme.color.success} />
              <Text
                variant="body"
                style={{
                  fontFamily: fonts.interMedium,
                  color: '#DDDDDD',
                  fontSize: 13,
                  lineHeight: 13 * 1.2,
                }}
              >
                {session.statusLabel}
              </Text>
            </View>

            <View>
              <View style={{ gap: 12, marginBottom: 12, paddingBottom: 8 }}>
                <Text
                  variant="body"
                  style={{
                    fontFamily: fonts.interSemiBold,
                    color: '#CECAC2',
                    fontSize: 15,
                    lineHeight: 15 * 1.2,
                  }}
                >
                  {session.courseCode}
                </Text>
                <Text
                  variant="heading2"
                  style={{
                    fontFamily: fonts.interSemiBold,
                    color: theme.color.text.inverse,
                    fontSize: 32,
                    lineHeight: 32 * 0.94,
                    letterSpacing: 0,
                  }}
                >
                  {session.title}
                </Text>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#848484',
                  paddingTop: 12,
                  flexDirection: 'row',
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <MetaField label="Ends" value={session.ends} />
                <MetaField label="Room" value={session.room} />
                <MetaField label="Prof" value={session.professor} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Pressable
                  onPress={onViewDetails}
                  accessibilityRole="button"
                  accessibilityLabel="View details"
                  style={{
                    flex: 1,
                    backgroundColor: '#B02A44',
                    borderRadius: 8,
                    paddingVertical: 13,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    ...todayShadowBrandButton,
                  }}
                >
                  <Text
                    variant="body"
                    style={{
                      fontFamily: fonts.interSemiBold,
                      color: theme.color.text.inverse,
                      fontSize: 17,
                      lineHeight: 17 * 1.2,
                    }}
                  >
                    View details
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onLocationPress}
                  accessibilityRole="button"
                  accessibilityLabel="Open location"
                  style={{
                    width: 48,
                    height: 43,
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <BlurView
                    intensity={Platform.OS === 'ios' ? 50 : 40}
                    tint="light"
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      // Figma: backdrop-blur 12.5 + rgba(255,255,255,0.25)
                      backgroundColor: 'rgba(255,255,255,0.25)',
                    }}
                  >
                    <MaterialSymbol icon={msLocationOn} size={18} color={theme.color.text.inverse} />
                  </BlurView>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text
        variant="body"
        style={{
          fontFamily: fonts.interMedium,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 15,
          lineHeight: 15 * 1.2,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          fontFamily: fonts.interSemiBold,
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

function PulsingStatusDot({ color }: { color: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });

  return (
    <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          opacity: haloOpacity,
          transform: [{ scale: haloScale }],
        }}
      />
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
