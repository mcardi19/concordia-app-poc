import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderHeightContext } from '@react-navigation/elements';
import { ThemeProvider } from '@/design-system/theme';
import { EditProfileDrawer } from '@/components/feature/me';
import { SettingsScreen } from '../SettingsScreen';
import { NotificationsScreen } from '../NotificationsScreen';
import { NotificationDetailScreen } from '../NotificationDetailScreen';
import type { StudentProfile } from '@/types/profile';

/** Fixed metrics — nothing here depends on a real device's insets. */
const METRICS = {
  frame: { x: 0, y: 0, width: 402, height: 874 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

/**
 * Notifications runs under a transparent header and sizes its curtain from
 * the real header height, so the context has to be present — `useHeaderHeight`
 * throws without a navigator otherwise.
 */
const HEADER_HEIGHT = 96;

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <HeaderHeightContext.Provider value={HEADER_HEIGHT}>
        <ThemeProvider>{children}</ThemeProvider>
      </HeaderHeightContext.Provider>
    </SafeAreaProvider>
  );
}

/** Enough of the navigation prop for these screens; the rest is unused. */
function nav(overrides: Record<string, unknown> = {}) {
  return {
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const PROFILE: StudentProfile = {
  displayName: 'Maya R. Okonkwo',
  program: 'B.A. English',
  studentId: '40187 2231',
  yearLabel: 'Year 3',
  advisor: 'Prof. Imogen Ashwell',
  academicYear: '2025–26',
};

describe('SettingsScreen (S6)', () => {
  it('renders the grouped preference rows', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<SettingsScreen navigation={nav()} route={{} as any} />, { wrapper: Wrapper });

    expect(screen.getByText('Preferences')).toBeTruthy();
    expect(screen.getByText('Account & data')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Sign out')).toBeTruthy();
  });

  it('opens Appearance from its row', () => {
    const navigation = nav();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<SettingsScreen navigation={navigation} route={{} as any} />, { wrapper: Wrapper });

    fireEvent.press(screen.getByLabelText('Appearance, System'));
    expect(navigation.navigate).toHaveBeenCalledWith('Appearance');
  });
});

describe('NotificationsScreen (05a)', () => {
  it('groups the inbox by recency', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<NotificationsScreen navigation={nav()} route={{} as any} />, { wrapper: Wrapper });

    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Payment plan reminder')).toBeTruthy();
  });

  it('opens a notification, marking it read on the way', () => {
    const navigation = nav();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<NotificationsScreen navigation={navigation} route={{} as any} />, { wrapper: Wrapper });

    fireEvent.press(screen.getByText('Payment plan reminder'));

    expect(navigation.navigate).toHaveBeenCalledWith('NotificationDetail', { id: 'fees' });

    // It was one of the two unread; opening it leaves one.
    expect(screen.getByLabelText('Unread, 1')).toBeTruthy();
  });

  it('narrows to unread when that chip is chosen', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<NotificationsScreen navigation={nav()} route={{} as any} />, { wrapper: Wrapper });

    // Seeded read: only the two unread items survive the filter.
    fireEvent.press(screen.getByLabelText('Unread, 2'));

    expect(screen.getByText('Payment plan reminder')).toBeTruthy();
    expect(screen.queryByText('Grade posted — HIST 210')).toBeNull();
  });
});

describe('NotificationDetailScreen', () => {
  const routeFor = (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ params: { id }, key: 'k', name: 'NotificationDetail' }) as any;

  it('shows the notification it was opened with', () => {
    render(<NotificationDetailScreen navigation={nav()} route={routeFor('fees')} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Payment plan reminder')).toBeTruthy();
    expect(screen.getByText('Money')).toBeTruthy();
    expect(screen.getByText('Today · 11:24 AM')).toBeTruthy();
    expect(screen.getByLabelText('Set up plan')).toBeTruthy();
  });

  it('omits the action on a notification that has none', () => {
    render(<NotificationDetailScreen navigation={nav()} route={routeFor('shuttle')} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Shuttle delayed')).toBeTruthy();
    expect(screen.queryByLabelText('Set up plan')).toBeNull();
  });

  it('degrades to a message when the id is not in the feed', () => {
    render(<NotificationDetailScreen navigation={nav()} route={routeFor('nope')} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Notification unavailable')).toBeTruthy();
  });
});

describe('EditProfileDrawer (05r)', () => {
  it('renders nothing until it is opened', () => {
    render(<EditProfileDrawer visible={false} profile={PROFILE} onClose={jest.fn()} />, {
      wrapper: Wrapper,
    });
    expect(screen.queryByText('Edit profile')).toBeNull();
  });

  it('shows the fields, and locks the registrar-owned name', () => {
    render(<EditProfileDrawer visible profile={PROFILE} onClose={jest.fn()} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Edit profile')).toBeTruthy();
    expect(screen.getByText('Legal name')).toBeTruthy();
    expect(screen.getByText('Maya R. Okonkwo')).toBeTruthy();
    // Locked fields are text, not inputs — so there is no input for it.
    expect(screen.queryByLabelText('Legal name')).toBeNull();
    expect(screen.getByLabelText('Preferred name')).toBeTruthy();
  });

  it('saves the edited values and closes', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    render(
      <EditProfileDrawer visible profile={PROFILE} onClose={onClose} onSave={onSave} />,
      { wrapper: Wrapper },
    );

    fireEvent.changeText(screen.getByLabelText('Pronouns'), 'they/them');
    fireEvent.press(screen.getByLabelText('Save profile'));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ pronouns: 'they/them' }));
    expect(onClose).toHaveBeenCalled();
  });
});
