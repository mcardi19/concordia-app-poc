import React from 'react';
import { StyleSheet } from 'react-native';
import { GlassActionButton } from '@/components/design-system';
import { MaterialSymbol, msCloseSemibold } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { searchTheme } from '@/screens/search/searchTheme';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from './HeaderIconButton';

type Props = {
  onPress?: () => void;
  /**
   * `onLight` — brand glyph on light glass (native headers).
   * `onDark` — white glyph on dark glass (burgundy Me masthead).
   */
  tone?: 'onLight' | 'onDark';
};

const ON_DARK_TINT = 'rgba(63, 15, 26, 0.72)';
const ON_DARK_FALLBACK = 'rgba(255, 255, 255, 0.14)';

/**
 * In-screen close control: 44pt circle, `close` Semibold, soft lift.
 * Same chrome as `HeaderBackButton`. In-screen chrome only — native stack
 * bars wrap `headerRight` in a UIBarButtonItem, and a second glass capsule
 * stacks on it (the overlap on Notifications).
 */
export function HeaderCloseButton({ onPress, tone = 'onLight' }: Props) {
  const theme = useTheme();
  const onDark = tone === 'onDark';

  return (
    <GlassActionButton
      accessibilityLabel="Close"
      onPress={onPress}
      colorScheme={onDark ? 'dark' : 'light'}
      tintColor={onDark ? ON_DARK_TINT : undefined}
      fallbackBackgroundColor={
        onDark ? ON_DARK_FALLBACK : searchTheme.cardBackground
      }
      style={styles.capsule}
    >
      <MaterialSymbol
        icon={msCloseSemibold}
        size={HEADER_ICON_SIZE}
        color={onDark ? '#FFFFFF' : theme.color.primary}
      />
    </GlassActionButton>
  );
}

const styles = StyleSheet.create({
  capsule: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
  },
});
