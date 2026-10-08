import type { Meta, StoryObj } from '@storybook/react-native';
import { Image, View } from 'react-native';
import { sessionHeroImage } from '@/components/feature/today/todayData';
import { ProgressiveImageTreatment } from './ProgressiveImageTreatment';

const meta = {
  title: 'Design System/Progressive Image Treatment',
  component: ProgressiveImageTreatment,
} satisfies Meta<typeof ProgressiveImageTreatment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnPhoto: Story = {
  args: {
    source: sessionHeroImage,
    overlayOpacity: 1,
  },
  render: (args) => (
    <View style={{ height: 320, overflow: 'hidden', borderRadius: 24 }}>
      <Image source={sessionHeroImage} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      <ProgressiveImageTreatment {...args} />
    </View>
  ),
};
