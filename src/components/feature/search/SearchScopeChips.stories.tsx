import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { SearchScopeChips, type SearchScope } from './SearchScopeChips';

const SCOPES = [
  { scope: null, label: 'All', count: 48 },
  { scope: 'service' as const, label: 'Services', count: 22 },
  { scope: 'building' as const, label: 'Places', count: 14 },
  { scope: 'course' as const, label: 'Courses', count: 9 },
];

const meta = {
  title: 'Search/Scope Chips',
  component: SearchScopeChips,
} satisfies Meta<typeof SearchScopeChips>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    scopes: SCOPES,
    active: null,
    onSelect: () => undefined,
  },
  render: function InteractiveChips() {
    const [active, setActive] = useState<SearchScope>(null);
    return <SearchScopeChips scopes={SCOPES} active={active} onSelect={setActive} />;
  },
};
