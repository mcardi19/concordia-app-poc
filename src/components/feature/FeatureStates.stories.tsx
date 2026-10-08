import type { Meta, StoryObj } from '@storybook/react-native';
import { EmptyState, ErrorState, LoadingState } from './FeatureStates';

const meta = {
  title: 'Feature/States',
  component: LoadingState,
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { message: 'Loading timetable…' },
};

export const Error: StoryObj<typeof ErrorState> = {
  render: () => (
    <ErrorState message="Could not load your schedule." onRetry={() => undefined} />
  ),
};

export const Empty: StoryObj<typeof EmptyState> = {
  render: () => <EmptyState message="No classes today." />,
};
