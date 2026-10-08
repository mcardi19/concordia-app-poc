import type { Meta, StoryObj } from '@storybook/react-native';
import { StudentIdCard } from './StudentIdCard';

const meta = {
  title: 'Me/Student ID Card',
  component: StudentIdCard,
  args: {
    profile: {
      displayName: 'Alex Rivera',
      program: 'BCompSc, Computer Science',
      studentId: '40123456',
      yearLabel: 'Year 2',
      advisor: 'Dr. Chen',
      academicYear: '2025–26',
    },
  },
} satisfies Meta<typeof StudentIdCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
