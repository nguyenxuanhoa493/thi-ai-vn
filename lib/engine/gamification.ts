import type { Level } from '@/lib/bank/types';

export const LEVEL_XP: Record<Level, number> = { NB: 5, TH: 10, VD: 15, VDC: 20 };

/** comboBefore = số câu đúng liên tiếp TRƯỚC câu này */
export function xpFor(level: Level, correct: boolean, comboBefore: number): number {
  return correct ? LEVEL_XP[level] + Math.min(comboBefore, 5) * 2 : 0;
}

export function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayDiff(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

export interface Streak { count: number; lastDate: string }
export function updateStreak(s: Streak, today: string): Streak {
  if (s.lastDate === today) return s;
  return dayDiff(s.lastDate, today) === 1 ? { count: s.count + 1, lastDate: today } : { count: 1, lastDate: today };
}

export const BADGES = {
  'first-assessment': { name: 'Lần đầu đánh giá', icon: '🎯' },
  'combo-5': { name: 'Combo 5', icon: '🔥' },
  'zone-expand': { name: 'Mở rộng vùng', icon: '🌱' },
  'first-exam': { name: 'Hoàn thành bài thi', icon: '📝' },
} as const;
export type BadgeId = keyof typeof BADGES;
