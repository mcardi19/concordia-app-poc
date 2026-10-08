import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Text } from './Text';
import { CardGlass, SheetGlass } from './GlassSurface';

const meta = {
  title: 'Design System/Glass Surface',
  component: CardGlass,
} satisfies Meta<typeof CardGlass>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {
  args: { radius: 24 },
  render: (args) => (
    <View
      style={{
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#8a6a4a',
        justifyContent: 'flex-end',
        padding: 20,
      }}
    >
      <CardGlass {...args} />
      <Text variant="heading3">Card glass</Text>
      <Text variant="bodySmall" color="secondary">
        Fallback fill on web; liquid glass on iOS 26.
      </Text>
    </View>
  ),
};

export const Sheet: Story = {
  render: () => (
    <View
      style={{
        height: 200,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#8a6a4a',
        justifyContent: 'flex-end',
        padding: 20,
      }}
    >
      <SheetGlass radius={24} />
      <Text variant="heading3">Sheet glass</Text>
      <Text variant="bodySmall" color="secondary">
        Top corners only, for bottom sheets.
      </Text>
    </View>
  ),
};
