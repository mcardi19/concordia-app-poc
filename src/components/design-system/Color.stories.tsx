import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { Text } from './Text';

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={{ width: 140, marginRight: 12, marginBottom: 16 }}>
      <View
        style={{
          height: 64,
          borderRadius: 8,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.08)',
        }}
      />
      <Text variant="caption" style={{ marginTop: 6 }}>
        {name}
      </Text>
      <Text variant="caption" color="subtle">
        {value}
      </Text>
    </View>
  );
}

export default {
  title: 'Design System/Colors',
};

export const Semantic = {
  render: function SemanticColors() {
    const theme = useTheme();
    const { color } = theme;
    const rows: { name: string; value: string }[] = [
      { name: 'primary', value: color.primary },
      { name: 'background', value: color.background },
      { name: 'backgroundSubtle', value: color.backgroundSubtle },
      { name: 'backgroundMuted', value: color.backgroundMuted },
      { name: 'backgroundBrand', value: color.backgroundBrand },
      { name: 'text.primary', value: color.text.primary },
      { name: 'text.secondary', value: color.text.secondary },
      { name: 'text.subtle', value: color.text.subtle },
      { name: 'text.brand', value: color.text.brand },
      { name: 'text.link', value: color.text.link },
      { name: 'border', value: color.border },
      { name: 'success', value: color.success },
      { name: 'warning', value: color.warning },
      { name: 'error', value: color.error },
      { name: 'info', value: color.info },
    ];

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {rows.map((row) => (
          <Swatch key={row.name} {...row} />
        ))}
      </View>
    );
  },
};
