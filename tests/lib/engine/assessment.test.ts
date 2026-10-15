import { describe, it, expect } from 'vitest';
import {
  emptyAssessment, nextAssessmentQuestion, recordAssessmentAnswer, summarizeAssessment, aiComment, currentTheta,
} from '@/lib/engine/assessment';
import { makeQ, makeSkill } from '../../fixtures';

const skills = [makeSkill('A'), makeSkill('B')];
const pool = [
  makeQ('a1', 'A', -1.5, 'NB'), makeQ('a2', 'A', -0.1, 'TH'), makeQ('a3', 'A', 0.6, 'VD'), makeQ('a4', 'A', 1.5, 'VDC'),
  makeQ('b1', 'B', -1.5, 'NB'), makeQ('b2', 'B', 0.1, 'TH'), makeQ('b3', 'B', 0.5, 'VD'), makeQ('b4', 'B', 1.6, 'VDC'),
];

describe('assessment', () => {
  it('first question is most informative at theta 0', () => {
    const q = nextAssessmentQuestion(pool, skills, emptyAssessment())!;
    expect(['a2', 'b2']).toContain(q.id);
  });
  it('alternates skills for coverage', () => {
    const q1 = nextAssessmentQuestion(pool, skills, emptyAssessment())!;
    const s1 = recordAssessmentAnswer(emptyAssessment(), q1, true);
    const q2 = nextAssessmentQuestion(pool, skills, s1)!;
    expect(q2.skillId).not.toBe(q1.skillId);
  });
  it('gets harder after correct answers', () => {
    let s = emptyAssessment();
    const first = nextAssessmentQuestion(pool, skills, s)!;
    s = recordAssessmentAnswer(s, first, true);
    const second = nextAssessmentQuestion(pool, skills, s)!;
    s = recordAssessmentAnswer(s, second, true);
    const third = nextAssessmentQuestion(pool, skills, s)!;
    expect(third.b).toBeGreaterThan(first.b);
    expect(currentTheta(s)).toBeGreaterThan(0);
  });
  it('stops at length or when pool exhausted', () => {
    let s = emptyAssessment();
    for (let i = 0; i < 3; i++) s = recordAssessmentAnswer(s, nextAssessmentQuestion(pool, skills, s, 3)!, true);
    expect(nextAssessmentQuestion(pool, skills, s, 3)).toBeNull();
    let all = emptyAssessment();
    for (const q of pool) all = recordAssessmentAnswer(all, q, true);
    expect(nextAssessmentQuestion(pool, skills, all, 99)).toBeNull();
  });
  it('excludes speak/write questions', () => {
    const speak = { ...makeQ('sp', 'A', 0), type: 'speak', target: 'hi' } as never;
    const q = nextAssessmentQuestion([speak], skills, emptyAssessment());
    expect(q).toBeNull();
  });
  it('summarize ranks strong vs weak skills without overlap', () => {
    let s = emptyAssessment();
    for (const q of pool) s = recordAssessmentAnswer(s, q, q.skillId === 'A');
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 }, new Date('2026-10-16T08:00:00'));
    const a = sum.skills.find((x) => x.skillId === 'A')!;
    const b = sum.skills.find((x) => x.skillId === 'B')!;
    expect(a.theta).toBeGreaterThan(b.theta);
    expect(sum.strengths).toEqual(['A']);
    expect(sum.weaknesses).toEqual(['B']);
    expect(sum.score).toBeGreaterThanOrEqual(0);
    expect(sum.completedAt).toBe(new Date('2026-10-16T08:00:00').toISOString());
  });
  it('aiComment mentions label and skill names', () => {
    let s = emptyAssessment();
    for (const q of pool) s = recordAssessmentAnswer(s, q, q.skillId === 'A');
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 });
    const text = aiComment(sum, 'Minh', (id) => `Skill ${id}`);
    expect(text).toContain('Minh');
    expect(text).toContain(sum.label);
    expect(text).toContain('Skill A');
    expect(text).toContain('Skill B');
  });
  it('aiComment handles empty assessment', () => {
    const sum = summarizeAssessment(emptyAssessment(), skills, { subject: 'toan', grade: 9 });
    expect(() => aiComment(sum, 'Minh', (id) => id)).not.toThrow();
    expect(sum.strengths).toEqual([]);
  });
});
