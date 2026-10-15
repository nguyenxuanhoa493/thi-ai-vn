import type { Grade, Question, QuestionType, Skill, Subject } from '@/lib/bank/types';
import { SUBJECT_LABEL } from '@/lib/bank/types';
import { estimateTheta, information, masteryLabel, thetaToScore, type MasteryLabel } from './irt';

export const ASSESSMENT_LENGTH = 12;
const ASSESSABLE = new Set<QuestionType>(['mcq', 'multi', 'tf4', 'short', 'fill', 'listen', 'match', 'order', 'graph']);

export interface AssessmentResponse { questionId: string; skillId: string; b: number; correct: boolean }
export interface AssessmentState { asked: string[]; responses: AssessmentResponse[] }
export const emptyAssessment = (): AssessmentState => ({ asked: [], responses: [] });
export const currentTheta = (s: AssessmentState) => estimateTheta(s.responses).theta;

export function nextAssessmentQuestion(
  pool: Question[], skills: Skill[], state: AssessmentState, length = ASSESSMENT_LENGTH,
): Question | null {
  if (state.asked.length >= length) return null;
  const skillIds = new Set(skills.map((s) => s.id));
  const candidates = pool.filter((q) => ASSESSABLE.has(q.type) && skillIds.has(q.skillId) && !state.asked.includes(q.id));
  if (candidates.length === 0) return null;
  const theta = currentTheta(state);
  const count = new Map<string, number>();
  for (const r of state.responses) count.set(r.skillId, (count.get(r.skillId) ?? 0) + 1);
  const minCount = Math.min(...candidates.map((q) => count.get(q.skillId) ?? 0));
  const coverage = candidates.filter((q) => (count.get(q.skillId) ?? 0) === minCount);
  return coverage.reduce((best, q) => (information(theta, q.b) > information(theta, best.b) ? q : best));
}

export function recordAssessmentAnswer(state: AssessmentState, q: Question, correct: boolean): AssessmentState {
  return {
    asked: [...state.asked, q.id],
    responses: [...state.responses, { questionId: q.id, skillId: q.skillId, b: q.b, correct }],
  };
}

export interface SkillResult { skillId: string; theta: number; score: number; answered: number }
export interface AssessmentSummary {
  subject: Subject; grade: Grade; theta: number; score: number; label: MasteryLabel;
  skills: SkillResult[]; strengths: string[]; weaknesses: string[]; completedAt: string;
}

export function summarizeAssessment(
  state: AssessmentState, skills: Skill[], meta: { subject: Subject; grade: Grade }, now: Date = new Date(),
): AssessmentSummary {
  const theta = currentTheta(state);
  const results: SkillResult[] = skills.map((s) => {
    const rs = state.responses.filter((r) => r.skillId === s.id);
    const t = estimateTheta(rs, { mean: theta, sd: 0.8 }).theta;
    return { skillId: s.id, theta: t, score: thetaToScore(t), answered: rs.length };
  });
  const assessed = results.filter((r) => r.answered > 0).sort((a, b) => b.theta - a.theta);
  const nStrong = Math.min(2, Math.floor(assessed.length / 2));
  const nWeak = Math.min(2, assessed.length - nStrong);
  const score = thetaToScore(theta);
  return {
    ...meta, theta, score, label: masteryLabel(score), skills: results,
    strengths: assessed.slice(0, nStrong).map((r) => r.skillId),
    weaknesses: assessed.slice(assessed.length - nWeak).reverse().map((r) => r.skillId),
    completedAt: now.toISOString(),
  };
}

export function aiComment(summary: AssessmentSummary, studentName: string, nameOf: (id: string) => string): string {
  const subject = SUBJECT_LABEL[summary.subject];
  const parts = [`${studentName} ơi, năng lực ${subject} hiện tại của em ở mức ${summary.label} (${summary.score}/100).`];
  if (summary.strengths.length) parts.push(`Em làm tốt nhất ở phần ${summary.strengths.map(nameOf).join(' và ')}.`);
  if (summary.weaknesses.length) {
    parts.push(`Phần cần tập trung là ${summary.weaknesses.map(nameOf).join(' và ')}.`);
    parts.push(`Bé Cú đã đưa ${nameOf(summary.weaknesses[0])} vào Learning Zone để em luyện vừa sức — mỗi ngày 15 phút, vùng của em sẽ mở rộng dần nhé!`);
  } else {
    parts.push('Hãy làm thêm vài câu để Bé Cú hiểu em rõ hơn nhé!');
  }
  return parts.join(' ');
}
