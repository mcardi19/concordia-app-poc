import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { CAMPUS_TODAY } from './todayData';
import { CampusEventCard } from './CampusEventCard';

const meta = {
  title: 'Today/Campus Event Card',
  component: CampusEventCard,
  args: {
    item: CAMPUS_TODAY[0],
    compact: true,
  },
  decorators: [
    (Story) => (
      <View style={{ width: 280, height: 360 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof CampusEventCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Added: Story = {
  args: { added: true },
};

export const Hybrid: Story = {
  args: { item: CAMPUS_TODAY[2] },
};
