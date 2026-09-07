import React from 'react';
import { StyleSheet } from 'react-native';
import { GlassActionButton } from '@/components/design-system';
import { MaterialSymbol, msArrowBackSemibold } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { searchTheme } from '@/screens/search/searchTheme';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from './HeaderIconButton';

type Props = {
  onPress?: () => void;
  /**
   * `onLight` — brand glyph on light glass (Search).
   * `onDark` — white glyph on dark glass (burgundy heroes).
   */
  tone?: 'onLight' | 'onDark';
};

/** Dark glass over burgundy heroes — same recipe as Me header chrome. */
const ON_DARK_TINT = 'rgba(63, 15, 26, 0.72)';
const ON_DARK_FALLBACK = 'rgba(255, 255, 255, 0.14)';

/**
 * In-screen back control: 44pt circle, `arrow_back` Semibold, soft lift.
 * Native stack headers cannot host this — they use `headerBackImageSource`.
 */
export function HeaderBackButton({ onPress, tone = 'onLight' }: Props) {
  const theme = useTheme();
  const onDark = tone === 'onDark';

  return (
    <GlassActionButton
      accessibilityLabel="Back"
      onPress={onPress}
      colorScheme={onDark ? 'dark' : 'light'}
      tintColor={onDark ? ON_DARK_TINT : undefined}
      fallbackBackgroundColor={
        onDark ? ON_DARK_FALLBACK : searchTheme.cardBackground
      }
      style={styles.capsule}
    >
      <MaterialSymbol
        icon={msArrowBackSemibold}
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
