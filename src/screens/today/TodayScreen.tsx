import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { MaterialSymbol, msPerson, msWbSunny } from '@/components/icons';
import { Screen, Text, Button } from '@/components/design-system';
import { useCardSurface, useTheme } from '@/design-system/theme';
import { useAuthStore } from '@/state/authStore';
import { todayTheme } from './todayTheme';

function formatHeaderDate(date = new Date()): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()} · ${date.getFullYear()}`;
}

function getGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function firstName(fullName?: string | null): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0] ?? fullName;
}

type BriefingItem = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  left?: { type: 'thumb'; label: string } | { type: 'balance'; amount: string; label: string };
};

const BRIEFING: BriefingItem[] = [
  {
    id: '1',
    tag: 'Campus',
    title: 'Spring Convocation tickets open at 5 p.m.',
    subtitle: '2 tickets per graduate · Until May 3',
    left: { type: 'thumb', label: 'QUAD' },
  },
  {
    id: '2',
    tag: 'Balance',
    title: 'Dining dollars remaining this term.',
    subtitle: '~$6.80/day avg · Top up in Wallet',
    left: { type: 'balance', amount: '$184', label: 'MEAL PLAN' },
  },
  {
    id: '3',
    tag: 'Due tomorrow',
    title: '"The Waves" by Virginia Woolf — renew?',
    subtitle: 'Bellamy Library · Hold queue: 0',
    left: { type: 'thumb', label: 'LIBRARY' },
  },
  {
    id: '4',
    tag: 'TONIGHT · 7:30',
    title: 'Chamber Ensemble: Shostakovich & Pärt',
    subtitle: 'Redpath Hall · Free for students',
    left: { type: 'thumb', label: 'EVENT' },
  },
];

function BriefingRow({ item }: { item: BriefingItem }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.borderSubtle,
      }}
    >
      {item.left?.type === 'balance' ? (
        <View style={{ width: 88, marginRight: theme.spacing.md, justifyContent: 'center' }}>
          <Text variant="heading3" color="brand" style={{ fontSize: 28, lineHeight: 32 }}>
            {item.left.amount}
          </Text>
          <Text variant="caption" color="brand" style={{ letterSpacing: 1 }}>
            {item.left.label}
          </Text>
        </View>
      ) : item.left?.type === 'thumb' ? (
        <View
          style={{
            width: 72,
            height: 72,
            marginRight: theme.spacing.md,
            backgroundColor: todayTheme.accentMuted,
            borderRadius: theme.radius.sm,
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: 6,
          }}
        >
          <Text variant="caption" color="brand" style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            {item.left.label}
          </Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          style={{ color: todayTheme.labelCaps, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 }}
        >
          {item.tag}
        </Text>
        <Text variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>
          {item.title}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );
}

export function TodayScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const name = firstName(user?.name);
  const classCardStyle = useCardSurface('low', {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
  });
  const briefingCardStyle = useCardSurface('none', {
    paddingHorizontal: theme.spacing.md,
  });

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
          }}
        >
          <View>
            <Text
              variant="caption"
              style={{ color: todayTheme.labelCaps, letterSpacing: 1.2, marginBottom: 6 }}
            >
              {formatHeaderDate()}
            </Text>
            <Text
              variant="heading1"
              color="brand"
              style={{ fontSize: 36, lineHeight: 40, fontWeight: '700' }}
            >
              Concordia.
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: todayTheme.accentMuted,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
              accessibilityLabel="Appearance"
            >
              <MaterialSymbol icon={msWbSunny} size={20} color={theme.color.primary} />
            </Pressable>
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: todayTheme.accentMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Profile"
            >
              <MaterialSymbol icon={msPerson} size={20} color={theme.color.primary} />
            </Pressable>
          </View>
        </View>

        <Text variant="caption" color="secondary" style={{ letterSpacing: 1, marginBottom: 8 }}>
          {getGreeting()}
        </Text>
        <Text variant="heading2" style={{ fontSize: 26, lineHeight: 34, marginBottom: theme.spacing.lg }}>
          {name} — your next class starts in{' '}
          <Text variant="heading2" color="brand" style={{ fontStyle: 'italic', fontSize: 26 }}>
            42 minutes
          </Text>
          .
        </Text>

        <View style={classCardStyle}>
          <View
            style={{
              paddingRight: theme.spacing.md,
              marginRight: theme.spacing.md,
              borderRightWidth: 1,
              borderRightColor: theme.color.borderSubtle,
              minWidth: 72,
            }}
          >
            <Text variant="heading2" color="brand" style={{ fontSize: 28, lineHeight: 32 }}>
              2:30
            </Text>
            <Text variant="caption" color="secondary">
              PM
            </Text>
            <Text variant="caption" color="secondary" style={{ fontStyle: 'italic', marginTop: 8 }}>
              3:45
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="secondary" style={{ letterSpacing: 0.5, marginBottom: 4 }}>
              ENGL 342 · LECTURE
            </Text>
            <Text variant="heading3" style={{ marginBottom: 6 }}>
              The Modernist Novel
            </Text>
            <Text variant="bodySmall" color="secondary">
              Prof. Imogen Ashwell
            </Text>
            <Text variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.md }}>
              Whitfield Hall, Room 204
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button style={{ marginRight: theme.spacing.sm }}>Walk · 7 min</Button>
              <Button variant="secondary">Notes</Button>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text variant="heading3" style={{ fontSize: 22 }}>
            Today&apos;s Briefing
          </Text>
          <Text variant="caption" color="secondary" style={{ letterSpacing: 0.8 }}>
            Four items
          </Text>
        </View>

        <View style={briefingCardStyle}>
          {BRIEFING.map((item) => (
            <BriefingRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
