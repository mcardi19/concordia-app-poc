import type { CampusService, ServiceStatus } from '@/types/services';

/** "9:00 AM" / "4:30 PM" from minutes past midnight. */
export function formatServiceTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * What to show next to a service right now.
 *
 * Deliberately conservative. A service with no published hours reports
 * `unknown` and describes how to reach it instead of guessing — the campus
 * site frequently gives an opening time and no closing time, and a confident
 * "until 5 PM" invented from nothing sends someone to a locked door.
 */
export function serviceStatus(service: CampusService, now: Date): ServiceStatus {
  if (service.access === 'emergency') {
    return { kind: 'always', label: '24/7', tone: 'positive' };
  }

  if (service.hours.length === 0) {
    return { kind: 'unknown', label: ACCESS_LABEL[service.access], tone: 'neutral' };
  }

  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = service.hours.filter((h) => h.days.includes(day));

  for (const rule of today) {
    if (minutes < rule.opensMinutes) continue;
    // No published close: open-ended rather than assumed shut.
    if (rule.closesMinutes == null) {
      return {
        kind: 'open',
        label: rule.note ? `Open · ${rule.note}` : 'Open',
        tone: 'positive',
      };
    }
    if (minutes < rule.closesMinutes) {
      return {
        kind: 'open',
        label: `Open · until ${formatServiceTime(rule.closesMinutes)}`,
        tone: 'positive',
      };
    }
  }

  const later = today.find((rule) => minutes < rule.opensMinutes);
  if (later) {
    return {
      kind: 'closed',
      label: `Opens ${formatServiceTime(later.opensMinutes)}`,
      tone: 'neutral',
    };
  }

  return {
    kind: 'closed',
    label: today.length > 0 ? 'Closed now' : 'Closed today',
    tone: 'neutral',
  };
}

const ACCESS_LABEL: Record<CampusService['access'], string> = {
  'drop-in': 'Drop-in',
  appointment: 'By appointment',
  both: 'Drop-in or appointment',
  online: 'Online',
  phone: 'By phone',
  emergency: '24/7',
};

/** "514-848-2424, ext. 3565" — the way the site writes it. */
export function formatServicePhone(service: CampusService): string | undefined {
  const { phone, extension } = service.contact;
  if (!phone) return undefined;
  return extension ? `${phone}, ext. ${extension}` : phone;
}
