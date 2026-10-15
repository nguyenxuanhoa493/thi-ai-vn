'use client';
import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { GRADES, type Grade, type Question, type Subject } from '@/lib/bank/types';
import { skillsFor } from '@/lib/bank';
import type { AssessmentSummary } from '@/lib/engine/assessment';
import { seedZoneMap, type ZoneMap } from '@/lib/engine/learning-zone';
import type { ExamAttempt, ExamResult } from '@/lib/engine/exam';
import { toDateKey, updateStreak, xpFor, type BadgeId, type Streak } from '@/lib/engine/gamification';

export const STORE_VERSION = 1;
export const zoneKey = (subject: Subject, grade: Grade) => `${subject}-${grade}`;

export interface HistoryItem { date: string; subject: Subject; answered: number; correct: number; xp: number }
export interface DemoData {
  version: number;
  profile: { name: string; grade: Grade };
  xp: number; streak: Streak; combo: number;
  zones: Record<string, ZoneMap>;
  assessments: Record<string, AssessmentSummary>;
  history: HistoryItem[];
  badges: BadgeId[];
  exam: ExamAttempt | null;
  examResults: Record<string, ExamResult>;
  soundOn: boolean;
}
interface Actions {
  setGrade: (g: Grade) => void;
  recordAnswer: (subject: Subject, q: Question, correct: boolean) => { xp: number; combo: number; newBadges: BadgeId[] };
  saveAssessment: (s: AssessmentSummary) => BadgeId[];
  ensureZone: (subject: Subject, grade: Grade) => ZoneMap;
  setZone: (subject: Subject, grade: Grade, map: ZoneMap) => void;
  awardBadge: (id: BadgeId) => boolean;
  setExam: (a: ExamAttempt | null) => void;
  finishExam: (r: ExamResult) => BadgeId[];
  toggleSound: () => void;
  resetDemo: () => void;
}
export type DemoState = DemoData & Actions;

export function createSeed(now: Date = new Date()): DemoData {
  const day = (offset: number) => toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));
  const history: HistoryItem[] = [6, 5, 4, 3, 2, 1].map((o, i) => ({
    date: day(o), subject: i % 2 ? 'anh' : 'toan', answered: 10 + i, correct: 7 + (i % 3), xp: 90 + i * 12,
  }));
  return {
    version: STORE_VERSION, profile: { name: 'Minh', grade: 9 }, xp: 1240,
    streak: { count: 6, lastDate: day(1) }, combo: 0, zones: {}, assessments: {}, history,
    badges: [], exam: null, examResults: {}, soundOn: true,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function sanitizePersisted(p: unknown, now: Date = new Date()): DemoData {
  try {
    const d = p as Partial<DemoData> | null;
    const ok = isObj(d) && d.version === STORE_VERSION
      && isObj(d.profile) && typeof d.profile.name === 'string' && GRADES.includes(d.profile.grade as Grade)
      && typeof d.xp === 'number' && isObj(d.streak) && typeof d.streak.count === 'number' && typeof d.streak.lastDate === 'string' && Array.isArray(d.history) && Array.isArray(d.badges)
      && isObj(d.zones) && isObj(d.assessments) && isObj(d.examResults);
    if (!ok) return createSeed(now);
    const out = { ...createSeed(now), ...(d as DemoData) };
    const e = out.exam as unknown;
    if (typeof (d as { soundOn?: unknown }).soundOn !== 'boolean') out.soundOn = true;
    if (e != null && !(isObj(e) && typeof e.startedAt === 'number' && typeof e.durationSec === 'number' && isObj(e.answers))) out.exam = null;
    return out;
  } catch {
    return createSeed(now);
  }
}

/** Safe storage: unparsable JSON or blocked storage never breaks hydration. */
const safeStorage: PersistStorage<DemoData> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (raw == null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, JSON.stringify(value)); } catch { /* ignore */ }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name); } catch { /* ignore */ }
  },
};

const dataOnly = (s: DemoState): DemoData => ({
  version: s.version, profile: s.profile, xp: s.xp, streak: s.streak, combo: s.combo, zones: s.zones,
  assessments: s.assessments, history: s.history, badges: s.badges, exam: s.exam, examResults: s.examResults, soundOn: s.soundOn,
});

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      setGrade: (grade) => set((s) => ({ profile: { ...s.profile, grade } })),
      recordAnswer: (subject, q, correct) => {
        const s = get();
        const gained = xpFor(q.level, correct, s.combo);
        const combo = correct ? s.combo + 1 : 0;
        const today = toDateKey(new Date());
        const history = [...s.history];
        const i = history.findIndex((h) => h.date === today && h.subject === subject);
        const prev = i >= 0 ? history[i] : { date: today, subject, answered: 0, correct: 0, xp: 0 };
        const item = { ...prev, answered: prev.answered + 1, correct: prev.correct + (correct ? 1 : 0), xp: prev.xp + gained };
        if (i >= 0) history[i] = item; else history.push(item);
        set({ xp: s.xp + gained, combo, streak: updateStreak(s.streak, today), history });
        const newBadges: BadgeId[] = [];
        if (combo >= 5 && get().awardBadge('combo-5')) newBadges.push('combo-5');
        return { xp: gained, combo, newBadges };
      },
      saveAssessment: (summary) => {
        const key = zoneKey(summary.subject, summary.grade);
        const thetas = Object.fromEntries(summary.skills.filter((r) => r.answered > 0).map((r) => [r.skillId, r.theta]));
        const map = seedZoneMap(skillsFor(summary.subject, summary.grade), thetas);
        set((s) => ({ assessments: { ...s.assessments, [key]: summary }, zones: { ...s.zones, [key]: map } }));
        return get().awardBadge('first-assessment') ? ['first-assessment'] : [];
      },
      ensureZone: (subject, grade) => {
        const key = zoneKey(subject, grade);
        const existing = get().zones[key];
        if (existing) return existing;
        const map = seedZoneMap(skillsFor(subject, grade));
        set((s) => ({ zones: { ...s.zones, [key]: map } }));
        return map;
      },
      setZone: (subject, grade, map) => set((s) => ({ zones: { ...s.zones, [zoneKey(subject, grade)]: map } })),
      awardBadge: (id) => {
        if (get().badges.includes(id)) return false;
        set((s) => ({ badges: [...s.badges, id] }));
        return true;
      },
      setExam: (exam) => set({ exam }),
      finishExam: (r) => {
        set((s) => ({ exam: null, examResults: { ...s.examResults, [r.examId]: r } }));
        return get().awardBadge('first-exam') ? ['first-exam'] : [];
      },
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      // tuỳ chọn âm thanh là cài đặt của người dùng, không bị xoá khi đặt lại tiến độ demo
      resetDemo: () => set({ ...createSeed(), soundOn: get().soundOn }),
    }),
    {
      name: 'thi-ai-demo',
      version: STORE_VERSION,
      storage: safeStorage,
      partialize: (s) => dataOnly(s),
      migrate: (p) => sanitizePersisted(p),
      merge: (persisted, current) => ({ ...current, ...sanitizePersisted(persisted) }),
      skipHydration: true,
    },
  ),
);
