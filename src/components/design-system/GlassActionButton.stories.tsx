import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { MaterialSymbol, msClose, msSearch } from '@/components/icons';
import { GlassActionButton } from './GlassActionButton';

const meta = {
  title: 'Design System/Glass Action Button',
  component: GlassActionButton,
  decorators: [
    (Story) => (
      <View
        style={{
          height: 160,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#6b4a3a',
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof GlassActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Search: Story = {
  args: {
    accessibilityLabel: 'Search',
    fallbackBackgroundColor: 'rgba(255,255,255,0.92)',
    style: { width: 44, height: 44, borderRadius: 22 },
    children: <MaterialSymbol icon={msSearch} size={22} color="#1a1a1a" />,
  },
};

export const Close: Story = {
  args: {
    accessibilityLabel: 'Close',
    fallbackBackgroundColor: 'rgba(255,255,255,0.92)',
    style: { width: 44, height: 44, borderRadius: 22 },
    children: <MaterialSymbol icon={msClose} size={22} color="#1a1a1a" />,
  },
};
