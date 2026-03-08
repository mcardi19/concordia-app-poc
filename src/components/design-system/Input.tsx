import React from 'react';
import { View, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { Text } from './Text';
import { MIN_TOUCH_TARGET_SIZE } from '@/accessibility';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  accessibilityLabel: accessibilityLabelProp,
  ...textInputProps
}: InputProps) {
  const theme = useTheme();

  const accessibilityLabel = accessibilityLabelProp ?? label;

  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label ? (
        <Text variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? theme.color.error : theme.color.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            minHeight: MIN_TOUCH_TARGET_SIZE,
            fontSize: theme.typography.body.fontSize,
            color: theme.color.text.primary,
            backgroundColor: theme.color.background,
          },
          style,
        ]}
        placeholderTextColor={theme.color.text.subtle}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="none"
        accessibilityHint={error}
        {...textInputProps}
      />
      {error ? (
        <Text variant="caption" color="secondary" style={{ color: theme.color.error, marginTop: theme.spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
