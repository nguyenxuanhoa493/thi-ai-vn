import { describe, it, expect } from 'vitest';
import { xpFor, updateStreak, toDateKey, dayDiff, BADGES } from '@/lib/engine/gamification';

describe('gamification', () => {
  it('xpFor', () => {
    expect(xpFor('NB', false, 3)).toBe(0);
    expect(xpFor('NB', true, 0)).toBe(5);
    expect(xpFor('VDC', true, 2)).toBe(24);
    expect(xpFor('TH', true, 99)).toBe(20);
  });
  it('toDateKey uses local date', () => {
    expect(toDateKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
  });
  it('dayDiff', () => {
    expect(dayDiff('2026-10-15', '2026-10-16')).toBe(1);
    expect(dayDiff('2026-09-30', '2026-10-01')).toBe(1);
  });
  it('updateStreak', () => {
    const s = { count: 6, lastDate: '2026-10-15' };
    expect(updateStreak(s, '2026-10-15')).toBe(s);
    expect(updateStreak(s, '2026-10-16')).toEqual({ count: 7, lastDate: '2026-10-16' });
    expect(updateStreak(s, '2026-10-18')).toEqual({ count: 1, lastDate: '2026-10-18' });
  });
  it('badges defined', () => {
    expect(Object.keys(BADGES)).toEqual(['first-assessment', 'combo-5', 'zone-expand', 'first-exam']);
  });
});
