import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { LIBRARY_QUICK_ACTIONS } from './libraryData';
import { LibraryQuickActionCard } from './LibraryQuickActionCard';

const meta = {
  title: 'Library/Quick Action Card',
  component: LibraryQuickActionCard,
  args: {
    action: LIBRARY_QUICK_ACTIONS[0],
    onPress: () => undefined,
  },
} satisfies Meta<typeof LibraryQuickActionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scan: Story = {};

export const Row: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {LIBRARY_QUICK_ACTIONS.map((action) => (
        <LibraryQuickActionCard key={action.id} action={action} />
      ))}
    </View>
  ),
};
