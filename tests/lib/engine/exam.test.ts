import { describe, it, expect } from 'vitest';
import {
  startAttempt, remainingSec, isExpired, setAnswer, toggleFlag, addViolation, isAnswered, navStatus, gradeAttempt, formatClock,
} from '@/lib/engine/exam';
import type { ExamDef } from '@/lib/bank/exams';
import type { Question } from '@/lib/bank/types';

const exam: ExamDef = { id: 'e', title: 'E', kind: '15p', subject: 'toan', grade: 9, durationMin: 15, questionIds: ['q1', 'q2', 'q3'], schedule: '' };
const base = { subject: 'toan', grade: 9, skillId: 's', b: 0, content: '', explanation: '', hints: [], source: 'NXB' } as const;
const qs: Question[] = [
  { ...base, id: 'q1', level: 'NB', type: 'mcq', options: ['a', 'b'], answer: 0 },
  { ...base, id: 'q2', level: 'TH', type: 'tf4', statements: ['1', '2', '3', '4'], answer: [true, true, true, true] },
  { ...base, id: 'q3', level: 'VD', type: 'short', answer: '2' },
];
const T0 = 1_000_000;

describe('exam', () => {
  it('timer is based on startedAt (survives reload)', () => {
    const a = startAttempt(exam, T0);
    expect(a.durationSec).toBe(900);
    expect(remainingSec(a, T0)).toBe(900);
    expect(remainingSec(a, T0 + 60_500)).toBe(840);
    const reloaded = JSON.parse(JSON.stringify(a));
    expect(remainingSec(reloaded, T0 + 60_500)).toBe(840);
  });
  it('expires and never goes negative', () => {
    const a = startAttempt(exam, T0);
    expect(isExpired(a, T0 + 899_000)).toBe(false);
    expect(isExpired(a, T0 + 900_000)).toBe(true);
    expect(remainingSec(a, T0 + 5_000_000)).toBe(0);
  });
  it('answers, flags, violations are immutable updates', () => {
    const a = startAttempt(exam, T0);
    const b = toggleFlag(setAnswer(a, 'q1', 0), 'q3');
    expect(a.answers).toEqual({});
    expect(b.answers.q1).toBe(0);
    expect(b.flagged).toEqual(['q3']);
    expect(toggleFlag(b, 'q3').flagged).toEqual([]);
    expect(addViolation(addViolation(b)).violations).toBe(2);
  });
  it('isAnswered', () => {
    expect(isAnswered(undefined as never)).toBe(false);
    expect(isAnswered(null)).toBe(false);
    expect(isAnswered('')).toBe(false);
    expect(isAnswered([])).toBe(false);
    expect(isAnswered([null, null, null, null])).toBe(false);
    expect(isAnswered([true, null, null, null])).toBe(true);
    expect(isAnswered(0)).toBe(true);
    expect(isAnswered({ x: 0, y: 0 })).toBe(true);
  });
  it('navStatus: flagged wins over answered', () => {
    let a = startAttempt(exam, T0);
    a = setAnswer(a, 'q1', 0);
    a = toggleFlag(setAnswer(a, 'q2', [true, null, null, null]), 'q2');
    expect(navStatus(a, exam.questionIds)).toEqual({ q1: 'answered', q2: 'flagged', q3: 'unanswered' });
  });
  it('grades with tf4 partial credit and level breakdown', () => {
    let a = startAttempt(exam, T0);
    a = setAnswer(a, 'q1', 0);
    a = setAnswer(a, 'q2', [true, true, true, false]);
    a = addViolation(a);
    const r = gradeAttempt(qs, a, T0 + 120_000);
    expect(r.correct).toBe(1);
    expect(r.total).toBe(3);
    expect(r.score10).toBeCloseTo(5);
    expect(r.byLevel.NB).toEqual({ correct: 1, total: 1 });
    expect(r.byLevel.VD).toEqual({ correct: 0, total: 1 });
    expect(r.violations).toBe(1);
    expect(r.durationUsedSec).toBe(120);
  });
  it('durationUsed capped at duration when submitted late', () => {
    const r = gradeAttempt(qs, startAttempt(exam, T0), T0 + 10_000_000);
    expect(r.durationUsedSec).toBe(900);
    expect(r.score10).toBe(0);
  });
  it('formatClock', () => {
    expect(formatClock(2700)).toBe('45:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(5400)).toBe('1:30:00');
    expect(formatClock(0)).toBe('00:00');
  });
});
