import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { AttentionItem } from './todayData';
import { todayShadowHigh } from './todayShadows';

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
        backgroundColor: theme.color.background,
        ...todayShadowHigh,
      }}
    >
      <View style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}>
        {items.map((item, index) => (
          <View key={item.id}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 44,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: theme.color.background,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(145,34,56,0.06)',
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
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  variant="body"
                  color="brand"
                  style={{
                    fontWeight: '500',
                    fontSize: 15,
                    lineHeight: 15 * 1.2,
                  }}
                >
                  {item.actionLabel}
                </Text>
              </Pressable>
            </View>
            {index < items.length - 1 ? (
              <View style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
