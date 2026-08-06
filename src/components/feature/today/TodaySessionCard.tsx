import React from 'react';
import { ImageBackground, Pressable, View } from 'react-native';
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
          style={{ minHeight: 340 }}
          imageStyle={{ resizeMode: 'cover' }}
        >
          <View style={{ ...absoluteFill, backgroundColor: 'rgba(0,0,0,0.42)' }} />
          <View
            style={{
              padding: 22,
              minHeight: 340,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.color.success,
                }}
              />
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
                    fontFamily: fonts.interBold,
                    color: theme.color.text.inverse,
                    fontSize: 40,
                    lineHeight: 40 * 0.94,
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
                  marginBottom: 12,
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
                      fontSize: 15,
                      lineHeight: 15 * 1.2,
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
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialSymbol icon={msLocationOn} size={18} color={theme.color.text.inverse} />
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
          fontSize: 13,
          lineHeight: 13 * 1.2,
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
          fontSize: 15,
          lineHeight: 15 * 1.2,
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
};
