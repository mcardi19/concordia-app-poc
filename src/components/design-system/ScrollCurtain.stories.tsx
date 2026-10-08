import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Text } from './Text';
import { ScrollCurtain } from './ScrollCurtain';

const meta = {
  title: 'Design System/Scroll Curtain',
  component: ScrollCurtain,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ScrollCurtain>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OverContent: Story = {
  args: {
    color: '#FFFFFF',
    height: 96,
    blurred: false,
  },
  render: (args) => (
    <View style={{ height: 280, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: 72, paddingHorizontal: 16 }}>
        <Text variant="heading2">Scrolled content</Text>
        <Text variant="body" color="secondary">
          The curtain fades content as it passes under floating chrome.
        </Text>
      </View>
      <ScrollCurtain {...args} />
    </View>
  ),
};
