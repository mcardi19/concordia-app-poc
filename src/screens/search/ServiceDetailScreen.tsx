import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/design-system';
import {
  MaterialSymbol,
  msArrowBackSemibold,
  msChevronRight,
  msNorthEast,
} from '@/components/icons';
import { SearchSurface } from '@/components/feature/search';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useNow } from '@/hooks';
import { findCampusService } from '@/data/campusServiceRecords';
import {
  formatServicePhone,
  formatServiceTime,
  serviceStatus,
} from '@/services/campus/serviceStatus';
import { HEADER_ICON_SIZE } from '@/navigation/HeaderIconButton';
import type { SearchScreenProps } from '@/navigation/types';
import type { CampusService, ServiceAction } from '@/types/services';
import { searchTheme } from './searchTheme';

type Props = SearchScreenProps<'ServiceDetail'>;

const HERO_HEIGHT = 260;
const DAY_NAME = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * One campus service, opened from search or the category browse.
 *
 * Every service renders through this screen, so the answer to "where is it,
 * is it open, how do I reach it" sits in the same place each time. What
 * varies between services is the Details rows and the actions, both of which
 * the record carries.
 *
 * The masthead is a brand gradient rather than a photo: the design's hero is
 * the canvas placeholder texture, and there is no service photography in the
 * app. `heroImage` can be added to a record later without touching this.
 */
export function ServiceDetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow();

  const service = useMemo(
    () => findCampusService(route.params.serviceId),
    [route.params.serviceId],
  );

  if (!service) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
        <Text variant="bodySmall" style={styles.missing}>
          That service is no longer listed.
        </Text>
      </View>
    );
  }

  const status = serviceStatus(service, now);
  const phone = formatServicePhone(service);

  const open = (action: ServiceAction) => {
    switch (action.kind) {
      case 'call':
        if (service.contact.phone) {
          // Extensions cannot be dialled reliably from a tel: URL, so the
          // number goes through on its own and the extension stays on screen.
          Linking.openURL(`tel:${service.contact.phone.replace(/[^0-9+]/g, '')}`);
        }
        return;
      case 'email':
        if (service.contact.email) Linking.openURL(`mailto:${service.contact.email}`);
        return;
      case 'directions':
        if (service.location.buildingCode) {
          navigation.getParent()?.navigate('Campus', {
            screen: 'CampusHome',
            params: { buildingCode: service.location.buildingCode },
          });
        }
        return;
      default:
        Linking.openURL(action.url ?? service.contact.url);
    }
  };

  const primary = service.actions.find((a) => a.primary);
  const secondary = service.actions.filter((a) => !a.primary && a.kind !== 'link');

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={[theme.color.primary, '#5E1626']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroText, { paddingTop: insets.top + 64 }]}>
            <Text variant="caption" style={styles.eyebrow}>
              {service.categoryLabel}
            </Text>
            <Text variant="heading2" style={styles.heroTitle}>
              {service.name}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={[styles.back, { top: insets.top + 8 }]}
        >
          <SearchSurface style={styles.backSurface} radius={20}>
            <MaterialSymbol icon={msArrowBackSemibold} size={HEADER_ICON_SIZE} color={theme.color.primary} />
          </SearchSurface>
        </Pressable>

        <View style={styles.body}>
          {service.description ? (
            <Text variant="body" style={styles.description}>
              {service.description}
            </Text>
          ) : null}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    status.tone === 'positive'
                      ? searchTheme.statusOpen
                      : searchTheme.statusNeutral,
                },
              ]}
            />
            <Text variant="bodySmall" style={styles.statusLabel}>
              {status.label}
            </Text>
          </View>

          {service.urgentNote ? (
            <View style={styles.urgent}>
              <Text variant="bodySmall" style={styles.urgentText}>
                {service.urgentNote}
              </Text>
            </View>
          ) : null}

          {primary ? (
            <Pressable
              onPress={() => open(primary)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryAction,
                { backgroundColor: theme.color.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text variant="bodySmall" style={styles.primaryLabel}>
                {primary.label}
              </Text>
              <MaterialSymbol
                icon={msChevronRight}
                size={22}
                color={theme.color.text.inverse}
              />
            </Pressable>
          ) : null}

          {secondary.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => open(action)}
              accessibilityRole="button"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <SearchSurface style={styles.secondaryAction} radius={12}>
                <Text variant="bodySmall" style={styles.secondaryLabel}>
                  {action.label}
                </Text>
                <MaterialSymbol
                  icon={msChevronRight}
                  size={20}
                  color={searchTheme.chevron}
                />
              </SearchSurface>
            </Pressable>
          ))}

          <Text variant="caption" style={styles.sectionLabel}>
            Details
          </Text>

          <SearchSurface style={styles.detailCard}>
            <DetailRow label="Location" value={locationLine(service)} first />
            <DetailRow label="Hours" value={hoursLine(service)} />
            {service.details.map((detail) => (
              <DetailRow
                key={detail.label}
                label={detail.label}
                value={detail.value}
              />
            ))}
            {phone ? <DetailRow label="Phone" value={phone} /> : null}
          </SearchSurface>

          <Pressable
            onPress={() => Linking.openURL(service.contact.url)}
            accessibilityRole="button"
            accessibilityLabel={`Visit website, ${hostPath(service.contact.url)}`}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <SearchSurface style={styles.websiteCard} radius={12}>
              <View style={styles.websiteText}>
                <Text variant="bodySmall" style={styles.websiteTitle}>
                  Visit website
                </Text>
                <Text variant="caption" numberOfLines={1} style={styles.websiteUrl}>
                  {hostPath(service.contact.url)}
                </Text>
              </View>
              <MaterialSymbol icon={msNorthEast} size={18} color={searchTheme.chevron} />
            </SearchSurface>
          </Pressable>

          {service.provenance !== 'verified' ? (
            <Text variant="caption" style={styles.provenance}>
              Details for this service have not been confirmed yet — check the
              website before you go.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  first,
}: {
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.detailRow, first ? null : styles.detailDivider]}>
      <Text variant="bodySmall" style={styles.detailLabel}>
        {label}
      </Text>
      <Text variant="bodySmall" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/** "GM Building, room GM-200" — or the note when there is no room to go to. */
