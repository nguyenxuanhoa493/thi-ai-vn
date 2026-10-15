import { describe, it, expect } from 'vitest';
import { prob, information, estimateTheta, thetaToScore, masteryLabel, updateThetaStep } from '@/lib/engine/irt';

describe('irt', () => {
  it('prob', () => {
    expect(prob(0, 0)).toBeCloseTo(0.5);
    expect(prob(1, 0)).toBeCloseTo(0.731, 3);
    expect(prob(-1, 0)).toBeCloseTo(0.269, 3);
  });
  it('information peaks at theta = b', () => {
    expect(information(0, 0)).toBeCloseTo(0.25);
    expect(information(2, 0)).toBeLessThan(information(0, 0));
  });
  it('estimateTheta with no responses returns prior', () => {
    const r = estimateTheta([]);
    expect(r.theta).toBeCloseTo(0, 1);
    expect(r.se).toBeCloseTo(1, 1);
  });
  it('estimateTheta moves with responses', () => {
    const right = Array.from({ length: 5 }, () => ({ b: 0, correct: true }));
    const wrong = Array.from({ length: 5 }, () => ({ b: 0, correct: false }));
    expect(estimateTheta(right).theta).toBeGreaterThan(0.5);
    expect(estimateTheta(wrong).theta).toBeLessThan(-0.5);
    expect(estimateTheta([...right, ...wrong]).theta).toBeCloseTo(0, 1);
    expect(estimateTheta(right).se).toBeLessThan(1);
  });
  it('estimateTheta respects prior mean', () => {
    expect(estimateTheta([], { mean: 1, sd: 0.8 }).theta).toBeCloseTo(1, 1);
  });
  it('thetaToScore clamps to 0..100', () => {
    expect(thetaToScore(-3)).toBe(0);
    expect(thetaToScore(0)).toBe(50);
    expect(thetaToScore(3)).toBe(100);
    expect(thetaToScore(10)).toBe(100);
    expect(thetaToScore(-10)).toBe(0);
  });
  it('masteryLabel', () => {
    expect(masteryLabel(39)).toBe('Cần cố gắng');
    expect(masteryLabel(40)).toBe('Trung bình');
    expect(masteryLabel(60)).toBe('Khá');
    expect(masteryLabel(80)).toBe('Giỏi');
  });
  it('updateThetaStep', () => {
    expect(updateThetaStep(0, 0, true)).toBeCloseTo(0.2);
    expect(updateThetaStep(0, 0, false)).toBeCloseTo(-0.2);
  });
});
