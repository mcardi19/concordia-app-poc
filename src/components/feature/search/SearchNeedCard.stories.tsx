import type { Meta, StoryObj } from '@storybook/react-native';
import { SEARCH_NEEDS } from './searchDiscoveryData';
import { SearchNeedRail } from './SearchNeedCard';

const meta = {
  title: 'Search/Need Rail',
  component: SearchNeedRail,
  args: {
    needs: SEARCH_NEEDS,
    onSelect: () => undefined,
  },
} satisfies Meta<typeof SearchNeedRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
