import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { MaterialSymbol, msLocalCafeFill } from '@/components/icons';
import { Text } from './Text';
import { GlassPillSurface, glassPillStyles, GLASS_PILL_ICON_SIZE } from './GlassPill';

const meta = {
  title: 'Design System/Glass Pill',
  component: GlassPillSurface,
  decorators: [
    (Story) => (
      <View
        style={{
          height: 120,
          justifyContent: 'center',
          backgroundColor: '#c9b8a8',
          padding: 16,
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof GlassPillSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    radius: 999,
    children: (
      <View style={glassPillStyles.content}>
        <MaterialSymbol icon={msLocalCafeFill} size={GLASS_PILL_ICON_SIZE} color="#912338" />
        <Text variant="body" style={[glassPillStyles.label, { marginLeft: 6 }]}>
          Café
        </Text>
      </View>
    ),
  },
};

export const Selected: Story = {
  args: {
    radius: 999,
    tintColor: '#912338',
    children: (
      <View style={glassPillStyles.content}>
        <MaterialSymbol icon={msLocalCafeFill} size={GLASS_PILL_ICON_SIZE} color="#fff" />
        <Text variant="body" style={[glassPillStyles.label, { marginLeft: 6, color: '#fff' }]}>
          Café
        </Text>
      </View>
    ),
  },
};
