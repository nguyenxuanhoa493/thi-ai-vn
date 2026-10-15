import { describe, it, expect } from 'vitest';
import {
  ALL_QUESTIONS, SKILLS, CHAPTERS, questionsFor, skillsFor, chaptersFor, getQuestion, skillName, chapterCount, BANK_TOTAL,
} from '@/lib/bank';
import { EXAMS, examsFor } from '@/lib/bank/exams';
import { practiceSetsFor, getPracticeSet } from '@/lib/bank/practice-sets';
import { GRADES, LEVELS, type Level, type Subject } from '@/lib/bank/types';

const LEVEL_B: Record<Level, number> = { NB: -1.5, TH: -0.5, VD: 0.5, VDC: 1.5 };
const SUBJECTS: Subject[] = ['toan', 'anh'];

describe('bank integrity', () => {
  it('ids unique', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every question references a skill of same subject/grade', () => {
    for (const q of ALL_QUESTIONS) {
      const s = SKILLS.find((k) => k.id === q.skillId);
      expect(s, q.id).toBeDefined();
      expect(s!.subject).toBe(q.subject);
      expect(s!.grade).toBe(q.grade);
    }
  });
  it('skills reference existing chapter/lesson and prerequisites', () => {
    for (const s of SKILLS) {
      const ch = CHAPTERS.find((c) => c.id === s.chapterId);
      expect(ch, s.id).toBeDefined();
      expect(ch!.lessons.some((l) => l.id === s.lessonId), s.id).toBe(true);
      for (const p of s.prerequisites) expect(SKILLS.some((k) => k.id === p), `${s.id}→${p}`).toBe(true);
    }
  });
  it('difficulty b consistent with level (±0.6)', () => {
    for (const q of ALL_QUESTIONS) expect(Math.abs(q.b - LEVEL_B[q.level]), q.id).toBeLessThanOrEqual(0.6);
  });
  it('answer shapes are valid', () => {
    for (const q of ALL_QUESTIONS) {
      switch (q.type) {
        case 'mcq': case 'listen':
          expect(q.answer, q.id).toBeGreaterThanOrEqual(0); expect(q.answer, q.id).toBeLessThan(q.options.length); break;
        case 'multi':
          expect(q.answer.length, q.id).toBeGreaterThan(0);
          q.answer.forEach((a) => expect(a, q.id).toBeLessThan(q.options.length)); break;
        case 'tf4':
          expect(q.statements, q.id).toHaveLength(4); expect(q.answer, q.id).toHaveLength(4); break;
        case 'order':
          expect(q.answer, q.id).toEqual(q.items.map((_, i) => i)); break;
        case 'match':
          expect([...q.answer].sort(), q.id).toEqual(q.right.map((_, i) => i)); expect(q.left.length).toBe(q.right.length); break;
        case 'fill':
          expect(q.text.split('___').length - 1, q.id).toBe(q.answer.length);
          q.answer.forEach((w) => expect(q.bank, q.id).toContain(w)); break;
        case 'short':
          expect(q.answer.trim().length, q.id).toBeGreaterThan(0); break;
        default: break;
      }
    }
  });
  it('grade 9 coverage: ≥60 câu mỗi môn, mỗi skill có đủ 4 mức độ', () => {
    for (const subject of SUBJECTS) {
      expect(questionsFor(subject, 9).length, subject).toBeGreaterThanOrEqual(60);
      for (const s of skillsFor(subject, 9)) {
        if (['e9-speaking', 'e9-writing', 'e9-listening'].includes(s.id)) continue;
        for (const level of LEVELS) {
          expect(questionsFor(subject, 9).some((q) => q.skillId === s.id && q.level === level), `${s.id} ${level}`).toBe(true);
        }
      }
    }
  });
  it('grade 9 type coverage', () => {
    const t = new Set(questionsFor('toan', 9).map((q) => q.type));
    for (const k of ['mcq', 'multi', 'tf4', 'short', 'order', 'graph']) expect(t.has(k as never), k).toBe(true);
    const e = new Set(questionsFor('anh', 9).map((q) => q.type));
    for (const k of ['mcq', 'tf4', 'listen', 'fill', 'match', 'order', 'speak', 'write']) expect(e.has(k as never), k).toBe(true);
  });
  it('grades 6 & 12 have ≥10 câu mỗi môn and helpers work for every grade', () => {
    for (const g of GRADES) for (const s of SUBJECTS) {
      expect(skillsFor(s, g).length).toBeGreaterThan(0);
      expect(chaptersFor(s, g).length).toBeGreaterThan(0);
      if (g !== 9) expect(questionsFor(s, g).length, `${s}-${g}`).toBeGreaterThanOrEqual(10);
    }
  });
  it('helpers', () => {
    expect(BANK_TOTAL).toBe(40000);
    expect(getQuestion(ALL_QUESTIONS[0].id)).toBe(ALL_QUESTIONS[0]);
    expect(skillName('khong-ton-tai')).toBe('khong-ton-tai');
    expect(chapterCount(CHAPTERS[0].id)).toBeGreaterThan(0);
  });
  it('exams reference real questions of same subject/grade and exclude speak', () => {
    expect(examsFor(9).length).toBeGreaterThanOrEqual(4);
    for (const e of EXAMS) {
      expect(e.questionIds.length, e.id).toBeGreaterThan(0);
      for (const id of e.questionIds) {
        const q = getQuestion(id)!;
        expect(q, id).toBeDefined();
        expect(q.subject).toBe(e.subject); expect(q.grade).toBe(e.grade);
        expect(q.type).not.toBe('speak');
      }
    }
  });
  it('practice sets', () => {
    const sets = practiceSetsFor('toan', 9);
    expect(sets.length).toBeGreaterThan(0);
    for (const s of sets) {
      expect(s.questionIds.length).toBeGreaterThan(0);
      expect(s.questionIds.length).toBeLessThanOrEqual(15);
      expect(getPracticeSet(s.id)).toBe(s);
    }
  });
});
