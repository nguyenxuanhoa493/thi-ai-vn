import { describe, it, expect } from 'vitest';
import {
  classify, frontierLevel, seedZoneMap, skillZone, zoneExtent, pickNextQuestion, applyAnswer, LEVEL_B, type ZoneMap,
} from '@/lib/engine/learning-zone';
import { prob } from '@/lib/engine/irt';
import { makeQ, makeSkill } from '../../fixtures';

const A = makeSkill('A');
const B = makeSkill('B', ['A']);
const skills = [A, B];
const pool = [
  makeQ('a-nb-1', 'A', -1.5, 'NB'), makeQ('a-nb-2', 'A', -1.3, 'NB'), makeQ('a-th-1', 'A', -0.5, 'TH'),
  makeQ('a-vd-1', 'A', 0.5, 'VD'), makeQ('a-vdc-1', 'A', 1.5, 'VDC'), makeQ('b-nb-1', 'B', -1.5, 'NB'),
];

describe('learning zone', () => {
  it('classify thresholds', () => {
    expect(classify(0.9)).toBe('mastered');
    expect(classify(0.85)).toBe('mastered');
    expect(classify(0.7)).toBe('learning');
    expect(classify(0.5)).toBe('learning');
    expect(classify(0.49)).toBe('challenge');
  });
  it('frontierLevel is the first level not yet mastered', () => {
    expect(frontierLevel(0)).toBe('NB');
    expect(frontierLevel(0.4)).toBe('TH');
    expect(frontierLevel(5)).toBe('VDC');
  });
  it('seed: only root skills unlocked by default', () => {
    const map = seedZoneMap(skills);
    expect(Object.keys(map)).toEqual(['A']);
    expect(map.A).toEqual({ theta: 0, unlockedLevel: 'NB' });
  });
  it('seed with assessment thetas unlocks dependents when prereq reaches VD', () => {
    const map = seedZoneMap(skills, { A: 1.2 });
    expect(map.A.unlockedLevel).toBe('VD');
    expect(map.B).toBeDefined();
    expect(map.B.unlockedLevel).toBe('NB');
  });
  it('skillZone', () => {
    expect(skillZone(undefined).zone).toBe('challenge');
    expect(skillZone({ theta: 0, unlockedLevel: 'TH' }).zone).toBe('learning');
    expect(skillZone({ theta: 4, unlockedLevel: 'VDC' }).zone).toBe('mastered');
  });
  it('zoneExtent grows with progress', () => {
    const small: ZoneMap = { A: { theta: 0, unlockedLevel: 'NB' } };
    const big: ZoneMap = { A: { theta: 1, unlockedLevel: 'VD' }, B: { theta: 0, unlockedLevel: 'NB' } };
    expect(zoneExtent(big, skills)).toBeGreaterThan(zoneExtent(small, skills));
    expect(zoneExtent({}, skills)).toBe(0);
  });
  it('pickNext only from unlocked skills/levels, aiming p≈0.78', () => {
    const map: ZoneMap = { A: { theta: 0, unlockedLevel: 'TH' } };
    const q = pickNextQuestion(pool, map, [], () => 0)!;
    expect(q.skillId).toBe('A');
    expect(['NB', 'TH']).toContain(q.level);
    const p = prob(0, q.b);
    expect(p).toBeGreaterThanOrEqual(0.5);
    expect(p).toBeLessThan(0.92);
  });
  it('pickNext avoids recent, falls back when exhausted, returns null when nothing unlocked', () => {
    const map: ZoneMap = { A: { theta: 0, unlockedLevel: 'NB' } };
    const q = pickNextQuestion(pool, map, ['a-nb-1'], () => 0)!;
    expect(q.id).toBe('a-nb-2');
    const fallback = pickNextQuestion(pool, map, ['x', 'y', 'z', 'a-nb-1', 'a-nb-2'], () => 0);
    expect(fallback).not.toBeNull();
    expect(pickNextQuestion(pool, {}, [], () => 0)).toBeNull();
    expect(pickNextQuestion([], map, [], () => 0)).toBeNull();
  });
  it('correct answers expand the zone (level unlock) within 6 answers', () => {
    let map: ZoneMap = { A: { theta: -0.5, unlockedLevel: 'NB' } };
    const events = [];
    for (let i = 0; i < 6; i++) {
      const r = applyAnswer(map, skills, pool[0], true);
      map = r.map; events.push(...r.events);
    }
    expect(events).toContainEqual({ type: 'level', skillId: 'A', level: 'TH' });
    expect(map.A.unlockedLevel).toBe('TH');
  });
  it('wrong answers lower theta but never re-lock levels', () => {
    const r = applyAnswer({ A: { theta: 0, unlockedLevel: 'TH' } }, skills, pool[2], false);
    expect(r.map.A.theta).toBeLessThan(0);
    expect(r.map.A.unlockedLevel).toBe('TH');
    expect(r.events).toEqual([]);
  });
  it('reaching VD unlocks dependent skill', () => {
    const start: ZoneMap = { A: { theta: LEVEL_B.TH + 1.7, unlockedLevel: 'TH' } };
    const r = applyAnswer(start, skills, pool[2], true);
    expect(r.map.A.unlockedLevel).toBe('VD');
    expect(r.events).toContainEqual({ type: 'skill', skillId: 'B' });
    expect(r.map.B.unlockedLevel).toBe('NB');
  });
  it('applyAnswer on unknown skill is a no-op', () => {
    const map: ZoneMap = {};
    expect(applyAnswer(map, skills, pool[0], true)).toEqual({ map, events: [] });
  });
});
