import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { SessionStatusBadge, SessionStatusBadgeOnLight } from './SessionStatusBadge';

const meta = {
  title: 'Today/Session Status Badge',
  component: SessionStatusBadge,
  args: {
    label: 'In session now',
    tone: '#2E7D32',
  },
} satisfies Meta<typeof SessionStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnPhoto: Story = {
  decorators: [
    (Story) => (
      <View
        style={{
          height: 120,
          justifyContent: 'center',
          padding: 16,
          backgroundColor: '#2a160e',
        }}
      >
        <Story />
      </View>
    ),
  ],
};

export const OnLight: StoryObj<typeof SessionStatusBadgeOnLight> = {
  render: () => <SessionStatusBadgeOnLight label="Starts in 25 min" />,
};
