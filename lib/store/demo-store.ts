'use client';
import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { GRADES, type Grade, type Question, type Subject } from '@/lib/bank/types';
import { skillsFor } from '@/lib/bank';
import type { AssessmentSummary } from '@/lib/engine/assessment';
import { seedZoneMap, zoneExtent, type ZoneMap } from '@/lib/engine/learning-zone';
import { thetaToScore } from '@/lib/engine/irt';
import type { ExamAttempt, ExamResult } from '@/lib/engine/exam';
import { toDateKey, updateStreak, xpFor, type BadgeId, type Streak } from '@/lib/engine/gamification';

export const STORE_VERSION = 1;
export const zoneKey = (subject: Subject, grade: Grade) => `${subject}-${grade}`;

export interface HistoryItem { date: string; subject: Subject; answered: number; correct: number; xp: number }
export interface ProgressPoint { date: string; subject: Subject; grade: Grade; score: number }
export type MilestoneKind = 'assessment' | 'zone-expand';
export interface Milestone { date: string; subject: Subject; grade: Grade; kind: MilestoneKind }
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
  zoneBaseline: Record<string, number>;
  progress: ProgressPoint[];
  milestones: Milestone[];
}
interface Actions {
  setGrade: (g: Grade) => void;
  recordAnswer: (subject: Subject, q: Question, correct: boolean) => { xp: number; combo: number; newBadges: BadgeId[] };
  saveAssessment: (s: AssessmentSummary) => BadgeId[];
  ensureZone: (subject: Subject, grade: Grade) => ZoneMap;
  addMilestone: (subject: Subject, grade: Grade, kind: MilestoneKind) => void;
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
  // lịch sử tiến bộ lớp 9: 13 ngày kết thúc hôm qua, nhiễu cố định (không dùng Math.random)
  const NOISE = [0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 0];
  const series = (subject: Subject, from: number, to: number, shift: number): ProgressPoint[] =>
    Array.from({ length: 13 }, (_, i) => {
      const edge = i === 0 || i === 12;
      const base = from + ((to - from) * i) / 12;
      return { date: day(13 - i), subject, grade: 9 as Grade, score: Math.round(base + (edge ? 0 : NOISE[(i + shift) % 13])) };
    });
  const progress = [...series('toan', 52, 63, 0), ...series('anh', 58, 66, 4)];
  const milestones: Milestone[] = (['toan', 'anh'] as Subject[]).map((subject) => ({ date: day(10), subject, grade: 9 as Grade, kind: 'assessment' as const }));
  return {
    version: STORE_VERSION, profile: { name: 'Minh', grade: 9 }, xp: 1240,
    streak: { count: 6, lastDate: day(1) }, combo: 0, zones: {}, assessments: {}, history,
    badges: [], exam: null, examResults: {}, soundOn: true,
    zoneBaseline: {}, progress, milestones,
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
    const x = d as Partial<DemoData>;
    // trường mới (thêm sau): thiếu thì dùng mặc định rỗng, không xoá tiến độ cũ
    if (!Array.isArray(x.progress)) out.progress = createSeed(now).progress;
    else out.progress = x.progress.filter((r) => isObj(r) && typeof r.date === 'string' && typeof r.score === 'number' && GRADES.includes(r.grade as Grade) && (r.subject === 'toan' || r.subject === 'anh'));
    if (!Array.isArray(x.milestones)) out.milestones = createSeed(now).milestones;
    else out.milestones = x.milestones.filter((r) => isObj(r) && typeof r.date === 'string' && GRADES.includes(r.grade as Grade) && (r.subject === 'toan' || r.subject === 'anh') && (r.kind === 'assessment' || r.kind === 'zone-expand'));
    if (!isObj(x.zoneBaseline)) out.zoneBaseline = {};
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
  zoneBaseline: s.zoneBaseline, progress: s.progress, milestones: s.milestones,
});

/** Điểm tiến bộ = trung bình điểm năng lực các kiến thức trong vùng; null nếu chưa có dữ liệu */
function mapScore(map: ZoneMap | undefined): number | null {
  const ts = Object.values(map ?? {}).map((p) => thetaToScore(p.theta));
  return ts.length ? Math.round(ts.reduce((a, b) => a + b, 0) / ts.length) : null;
}
function upsertProgress(list: ProgressPoint[], subject: Subject, grade: Grade, score: number | null): ProgressPoint[] {
  if (score == null) return list;
  const date = toDateKey(new Date());
  const i = list.findIndex((r) => r.date === date && r.subject === subject && r.grade === grade);
  const next = [...list];
  if (i >= 0) next[i] = { ...next[i], score }; else next.push({ date, subject, grade, score });
  return next;
}
function withMilestone(list: Milestone[], subject: Subject, grade: Grade, kind: MilestoneKind): Milestone[] {
  const date = toDateKey(new Date());
  return list.some((m) => m.date === date && m.subject === subject && m.grade === grade && m.kind === kind)
    ? list : [...list, { date, subject, grade, kind }];
}

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
        const skills = skillsFor(summary.subject, summary.grade);
        set((s) => ({
          assessments: { ...s.assessments, [key]: summary }, zones: { ...s.zones, [key]: map },
          zoneBaseline: key in s.zoneBaseline ? s.zoneBaseline : { ...s.zoneBaseline, [key]: zoneExtent(map, skills) },
          progress: upsertProgress(s.progress, summary.subject, summary.grade, mapScore(map) ?? summary.score),
          milestones: withMilestone(s.milestones, summary.subject, summary.grade, 'assessment'),
        }));
        return get().awardBadge('first-assessment') ? ['first-assessment'] : [];
      },
      ensureZone: (subject, grade) => {
        const key = zoneKey(subject, grade);
        const existing = get().zones[key];
        if (existing) return existing;
        const map = seedZoneMap(skillsFor(subject, grade));
        set((s) => ({
          zones: { ...s.zones, [key]: map },
          zoneBaseline: key in s.zoneBaseline ? s.zoneBaseline : { ...s.zoneBaseline, [key]: zoneExtent(map, skillsFor(subject, grade)) },
        }));
        return map;
      },
      setZone: (subject, grade, map) => set((s) => {
        const key = zoneKey(subject, grade);
        const today = toDateKey(new Date());
        const prevToday = s.progress.find((r) => r.date === today && r.subject === subject && r.grade === grade)?.score;
        const score = mapScore(map);
        return {
          zones: { ...s.zones, [key]: map },
          // zone cũ chưa có mốc: lấy mốc từ bản đồ TRƯỚC khi áp dụng câu trả lời mới
          zoneBaseline: key in s.zoneBaseline ? s.zoneBaseline : { ...s.zoneBaseline, [key]: zoneExtent(s.zones[key] ?? map, skillsFor(subject, grade)) },
          // trong cùng một ngày, điểm không tụt khi mở khoá kiến thức mới có θ thấp
          progress: upsertProgress(s.progress, subject, grade, score == null ? null : Math.max(prevToday ?? 0, score)),
        };
      }),
      addMilestone: (subject, grade, kind) => set((s) => ({ milestones: withMilestone(s.milestones, subject, grade, kind) })),
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
