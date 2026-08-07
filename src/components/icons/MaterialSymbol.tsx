import React from 'react';
import { View } from 'react-native';
import { MsIcon, type MsIconDefinition } from 'material-symbols-react-native';

export type MaterialSymbolProps = {
  /** Outlined/rounded symbol (default / inactive). */
  icon: MsIconDefinition;
  /** Filled symbol when active; falls back to icon if omitted. */
  filled?: MsIconDefinition;
  active?: boolean;
  size?: number;
  color?: string;
};

export function MaterialSymbol({
  icon,
  filled,
  active = false,
  size = 24,
  color,
}: MaterialSymbolProps) {
  const resolved = active && filled ? filled : icon;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MsIcon icon={resolved} size={size} color={color} />
    </View>
  );
}
