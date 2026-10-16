import { CHAPTERS, SKILLS } from './curriculum';
import type { Grade, Question, Subject } from './types';
import { TOAN_9 } from './questions/toan-9';
import { ANH_9 } from './questions/anh-9';
import { TOAN_6 } from './questions/toan-6';
import { ANH_6 } from './questions/anh-6';
import { TOAN_12 } from './questions/toan-12';
import { ANH_12 } from './questions/anh-12';

export { CHAPTERS, SKILLS };
export const BANK_TOTAL = 40000;
export const ALL_QUESTIONS: Question[] = [...TOAN_9, ...ANH_9, ...TOAN_6, ...ANH_6, ...TOAN_12, ...ANH_12];

const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
export const getQuestion = (id: string) => byId.get(id);
export const questionsFor = (subject: Subject, grade: Grade) =>
  ALL_QUESTIONS.filter((q) => q.subject === subject && q.grade === grade);
export const skillsFor = (subject: Subject, grade: Grade) =>
  SKILLS.filter((s) => s.subject === subject && s.grade === grade);
export const chaptersFor = (subject: Subject, grade: Grade) =>
  CHAPTERS.filter((c) => c.subject === subject && c.grade === grade).sort((a, b) => a.order - b.order);
export const skillName = (id: string) => SKILLS.find((s) => s.id === id)?.name ?? id;
export const chapterCount = (chapterId: string) =>
  SKILLS.filter((s) => s.chapterId === chapterId).reduce((sum, s) => sum + s.bankCount, 0);
