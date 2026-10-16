import { describe, it, expect } from 'vitest';
import { countWords, simulateSpeakingScore, simulateWritingRubric } from '@/lib/bank/simulate';

describe('simulate', () => {
  it('countWords', () => {
    expect(countWords('  hello   world ')).toBe(2);
    expect(countWords('')).toBe(0);
  });
  it('speaking score is deterministic and bounded', () => {
    const a = simulateSpeakingScore('I wish I could visit Hoi An', 3000);
    expect(a).toEqual(simulateSpeakingScore('I wish I could visit Hoi An', 3000));
    expect(a.overall).toBeGreaterThanOrEqual(60);
    expect(a.overall).toBeLessThanOrEqual(98);
    expect(a.words).toHaveLength(7);
  });
  it('short recording scores lower than full-length', () => {
    const t = 'one two three four five six seven eight';
    expect(simulateSpeakingScore(t, 400).overall).toBeLessThan(simulateSpeakingScore(t, 4000).overall);
  });
  it('writing rubric rewards length', () => {
    const short = simulateWritingRubric('Village is nice.', 40);
    const long = simulateWritingRubric(
      'Living in the countryside has many advantages. The air is fresh and clean. People are friendly and helpful. Life is peaceful and quiet. Children can play in green fields. Food is fresh because farmers grow it nearby. I really love my hometown.', 40);
    expect(long.total).toBeGreaterThan(short.total);
    expect(long.total).toBeLessThanOrEqual(10);
    expect(long.criteria).toHaveLength(4);
  });
});
