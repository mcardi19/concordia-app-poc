import type { Meta, StoryObj } from '@storybook/react-native';
import { Input } from './Input';

const meta = {
  title: 'Design System/Input',
  component: Input,
  args: {
    label: 'Email',
    placeholder: 'you@concordia.ca',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: 'alex@concordia.ca',
  },
};

export const Error: Story = {
  args: {
    value: 'not-an-email',
    error: 'Enter a valid Concordia email',
  },
};

export const Disabled: Story = {
  args: {
    editable: false,
    value: 'Read only',
  },
};
