import { describe, expect, it } from 'vitest';
import { formatDay, formatDuration, formatMonthYear, formatPeriod } from './format';

describe('timeline format', () => {
  it('formats month + year, capitalized, and keeps year-only dates as is', () => {
    expect(formatMonthYear('2026-08-29', 'fr')).toBe('Août 2026');
    expect(formatMonthYear('2024-10', 'en')).toBe('October 2024');
    expect(formatMonthYear('2017', 'fr')).toBe('2017');
  });

  it('formats a full day in UTC', () => {
    expect(formatDay('2026-10-08T23:30:00Z', 'en')).toBe('October 8, 2026');
  });

  it('formats a period, ongoing or closed', () => {
    expect(formatPeriod('2024-10', undefined, 'en', 'Present')).toBe('Oct 2024 → Present');
    expect(formatPeriod('2017', '2020', 'fr', "Aujourd'hui")).toBe('2017 → 2020');
  });

  it('rounds durations to whole years, months only under a year', () => {
    expect(formatDuration('2023-01', '2024-10', 'fr')).toBe('2 ans');
    expect(formatDuration('2020-09', '2021-12', 'fr')).toBe('1 an');
    expect(formatDuration('2018-09', '2019-02', 'fr')).toBe('5 mois');
    expect(formatDuration('2020-01', '2020-07', 'en')).toBe('6 mos');
    expect(formatDuration('2017', '2020', 'fr')).toBe('3 ans');
    expect(formatDuration('2024-10', undefined, 'en', new Date('2026-10-12'))).toBe('2 yrs');
  });

  it('never shows an empty duration', () => {
    expect(formatDuration('2026-10', '2026-10', 'en')).toBe('1 mo');
  });
});
