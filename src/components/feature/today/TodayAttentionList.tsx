import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { AttentionItem } from './todayData';
import { todayHairlineCard } from './todaySurfaces';

const ICON_TILE = 36;
const ROW_GAP = 12;
const ROW_PAD_H = 16;
/** Divider starts after icon tile + gap. */
const DIVIDER_INSET = ROW_PAD_H + ICON_TILE + ROW_GAP;

type Props = {
  items: AttentionItem[];
  onActionPress?: (item: AttentionItem) => void;
};

export function TodayAttentionList({ items, onActionPress }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        overflow: 'hidden',
        ...todayHairlineCard,
      }}
    >
      {items.map((item, index) => (
        <View key={item.id}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: ROW_GAP,
              minHeight: 44,
              paddingHorizontal: ROW_PAD_H,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: ICON_TILE,
                height: ICON_TILE,
                borderRadius: 10,
                borderCurve: 'continuous',
                backgroundColor: 'rgba(145,34,56,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialSymbol icon={item.icon} size={22} color={theme.color.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                variant="body"
                style={{
                  fontWeight: '600',
                  fontSize: 18,
                  lineHeight: 18 * 1.2,
                  marginBottom: 2,
                }}
              >
                {item.title}
              </Text>
              <Text
                variant="body"
                color="subtle"
                style={{
                  fontWeight: '400',
                  fontSize: 15,
                  lineHeight: 15 * 1.45,
                }}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            </View>
            <Pressable
              onPress={() => onActionPress?.(item)}
              accessibilityRole="button"
              accessibilityLabel={item.actionLabel}
              style={{
                backgroundColor: 'rgba(145,34,56,0.1)',
                borderRadius: 8,
                borderCurve: 'continuous',
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text
                variant="body"
                color="brand"
                style={{
                  fontWeight: '600',
                  fontSize: 15,
                  lineHeight: 15 * 1.2,
                  letterSpacing: -0.2,
                }}
              >
                {item.actionLabel}
              </Text>
            </Pressable>
          </View>
          {index < items.length - 1 ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: 'rgba(0,0,0,0.08)',
                marginLeft: DIVIDER_INSET,
              }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
