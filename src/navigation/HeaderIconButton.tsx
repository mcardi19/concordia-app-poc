import React from 'react';
import { Pressable } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { MaterialSymbol } from '@/components/icons';
import { useTheme } from '@/design-system/theme';

/** Matches UIKit bar-button hit area so liquid-glass capsules center the glyph. */
export const HEADER_BAR_BUTTON_SIZE = 44;
export const HEADER_ICON_SIZE = 24;
/**
 * Distance from the safe-area top to the top of header action chrome.
 * Matches native UINavigationBar bar-button placement on the Home tab —
 * custom chrome (Me, session detail) must use the same offset.
 */
export const HEADER_CHROME_TOP_GAP = 0;
/**
 * Trailing/leading inset for header action chrome.
 * Matches Home's native bar-button margin and `theme.spacing.screenHorizontal`.
 */
export const HEADER_CHROME_HORIZONTAL_INSET = 16;

type Props = {
  icon: MsIconDefinition;
  accessibilityLabel: string;
  onPress?: () => void;
  /** Override tint; defaults to brand primary (matches headerTintColor). */
  color?: string;
};

/** Branded header action — square bar-button metrics for optical centering in liquid glass. */
export function HeaderIconButton({ icon, accessibilityLabel, onPress, color }: Props) {
  const theme = useTheme();
  const tint = color ?? theme.color.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => ({
        width: HEADER_BAR_BUTTON_SIZE,
        height: HEADER_BAR_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
      })}
    >
      <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={tint} />
    </Pressable>
  );
}
