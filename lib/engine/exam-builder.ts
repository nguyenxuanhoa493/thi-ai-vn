import { LEVELS, type Level, type Question } from '@/lib/bank/types';

export type Matrix = Record<Level, number>;

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildExam(pool: Question[], matrix: Matrix, rand: () => number = Math.random) {
  const questions: Question[] = [];
  const shortfall = { NB: 0, TH: 0, VD: 0, VDC: 0 } as Record<Level, number>;
  for (const level of LEVELS) {
    const want = Math.max(0, matrix[level]);
    const taken = shuffle(pool.filter((q) => q.level === level), rand).slice(0, want);
    questions.push(...taken);
    shortfall[level] = want - taken.length;
  }
  return { questions, shortfall };
}
