import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from './Text';
import { Card } from './Card';

const meta = {
  title: 'Design System/Card',
  component: Card,
  args: {
    children: <Text>Card body</Text>,
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: { elevation: 'low' },
};

export const Medium: Story = {
  args: { elevation: 'medium' },
};

export const High: Story = {
  args: { elevation: 'high' },
};
