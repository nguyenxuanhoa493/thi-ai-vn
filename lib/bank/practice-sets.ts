import { chaptersFor, questionsFor, SKILLS } from '.';
import { LEVELS, SUBJECT_LABEL, type Grade, type Subject } from './types';

export interface PracticeSet {
  id: string; title: string; subtitle: string; subject: Subject; grade: Grade;
  chapterId: string | null; questionIds: string[];
}

function build(subject: Subject, grade: Grade): PracticeSet[] {
  const all = questionsFor(subject, grade).filter((q) => q.type !== 'write');
  const byLevel = (a: { level: string }, b: { level: string }) =>
    LEVELS.indexOf(a.level as never) - LEVELS.indexOf(b.level as never);
  const sets: PracticeSet[] = chaptersFor(subject, grade).map((ch) => {
    const skillIds = SKILLS.filter((s) => s.chapterId === ch.id).map((s) => s.id);
    const qs = all.filter((q) => skillIds.includes(q.skillId)).sort(byLevel).slice(0, 10);
    return { id: `${ch.id}-quick`, title: ch.name, subtitle: `Luyện nhanh · ${qs.length} câu`, subject, grade, chapterId: ch.id, questionIds: qs.map((q) => q.id) };
  });
  const mixed = all.filter((_, i) => i % 3 === 0).slice(0, 15);
  sets.push({ id: `${subject}-${grade}-tong-hop`, title: `Đề tổng hợp ${SUBJECT_LABEL[subject]} ${grade}`, subtitle: `Tổng hợp · ${mixed.length} câu`,
    subject, grade, chapterId: null, questionIds: mixed.map((q) => q.id) });
  return sets.filter((s) => s.questionIds.length > 0);
}

const cache = new Map<string, PracticeSet[]>();
export function practiceSetsFor(subject: Subject, grade: Grade): PracticeSet[] {
  const key = `${subject}-${grade}`;
  if (!cache.has(key)) cache.set(key, build(subject, grade));
  return cache.get(key)!;
}
export function getPracticeSet(id: string): PracticeSet | undefined {
  for (const subject of ['toan', 'anh'] as Subject[]) for (const grade of [6, 9, 12] as Grade[]) {
    const s = practiceSetsFor(subject, grade).find((p) => p.id === id);
    if (s) return s;
  }
  return undefined;
}
