import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from './Text';
import { Screen } from './Screen';

const meta = {
  title: 'Design System/Screen',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: {
    children: <Text variant="heading2">Screen title</Text>,
  },
} satisfies Meta<typeof Screen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Padded: Story = {
  args: { padded: true, safe: true },
};

export const Unpadded: Story = {
  args: { padded: false, safe: false },
};
