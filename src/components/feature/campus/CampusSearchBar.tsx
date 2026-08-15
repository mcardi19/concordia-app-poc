import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msClose, msSearch } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { searchFieldHeight } from '@/design-system/tokens';
import { MIN_TOUCH_TARGET_SIZE } from '@/accessibility';

type Props = {
  onPress: () => void;
  placeholder?: string;
  /** The active category, shown in place of the placeholder. */
  value?: string | null;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SEARCH_FIELD_HEIGHT = Math.max(MIN_TOUCH_TARGET_SIZE, searchFieldHeight);
/** Clear the capsule’s rounded ends (optical inset past the curve). */
const SEARCH_FIELD_HORIZONTAL_INSET = 22;

function canUseLiquidGlass(): boolean {
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/** Absolute-fill glass / blur chrome only — layout stays on sibling content. */
function GlassChrome({ style }: { style?: StyleProp<ViewStyle> }) {
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  if (useGlass) {
    return (
      <GlassView
        pointerEvents="none"
        isInteractive={false}
        glassEffectStyle="regular"
        colorScheme="light"
        style={[StyleSheet.absoluteFillObject, style]}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        pointerEvents="none"
        intensity={64}
        tint="systemChromeMaterialLight"
        style={[StyleSheet.absoluteFillObject, style]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: 'rgba(255,255,255,0.82)' },
        style,
      ]}
    />
  );
}

/**
 * The map's search field.
 *
 * A button, not an input: tapping it pushes the Campus search screen, which
 * reaches courses, library and services as well as buildings and can hand a
 * place back to the map. It used to filter buildings inline, which could only
 * ever find buildings and left no room for the resting state.
 */
export function CampusSearchBar({
  onPress,
  placeholder = 'Search campus',
  value,
  onClear,
  style,
}: Props) {
  const theme = useTheme();
  const active = value != null && value.length > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={active ? `${value}. Search campus` : placeholder}
      style={({ pressed }) => [style, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View
        style={[
          styles.fieldShell,
          radiusStyle(theme.radius.full),
          { height: SEARCH_FIELD_HEIGHT },
        ]}
      >
        <GlassChrome />
        <View
          style={[
            styles.fieldForeground,
            {
              height: SEARCH_FIELD_HEIGHT,
              paddingHorizontal: SEARCH_FIELD_HORIZONTAL_INSET,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <MaterialSymbol
            icon={msSearch}
            size={22}
            color={theme.color.primary}
          />
          <Text
            variant="body"
            numberOfLines={1}
            style={[
              styles.fieldPlaceholder,
              {
                color: active ? theme.color.text.primary : theme.color.text.subtle,
                fontWeight: active ? '600' : undefined,
              },
            ]}
          >
            {active ? value : placeholder}
          </Text>
          {/*
            Clearing the category is not the same as opening search, so it
            gets its own hit target inside the field rather than riding the
            field's own press.
          */}
          {active && onClear ? (
            <Pressable
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${value}`}
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearButton,
                { backgroundColor: theme.color.backgroundSubtle, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <MaterialSymbol icon={msClose} size={14} color={theme.color.text.secondary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldShell: {
    overflow: 'hidden',
    position: 'relative',
  },
  fieldForeground: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  fieldPlaceholder: {
    flex: 1,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
