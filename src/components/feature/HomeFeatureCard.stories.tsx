import type { Meta, StoryObj } from '@storybook/react-native';
import { HomeFeatureCard } from './HomeFeatureCard';

const meta = {
  title: 'Home/Feature Card',
  component: HomeFeatureCard,
  args: {
    title: 'Academic calendar',
    subtitle: 'Important dates and deadlines',
    icon: 'calendar',
    onPress: () => undefined,
  },
} satisfies Meta<typeof HomeFeatureCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Wallet: Story = {
  args: {
    title: 'Balances',
    subtitle: 'Meal plan and Bear Bucks',
    icon: 'wallet',
  },
};
