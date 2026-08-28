import { CAMPUS_SERVICE_RECORDS, findCampusService } from '@/data/campusServiceRecords';
import { formatServiceTime, serviceStatus } from './serviceStatus';
import type { CampusService } from '@/types/services';

/** Wednesday 2026-08-26 at the given hour, local time. */
const wednesdayAt = (hour: number, minute = 0) =>
  new Date(2026, 7, 26, hour, minute);

const clinic = findCampusService('health-clinic') as CampusService;
const counselling = findCampusService('counselling-psychology') as CampusService;
const safety = findCampusService('campus-safety') as CampusService;
const residences = findCampusService('student-residences') as CampusService;

describe('serviceStatus', () => {
  it('reports a closing time when the service publishes one', () => {
    expect(serviceStatus(counselling, wednesdayAt(10))).toEqual({
      kind: 'open',
      label: 'Open · until 5 PM',
      tone: 'positive',
    });
  });

  it('stays open-ended when only an opening time is published', () => {
    // The clinic says walk-ins begin at 9 with no stated close; inventing one
    // would send someone to a locked door.
    const status = serviceStatus(clinic, wednesdayAt(15));
    expect(status.kind).toBe('open');
    expect(status.label).toBe('Open · walk-ins from 9 AM');
    expect(status.label).not.toMatch(/until/);
  });

  it('counts down to opening rather than saying closed', () => {
    expect(serviceStatus(counselling, wednesdayAt(7, 30))).toEqual({
      kind: 'closed',
      label: 'Opens 9 AM',
      tone: 'neutral',
    });
  });

  it('closes after the published close', () => {
    expect(serviceStatus(counselling, wednesdayAt(18)).kind).toBe('closed');
  });

  it('says closed today when no rule covers the day', () => {
    // Sunday.
    expect(serviceStatus(counselling, new Date(2026, 7, 30, 12)).label).toBe(
      'Closed today',
    );
  });

  it('treats emergency services as always available', () => {
    expect(serviceStatus(safety, new Date(2026, 7, 30, 3)).kind).toBe('always');
  });

  it('describes access when there are no hours at all', () => {
    expect(serviceStatus(residences, wednesdayAt(12))).toEqual({
      kind: 'unknown',
      label: 'Online',
      tone: 'neutral',
    });
  });
});

describe('formatServiceTime', () => {
  it.each([
    [9 * 60, '9 AM'],
    [12 * 60, '12 PM'],
    [16 * 60 + 30, '4:30 PM'],
    [0, '12 AM'],
  ])('formats %i as %s', (minutes, expected) => {
    expect(formatServiceTime(minutes)).toBe(expected);
  });
});

describe('the seed records', () => {
  it('give every service a source page and a unique id', () => {
    const ids = CAMPUS_SERVICE_RECORDS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const service of CAMPUS_SERVICE_RECORDS) {
      expect(service.contact.url).toMatch(/^https:\/\/www\.concordia\.ca\//);
    }
  });

  it('dates every record a person claims to have verified', () => {
    for (const service of CAMPUS_SERVICE_RECORDS) {
      if (service.provenance === 'verified') {
        expect(service.lastVerified).toBeDefined();
      }
    }
  });
});