function locationLine(service: CampusService): string {
  const { room, buildingCode, note } = service.location;
  if (room && buildingCode) return `${buildingCode} Building, room ${room}`;
  if (room) return room;
  return note ?? (service.location.campus === 'sgw' ? 'SGW campus' : 'Loyola campus');
}

/**
 * Collapses the opening rules into one line.
 *
 * Says "from 9 AM" rather than a range when no closing time is published —
 * the campus site often gives only an opening time, and the record models
 * that rather than filling in a plausible close.
 */
function hoursLine(service: CampusService): string {
  if (service.access === 'emergency') return 'Answered 24/7';
  if (service.hours.length === 0) return 'No published hours';

  return service.hours
    .map((rule) => {
      const days = summariseDays(rule.days);
      const open = formatServiceTime(rule.opensMinutes);
      return rule.closesMinutes == null
        ? `${days} from ${open}`
        : `${days} ${open} – ${formatServiceTime(rule.closesMinutes)}`;
    })
    .join(' · ');
}

/** "Mon–Fri" for a run, otherwise the days listed. */
function summariseDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  const isRun = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (isRun && sorted.length > 2) {
    return `${DAY_NAME[sorted[0]]}–${DAY_NAME[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DAY_NAME[d]).join(', ');
}

/** "concordia.ca/health/medical/clinic" — no scheme, no .html. */
function hostPath(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: searchTheme.pageBackground,
  },
  hero: {
    height: HERO_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroText: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 22,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#FFFFFF',
  },
  back: {
    position: 'absolute',
    left: semanticSpacing.screenHorizontal,
  },
  backSurface: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 20,
    gap: 12,
  },
  description: {
    fontSize: 15.5,
    lineHeight: 23,
    color: searchTheme.bodyText,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 2,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  urgent: {
    borderRadius: 10,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(145, 34, 56, 0.06)',
  },
  urgentText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: searchTheme.bodyText,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 4,
  },
  primaryLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  secondaryLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  sectionLabel: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: searchTheme.eyebrowText,
    marginTop: 14,
  },
  detailCard: {
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 13,
  },
  detailDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: searchTheme.rowDivider,
  },
  detailLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: searchTheme.metaText,
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: searchTheme.headingText,
    textAlign: 'right',
  },
  websiteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  websiteText: {
    flex: 1,
    minWidth: 0,
  },
  websiteTitle: {
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  websiteUrl: {
    fontSize: 13,
    lineHeight: 17,
    color: searchTheme.metaText,
    marginTop: 1,
  },
  provenance: {
    fontSize: 12.5,
    lineHeight: 18,
    color: searchTheme.metaText,
    marginTop: 6,
  },
  missing: {
    padding: semanticSpacing.screenHorizontal,
    color: searchTheme.metaText,
  },
});
