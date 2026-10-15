import { describe, it, expect } from 'vitest';
import { checkAnswer, normalizeNumber } from '@/lib/bank/check';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, skillId: 's', level: 'TH', b: 0, content: '', explanation: '', hints: [], source: 'NXB' } as const;

describe('normalizeNumber', () => {
  it.each([
    ['2,5', 2.5], ['2.5', 2.5], [' 2.5 ', 2.5], ['5/2', 2.5], ['(5)/(2)', 2.5],
    ['\\frac{5}{2}', 2.5], ['-3', -3], ['- 3', -3], ['0', 0],
  ])('%s → %d', (raw, expected) => expect(normalizeNumber(raw)).toBeCloseTo(expected));
  it.each(['', 'abc', '1/0', '2..5', '}{'])('rejects %s', (raw) => expect(normalizeNumber(raw)).toBeNull());
});

describe('checkAnswer', () => {
  it('mcq', () => {
    const q: Question = { ...base, id: 'a', type: 'mcq', options: ['x', 'y'], answer: 1 };
    expect(checkAnswer(q, 1)).toEqual({ correct: true, fraction: 1 });
    expect(checkAnswer(q, 0)).toEqual({ correct: false, fraction: 0 });
    expect(checkAnswer(q, null)).toEqual({ correct: false, fraction: 0 });
  });
  it('multi ignores order', () => {
    const q: Question = { ...base, id: 'a', type: 'multi', options: ['a', 'b', 'c'], answer: [0, 2] };
    expect(checkAnswer(q, [2, 0]).correct).toBe(true);
    expect(checkAnswer(q, [0]).correct).toBe(false);
  });
  it('tf4 partial credit theo thang Bộ', () => {
    const q: Question = { ...base, id: 'a', type: 'tf4', statements: ['1', '2', '3', '4'], answer: [true, false, true, true] };
    expect(checkAnswer(q, [true, false, true, true])).toEqual({ correct: true, fraction: 1 });
    expect(checkAnswer(q, [true, false, true, false])).toEqual({ correct: false, fraction: 0.5 });
    expect(checkAnswer(q, [true, false, false, false])).toEqual({ correct: false, fraction: 0.25 });
    expect(checkAnswer(q, [true, true, false, false])).toEqual({ correct: false, fraction: 0.1 });
    expect(checkAnswer(q, [null, null, null, null])).toEqual({ correct: false, fraction: 0 });
  });
  it('short accepts equivalent formats', () => {
    const q: Question = { ...base, id: 'a', type: 'short', answer: '2,5' };
    for (const v of ['2.5', '5/2', '\\frac{5}{2}', ' 2,5 ']) expect(checkAnswer(q, v).correct).toBe(true);
    expect(checkAnswer(q, 'hello').correct).toBe(false);
  });
  it('order & match', () => {
    const o: Question = { ...base, id: 'o', type: 'order', items: ['a', 'b', 'c'], answer: [0, 1, 2] };
    expect(checkAnswer(o, [0, 1, 2]).correct).toBe(true);
    expect(checkAnswer(o, [1, 0, 2]).correct).toBe(false);
    const m: Question = { ...base, id: 'm', type: 'match', left: ['a', 'b'], right: ['x', 'y'], answer: [1, 0] };
    expect(checkAnswer(m, [1, 0]).correct).toBe(true);
    expect(checkAnswer(m, [1, -1]).correct).toBe(false);
  });
  it('fill is case/space-insensitive', () => {
    const q: Question = { ...base, id: 'f', type: 'fill', text: '___ and ___', bank: ['who', 'which'], answer: ['who', 'which'] };
    expect(checkAnswer(q, ['Who ', 'which']).correct).toBe(true);
    expect(checkAnswer(q, ['who', '']).correct).toBe(false);
  });
  it('graph tolerates 0.25', () => {
    const q: Question = { ...base, id: 'g', type: 'graph', lines: [], answer: { x: 1, y: 2 } };
    expect(checkAnswer(q, { x: 1.2, y: 2 }).correct).toBe(true);
    expect(checkAnswer(q, { x: 2, y: 2 }).correct).toBe(false);
  });
  it('speak needs ≥1s recording; write needs minWords', () => {
    const s: Question = { ...base, id: 's', type: 'speak', target: 'Hello there' };
    expect(checkAnswer(s, { durationMs: 1500 }).correct).toBe(true);
    expect(checkAnswer(s, { durationMs: 300 }).correct).toBe(false);
    const w: Question = { ...base, id: 'w', type: 'write', prompt: 'p', minWords: 3 };
    expect(checkAnswer(w, 'one two three').correct).toBe(true);
    expect(checkAnswer(w, 'one two').correct).toBe(false);
  });
});
