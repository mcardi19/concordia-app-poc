import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/design-system/theme';
import { Button } from '@/components/design-system/Button';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('Button', () => {
  it('renders label text', () => {
    render(<Button>Submit</Button>, { wrapper: Wrapper });
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('has accessibility role button', () => {
    render(<Button>Submit</Button>, { wrapper: Wrapper });
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('uses custom accessibilityLabel when provided', () => {
    render(<Button accessibilityLabel="Send form">Submit</Button>, { wrapper: Wrapper });
    expect(screen.getByLabelText('Send form')).toBeTruthy();
  });
});
