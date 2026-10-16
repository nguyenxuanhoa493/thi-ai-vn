import type { Level, Question, Skill } from '@/lib/bank/types';

export function makeQ(id: string, skillId: string, b: number, level: Level = 'TH'): Question {
  return { id, skillId, b, level, subject: 'toan', grade: 9, source: 'NXB', content: id, explanation: '', hints: [],
    type: 'mcq', options: ['a', 'b'], answer: 0 };
}
export function makeSkill(id: string, prerequisites: string[] = []): Skill {
  return { id, prerequisites, subject: 'toan', grade: 9, chapterId: 'c', lessonId: 'l', name: `Skill ${id}`, bankCount: 100 };
}
