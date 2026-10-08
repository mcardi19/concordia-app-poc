import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { PulsingStatusDot } from './PulsingStatusDot';

const meta = {
  title: 'Design System/Pulsing Status Dot',
  component: PulsingStatusDot,
  args: {
    color: '#2E7D32',
    size: 10,
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, alignItems: 'flex-start' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PulsingStatusDot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Live: Story = {};

export const Large: Story = {
  args: { size: 16 },
};
