import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Text } from './Text';

const meta = {
  title: 'Design System/Text',
  component: Text,
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: {
    variant: 'heading1',
    children: 'Today at Concordia',
  },
};

export const Heading2: Story = {
  args: {
    variant: 'heading2',
    children: 'Your next class',
  },
};

export const Heading3: Story = {
  args: {
    variant: 'heading3',
    children: 'COMP 248',
  },
};

export const Body: Story = {
  args: {
    variant: 'body',
  },
};

export const BodySmall: Story = {
  args: {
    variant: 'bodySmall',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    color: 'subtle',
  },
};

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text color="primary">Primary</Text>
      <Text color="secondary">Secondary</Text>
      <Text color="subtle">Subtle</Text>
      <Text color="brand">Brand</Text>
      <Text color="link">Link</Text>
    </View>
  ),
};
