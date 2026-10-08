import type { Meta, StoryObj } from '@storybook/react-native';
import { LIBRARY_LOANS } from './libraryData';
import { LibraryLoanRow } from './LibraryLoanRow';

const meta = {
  title: 'Library/Loan Row',
  component: LibraryLoanRow,
  args: {
    loan: LIBRARY_LOANS[0],
    onRenew: () => undefined,
  },
} satisfies Meta<typeof LibraryLoanRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DueSoon: Story = {};

export const DueLater: Story = {
  args: { loan: LIBRARY_LOANS[1] },
};
