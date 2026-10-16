import { describe, it, expect } from 'vitest';
import { buildExam, shuffle } from '@/lib/engine/exam-builder';
import { makeQ } from '../../fixtures';

const pool = [
  makeQ('n1', 's', -1.5, 'NB'), makeQ('n2', 's', -1.5, 'NB'), makeQ('n3', 's', -1.5, 'NB'),
  makeQ('t1', 's', -0.5, 'TH'), makeQ('t2', 's', -0.5, 'TH'), makeQ('v1', 's', 0.5, 'VD'),
];

describe('exam builder', () => {
  it('shuffle keeps elements', () => {
    expect(shuffle([1, 2, 3, 4], () => 0.3).sort()).toEqual([1, 2, 3, 4]);
  });
  it('picks per level, no duplicates', () => {
    const r = buildExam(pool, { NB: 2, TH: 1, VD: 1, VDC: 0 }, () => 0.5);
    expect(r.questions).toHaveLength(4);
    expect(new Set(r.questions.map((q) => q.id)).size).toBe(4);
    expect(r.questions.filter((q) => q.level === 'NB')).toHaveLength(2);
    expect(r.shortfall).toEqual({ NB: 0, TH: 0, VD: 0, VDC: 0 });
  });
  it('reports shortfall when bank lacks questions; orders by level', () => {
    const r = buildExam(pool, { NB: 1, TH: 5, VD: 1, VDC: 2 }, () => 0.5);
    expect(r.shortfall).toEqual({ NB: 0, TH: 3, VD: 0, VDC: 2 });
    expect(r.questions.map((q) => q.level)).toEqual(['NB', 'TH', 'TH', 'VD']);
  });
});
