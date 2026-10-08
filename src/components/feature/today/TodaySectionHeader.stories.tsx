import type { Meta, StoryObj } from '@storybook/react-native';
import { TodaySectionHeader } from './TodaySectionHeader';

const meta = {
  title: 'Today/Section Header',
  component: TodaySectionHeader,
  args: {
    title: 'Campus today',
  },
} satisfies Meta<typeof TodaySectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actionLabel: 'See all',
    onActionPress: () => undefined,
  },
};

export const WithChevron: Story = {
  args: {
    showChevron: true,
    onPress: () => undefined,
  },
};
