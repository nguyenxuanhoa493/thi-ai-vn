import type { ExamDef } from '@/lib/bank/exams';
import { checkAnswer } from '@/lib/bank/check';
import { LEVELS, type AnswerValue, type Level, type Question } from '@/lib/bank/types';

export interface ExamAttempt {
  examId: string; startedAt: number; durationSec: number;
  answers: Record<string, AnswerValue>; flagged: string[]; violations: number; submittedAt?: number;
}
export type NavState = 'answered' | 'unanswered' | 'flagged';

export const startAttempt = (exam: ExamDef, now: number): ExamAttempt =>
  ({ examId: exam.id, startedAt: now, durationSec: exam.durationMin * 60, answers: {}, flagged: [], violations: 0 });

export const remainingSec = (a: ExamAttempt, now: number) =>
  Math.max(0, Math.ceil((a.startedAt + a.durationSec * 1000 - now) / 1000));
export const isExpired = (a: ExamAttempt, now: number) => remainingSec(a, now) === 0;

export const setAnswer = (a: ExamAttempt, qid: string, v: AnswerValue): ExamAttempt =>
  ({ ...a, answers: { ...a.answers, [qid]: v } });
export const toggleFlag = (a: ExamAttempt, qid: string): ExamAttempt =>
  ({ ...a, flagged: a.flagged.includes(qid) ? a.flagged.filter((x) => x !== qid) : [...a.flagged, qid] });
export const addViolation = (a: ExamAttempt): ExamAttempt => ({ ...a, violations: a.violations + 1 });

export function isAnswered(v: AnswerValue | undefined): boolean {
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v)) return v.length > 0 && v.some((x) => x !== null && x !== '' && x !== -1);
  return true;
}

export function navStatus(a: ExamAttempt, qids: string[]): Record<string, NavState> {
  return Object.fromEntries(qids.map((id) => [
    id, a.flagged.includes(id) ? 'flagged' : isAnswered(a.answers[id]) ? 'answered' : 'unanswered',
  ]));
}

export interface ExamResult {
  examId: string; score10: number; correct: number; total: number;
  byLevel: Record<Level, { correct: number; total: number }>;
  perQuestion: { questionId: string; fraction: number; correct: boolean }[];
  violations: number; durationUsedSec: number; submittedAt: number;
}

export function gradeAttempt(questions: Question[], a: ExamAttempt, now: number): ExamResult {
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, { correct: 0, total: 0 }])) as ExamResult['byLevel'];
  const perQuestion = questions.map((q) => {
    const r = checkAnswer(q, a.answers[q.id] ?? null);
    byLevel[q.level].total += 1;
    if (r.correct) byLevel[q.level].correct += 1;
    return { questionId: q.id, fraction: r.fraction, correct: r.correct };
  });
  const sum = perQuestion.reduce((s, p) => s + p.fraction, 0);
  return {
    examId: a.examId,
    score10: questions.length ? Math.round((sum / questions.length) * 1000) / 100 : 0,
    correct: perQuestion.filter((p) => p.correct).length,
    total: questions.length, byLevel, perQuestion, violations: a.violations,
    durationUsedSec: Math.min(a.durationSec, Math.round((now - a.startedAt) / 1000)),
    submittedAt: now,
  };
}

export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
