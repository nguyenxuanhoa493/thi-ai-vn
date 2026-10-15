import { LEVELS, type Level, type Question, type Skill } from '@/lib/bank/types';
import { prob, updateThetaStep } from './irt';

export type Zone = 'mastered' | 'learning' | 'challenge';
export const LEVEL_B: Record<Level, number> = { NB: -1.5, TH: -0.5, VD: 0.5, VDC: 1.5 };
export const TARGET_P = 0.78;
export const MASTERY_P = 0.85;
/** Bước cập nhật lớn hơn assessment để vùng mở rộng thấy rõ trong 1 phiên demo */
export const LZ_K = 0.6;

export interface SkillProgress { theta: number; unlockedLevel: Level }
export type ZoneMap = Record<string, SkillProgress>;
export type ZoneEvent = { type: 'level'; skillId: string; level: Level } | { type: 'skill'; skillId: string };

const idx = (l: Level) => LEVELS.indexOf(l);

export function classify(p: number): Zone {
  if (p >= MASTERY_P) return 'mastered';
  if (p >= 0.5) return 'learning';
  return 'challenge';
}

export function frontierLevel(theta: number): Level {
  return LEVELS.find((l) => prob(theta, LEVEL_B[l]) < MASTERY_P) ?? 'VDC';
}

/** Mức cao nhất em đã đủ sức thử (p >= 0.5), tối thiểu NB — dùng cho kỹ năng đã được đánh giá */
function highestReachableLevel(theta: number): Level {
  return [...LEVELS].reverse().find((l) => LEVEL_B[l] <= theta) ?? 'NB';
}

const prereqsMet = (s: Skill, map: ZoneMap) =>
  s.prerequisites.every((p) => map[p] && idx(map[p].unlockedLevel) >= idx('VD'));

export function unlockNewSkills(map: ZoneMap, skills: Skill[]): { map: ZoneMap; events: ZoneEvent[] } {
  const next = { ...map };
  const events: ZoneEvent[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of skills) {
      if (next[s.id] || s.prerequisites.length === 0 || !prereqsMet(s, next)) continue;
      const theta = s.prerequisites.reduce((sum, p) => sum + next[p].theta, 0) / s.prerequisites.length - 0.5;
      next[s.id] = { theta, unlockedLevel: 'NB' };
      events.push({ type: 'skill', skillId: s.id });
      changed = true;
    }
  }
  return { map: next, events };
}

export function seedZoneMap(skills: Skill[], thetaBySkill: Record<string, number> = {}): ZoneMap {
  const map: ZoneMap = {};
  for (const s of skills) {
    if (s.id in thetaBySkill || s.prerequisites.length === 0) {
      const assessed = s.id in thetaBySkill;
      const theta = thetaBySkill[s.id] ?? 0;
      map[s.id] = { theta, unlockedLevel: assessed ? highestReachableLevel(theta) : frontierLevel(theta) };
    }
  }
  return unlockNewSkills(map, skills).map;
}

export function skillZone(sp: SkillProgress | undefined): { zone: Zone; p: number } {
  if (!sp) return { zone: 'challenge', p: 0 };
  const p = prob(sp.theta, LEVEL_B[sp.unlockedLevel]);
  return { zone: sp.unlockedLevel === 'VDC' && p >= MASTERY_P ? 'mastered' : 'learning', p };
}

export function zoneExtent(map: ZoneMap, skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, s) => sum + (map[s.id] ? (idx(map[s.id].unlockedLevel) + 1) / 4 : 0), 0);
  return total / skills.length;
}

export function pickNextQuestion(
  pool: Question[], map: ZoneMap, recent: string[], rand: () => number = Math.random,
): Question | null {
  const unlocked = pool.filter((q) => map[q.skillId] && idx(q.level) <= idx(map[q.skillId].unlockedLevel));
  if (unlocked.length === 0) return null;
  let candidates = unlocked.filter((q) => !recent.includes(q.id));
  if (candidates.length === 0) candidates = unlocked.filter((q) => !recent.slice(-1).includes(q.id));
  if (candidates.length === 0) return null;
  let best: Question | null = null;
  let bestScore = Infinity;
  for (const q of candidates) {
    const p = prob(map[q.skillId].theta, q.b);
    const inZone = p >= 0.5 && p < 0.92;
    const score = Math.abs(p - TARGET_P) + (inZone ? 0 : 1) + rand() * 0.05;
    if (score < bestScore) { bestScore = score; best = q; }
  }
  return best;
}

export function applyAnswer(
  map: ZoneMap, skills: Skill[], q: Question, correct: boolean,
): { map: ZoneMap; events: ZoneEvent[] } {
  const sp = map[q.skillId];
  if (!sp) return { map, events: [] };
  const theta = updateThetaStep(sp.theta, q.b, correct, LZ_K);
  let unlockedLevel = sp.unlockedLevel;
  const events: ZoneEvent[] = [];
  if (unlockedLevel !== 'VDC' && prob(theta, LEVEL_B[unlockedLevel]) >= MASTERY_P) {
    unlockedLevel = LEVELS[idx(unlockedLevel) + 1];
    events.push({ type: 'level', skillId: q.skillId, level: unlockedLevel });
  }
  const r = unlockNewSkills({ ...map, [q.skillId]: { theta, unlockedLevel } }, skills);
  return { map: r.map, events: [...events, ...r.events] };
}
