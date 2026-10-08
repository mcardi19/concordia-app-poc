import type { Meta, StoryObj } from '@storybook/react-native';
import { MeSectionLabel } from './MeSectionLabel';

const meta = {
  title: 'Me/Section Label',
  component: MeSectionLabel,
  args: {
    children: 'Accounts',
  },
} satisfies Meta<typeof MeSectionLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: 'See all',
    onActionPress: () => undefined,
  },
};
