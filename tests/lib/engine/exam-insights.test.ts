import { describe, it, expect } from 'vitest';
import { examInsights } from '@/lib/engine/exam-insights';
import type { ExamResult } from '@/lib/engine/exam';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, b: 0, content: '', explanation: '', hints: [], source: 'NXB' } as const;
const mcq = { type: 'mcq' as const, options: ['a', 'b'], answer: 0 };
const qs: Question[] = [
  { ...base, ...mcq, id: 'q1', level: 'NB', skillId: 'a' },
  { ...base, ...mcq, id: 'q2', level: 'TH', skillId: 'a' },
  { ...base, ...mcq, id: 'q3', level: 'VD', skillId: 'b' },
  { ...base, ...mcq, id: 'q4', level: 'VDC', skillId: 'b' },
];
const result = (fr: number[], extra: Partial<ExamResult> = {}): ExamResult => ({
  examId: 'e', score10: (fr.reduce((s, f) => s + f, 0) / fr.length) * 10, correct: fr.filter((f) => f === 1).length, total: fr.length,
  byLevel: {
    NB: { correct: fr[0] === 1 ? 1 : 0, total: 1 }, TH: { correct: fr[1] === 1 ? 1 : 0, total: 1 },
    VD: { correct: fr[2] === 1 ? 1 : 0, total: 1 }, VDC: { correct: fr[3] === 1 ? 1 : 0, total: 1 },
  },
  perQuestion: qs.map((q, i) => ({ questionId: q.id, fraction: fr[i], correct: fr[i] === 1 })),
  violations: 0, durationUsedSec: 600, submittedAt: 0, ...extra,
});
const name = (id: string) => `KT ${id}`;

describe('examInsights', () => {
  it('counts outcomes and ranks skills', () => {
    const ins = examInsights(result([1, 1, 0.5, 0]), qs, 15, name);
    expect(ins.outcome).toEqual({ correct: 2, partial: 1, wrong: 1 });
    expect(ins.bySkill.map((s) => [s.skillId, s.correct, s.total])).toEqual([['a', 2, 2], ['b', 0, 2]]);
  });
  it('names strengths, weak skills and the theory-vs-application gap', () => {
    const ins = examInsights(result([1, 1, 0, 0]), qs, 15, name);
    expect(ins.notes).toContain('Điểm mạnh: KT a.');
    expect(ins.notes.some((n) => n.startsWith('Nên ôn lại: KT b.'))).toBe(true);
    expect(ins.notes.some((n) => n.includes('vận dụng còn lúng túng'))).toBe(true);
  });
  it('mentions violations and rushing; headline scales with score', () => {
    const ins = examInsights(result([0, 0, 0, 0], { violations: 2, durationUsedSec: 60 }), qs, 15, name);
    expect(ins.headline).toMatch(/còn khá mới/);
    expect(ins.notes.some((n) => n.includes('2 lần rời màn hình'))).toBe(true);
    expect(ins.notes.some((n) => n.includes('làm bài khá nhanh'))).toBe(true);
    expect(examInsights(result([1, 1, 1, 1]), qs, 15, name).headline).toMatch(/rất tốt/);
  });
});
