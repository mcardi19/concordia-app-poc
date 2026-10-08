import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { Text } from '@/components/design-system';
import { MaterialSymbol } from './MaterialSymbol';
import { featureSymbols, tabSymbols } from './symbols';

const meta = {
  title: 'Icons/Material Symbol',
  component: MaterialSymbol,
} satisfies Meta<typeof MaterialSymbol>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: tabSymbols.today.outline,
    size: 24,
  },
};

export const Tabs = {
  render: function TabIcons() {
    const theme = useTheme();
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        {(Object.keys(tabSymbols) as Array<keyof typeof tabSymbols>).map((key) => (
          <View key={key} style={{ alignItems: 'center', width: 72 }}>
            <MaterialSymbol icon={tabSymbols[key].outline} size={28} color={theme.color.text.primary} />
            <MaterialSymbol
              icon={tabSymbols[key].outline}
              filled={tabSymbols[key].filled}
              active
              size={28}
              color={theme.color.primary}
            />
            <Text variant="caption" style={{ marginTop: 8 }}>
              {key}
            </Text>
          </View>
        ))}
      </View>
    );
  },
};

export const Features = {
  render: function FeatureIcons() {
    const theme = useTheme();
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        {(Object.keys(featureSymbols) as Array<keyof typeof featureSymbols>).map((key) => (
          <View key={key} style={{ alignItems: 'center', width: 72 }}>
            <MaterialSymbol icon={featureSymbols[key]} size={28} color={theme.color.primary} />
            <Text variant="caption" style={{ marginTop: 8 }}>
              {key}
            </Text>
          </View>
        ))}
      </View>
    );
  },
};
