import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { PinnedChip } from './todayData';
import { todayShadowSoft } from './todayShadows';

const REMOVE_BADGE_SIZE = 26;
const BADGE_IN_SPRING = { damping: 14, stiffness: 320, mass: 0.65 };
const BADGE_OUT_MS = 140;
const JIGGLE_DEG = 1.4;
const JIGGLE_HALF_MS = 110;

type Props = {
  chips: PinnedChip[];
  isEditing?: boolean;
  onChipPress?: (chip: PinnedChip) => void;
  onChipDelete?: (chip: PinnedChip) => void;
  onAddPress?: () => void;
};

/**
 * Liquid glass pill with the flat fallback. The shadow stays on the Pressable
 * outside it — glass sets `overflow: hidden` and would clip it — and press
 * feedback is the existing scale rather than an opacity dip, which would
 * flatten the effect.
 */
function ChipSurface({
  radius,
  children,
}: {
  radius: number;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const glass = useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return (
      <View
        style={[
          styles.chipSurface,
          { borderRadius: radius, backgroundColor: theme.color.background },
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme="light"
      style={[styles.chipSurface, { borderRadius: radius }]}
    >
      {children}
    </GlassView>
  );
}

type ChipItemProps = {
  chip: PinnedChip;
  index: number;
  isEditing: boolean;
  badgeStyle: ReturnType<typeof useAnimatedStyle>;
  onChipPress?: (chip: PinnedChip) => void;
  onChipDelete?: (chip: PinnedChip) => void;
};

function PinnedChipItem({
  chip,
  index,
  isEditing,
  badgeStyle,
  onChipPress,
  onChipDelete,
}: ChipItemProps) {
  const theme = useTheme();
  const jiggle = useSharedValue(0);

  useEffect(() => {
    if (isEditing) {
      const direction = index % 2 === 0 ? 1 : -1;
      const duration = JIGGLE_HALF_MS + (index % 3) * 12;
      jiggle.value = withRepeat(
        withSequence(
          withTiming(direction * JIGGLE_DEG, {
            duration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(direction * -JIGGLE_DEG, {
            duration,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      );
      return;
    }

    cancelAnimation(jiggle);
    jiggle.value = withTiming(0, { duration: BADGE_OUT_MS });
  }, [index, isEditing, jiggle]);

  const jiggleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${jiggle.value}deg` }],
  }));

  return (
    <Animated.View style={[{ position: 'relative' }, jiggleStyle]}>
      <Pressable
        onPress={() => {
          if (isEditing) return;
          onChipPress?.(chip);
        }}
        accessibilityRole="button"
        accessibilityLabel={chip.label}
        accessibilityState={{ disabled: isEditing }}
        style={({ pressed }) => ({
          borderRadius: theme.radius.full,
          borderCurve: 'continuous',
          transform: [{ scale: !isEditing && pressed ? 0.975 : 1 }],
          ...todayShadowSoft,
        })}
      >
        <ChipSurface radius={theme.radius.full}>
          <View style={[styles.chipContent, { gap: theme.spacing.sm }]}>
            <MaterialSymbol icon={chip.icon} size={18} color={chip.iconColor} />
            <Text
              variant="body"
              style={{
                fontWeight: '500',
                fontSize: 17,
                lineHeight: 17 * 1.2,
              }}
            >
              {chip.label}
            </Text>
          </View>
        </ChipSurface>
      </Pressable>

      <Animated.View
        pointerEvents={isEditing ? 'auto' : 'none'}
        style={[
          {
            position: 'absolute',
            zIndex: 1,
            top: -REMOVE_BADGE_SIZE / 2,
            left: -REMOVE_BADGE_SIZE / 2,
          },
          badgeStyle,
        ]}
      >
        <Pressable
          onPress={() => onChipDelete?.(chip)}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${chip.label}`}
          accessibilityElementsHidden={!isEditing}
          importantForAccessibility={isEditing ? 'yes' : 'no-hide-descendants'}
          hitSlop={6}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: REMOVE_BADGE_SIZE,
            height: REMOVE_BADGE_SIZE,
            borderRadius: REMOVE_BADGE_SIZE / 2,
            backgroundColor: '#C7C7CC',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <View
            style={{
              width: 12,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: '#3A3A3C',
            }}
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export function TodayPinnedChips({
  chips,
  isEditing = false,
  onChipPress,
  onChipDelete,
  onAddPress,
}: Props) {
  const theme = useTheme();
  const badgeScale = useSharedValue(0);
  const [showAddChip, setShowAddChip] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      setShowAddChip(true);
      badgeScale.value = withSpring(1, BADGE_IN_SPRING);
      return;
    }

    badgeScale.value = withTiming(0, { duration: BADGE_OUT_MS }, (finished) => {
      if (finished) {
        runOnJS(setShowAddChip)(false);
      }
    });
  }, [badgeScale, isEditing]);

  const badgeInsetStyle = useAnimatedStyle(() => ({
    paddingTop: (REMOVE_BADGE_SIZE / 2) * badgeScale.value,
    paddingLeft: (REMOVE_BADGE_SIZE / 2) * badgeScale.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeScale.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const addChipStyle = useAnimatedStyle(() => ({
    opacity: badgeScale.value,
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        badgeInsetStyle,
      ]}
    >
      {chips.map((chip, index) => (
        <PinnedChipItem
          key={chip.id}
          chip={chip}
          index={index}
          isEditing={isEditing}
          badgeStyle={badgeStyle}
          onChipPress={onChipPress}
          onChipDelete={onChipDelete}
        />
      ))}

      {showAddChip ? (
        <Animated.View pointerEvents={isEditing ? 'auto' : 'none'} style={addChipStyle}>
          <Pressable
            onPress={onAddPress}
            accessibilityRole="button"
            accessibilityLabel="Add pinned item"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              borderRadius: theme.radius.full,
              borderCurve: 'continuous',
              paddingLeft: 14,
              paddingRight: 16,
              paddingVertical: 10,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: theme.color.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="body"
              color="secondary"
              style={{
                fontWeight: '500',
                fontSize: 17,
                lineHeight: 17 * 1.2,
              }}
            >
              Add +
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chipSurface: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12.5,
    paddingRight: 16,
    paddingVertical: 10,
  },
});
