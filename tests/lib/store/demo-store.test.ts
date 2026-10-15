// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useDemo, createSeed, sanitizePersisted, zoneKey, STORE_VERSION } from '@/lib/store/demo-store';
import { questionsFor, skillsFor } from '@/lib/bank';
import { emptyAssessment, recordAssessmentAnswer, summarizeAssessment } from '@/lib/engine/assessment';
import { toDateKey } from '@/lib/engine/gamification';

const NOW = new Date(2026, 9, 16, 9, 0);

beforeEach(() => {
  localStorage.clear();
  useDemo.setState({ soundOn: true });
  useDemo.getState().resetDemo();
});

describe('seed', () => {
  it('has a believable demo profile', () => {
    const s = createSeed(NOW);
    expect(s.profile).toEqual({ name: 'Minh', grade: 9 });
    expect(s.streak).toEqual({ count: 6, lastDate: '2026-10-15' });
    expect(s.xp).toBe(1240);
    expect(s.history).toHaveLength(6);
    expect(s.zones).toEqual({});
    expect(s.version).toBe(STORE_VERSION);
  });
});

describe('sanitizePersisted', () => {
  it.each([null, 'garbage', 42, {}, { version: 0, profile: { name: 'x', grade: 9 } }, { version: STORE_VERSION, profile: { name: 'x', grade: 7 } }])(
    'falls back to seed for %j', (p) => {
      expect(sanitizePersisted(p, NOW)).toEqual(createSeed(NOW));
    });
  it('falls back when streak is malformed', () => {
    expect(sanitizePersisted({ ...createSeed(NOW), streak: { count: 'x' } }, NOW)).toEqual(createSeed(NOW));
  });
  it('nulls a malformed exam but keeps the rest', () => {
    const r = sanitizePersisted({ ...createSeed(NOW), xp: 5, exam: { examId: 'x' } }, NOW);
    expect(r.exam).toBeNull();
    expect(r.xp).toBe(5);
  });
  it('keeps valid data', () => {
    const valid = { ...createSeed(NOW), xp: 99 };
    expect(sanitizePersisted(valid, NOW).xp).toBe(99);
  });
});

describe('actions', () => {
  it('recordAnswer adds xp, combo, streak, today history', () => {
    const q = questionsFor('toan', 9)[0];
    const r1 = useDemo.getState().recordAnswer('toan', q, true);
    expect(r1.xp).toBeGreaterThan(0);
    expect(r1.combo).toBe(1);
    const st = useDemo.getState();
    expect(st.streak.lastDate).toBe(toDateKey(new Date()));
    const today = st.history.find((h) => h.date === toDateKey(new Date()) && h.subject === 'toan')!;
    expect(today.answered).toBe(1);
    expect(today.correct).toBe(1);
    const r2 = useDemo.getState().recordAnswer('toan', q, false);
    expect(r2).toMatchObject({ xp: 0, combo: 0 });
  });
  it('awards combo-5 badge exactly once', () => {
    const q = questionsFor('toan', 9)[0];
    const badges = [];
    for (let i = 0; i < 7; i++) badges.push(...useDemo.getState().recordAnswer('toan', q, true).newBadges);
    expect(badges).toEqual(['combo-5']);
  });
  it('saveAssessment seeds zone map from skill thetas', () => {
    const skills = skillsFor('toan', 9);
    let s = emptyAssessment();
    for (const q of questionsFor('toan', 9).slice(0, 6)) s = recordAssessmentAnswer(s, q, true);
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 });
    const badges = useDemo.getState().saveAssessment(sum);
    expect(badges).toEqual(['first-assessment']);
    const st = useDemo.getState();
    expect(st.assessments[zoneKey('toan', 9)]).toEqual(sum);
    expect(Object.keys(st.zones[zoneKey('toan', 9)]).length).toBeGreaterThan(0);
    expect(useDemo.getState().saveAssessment(sum)).toEqual([]);
  });
  it('ensureZone seeds per subject-grade without touching others', () => {
    const m6 = useDemo.getState().ensureZone('anh', 6);
    expect(Object.keys(m6).length).toBeGreaterThan(0);
    expect(useDemo.getState().zones[zoneKey('toan', 9)]).toBeUndefined();
    expect(useDemo.getState().ensureZone('anh', 6)).toBe(useDemo.getState().zones[zoneKey('anh', 6)]);
  });
  it('setGrade switches grade only', () => {
    useDemo.getState().setGrade(12);
    expect(useDemo.getState().profile.grade).toBe(12);
  });
  it('exam attempt persists and finishing stores result', () => {
    useDemo.getState().setExam({ examId: 'x', startedAt: 1, durationSec: 60, answers: { a: 1 }, flagged: [], violations: 2 });
    expect(JSON.parse(localStorage.getItem('thi-ai-demo')!).state.exam.violations).toBe(2);
    const badges = useDemo.getState().finishExam({ examId: 'x', score10: 8, correct: 1, total: 1, byLevel: { NB: { correct: 1, total: 1 }, TH: { correct: 0, total: 0 }, VD: { correct: 0, total: 0 }, VDC: { correct: 0, total: 0 } }, perQuestion: [], violations: 2, durationUsedSec: 10, submittedAt: 2 });
    expect(badges).toEqual(['first-exam']);
    expect(useDemo.getState().exam).toBeNull();
    expect(useDemo.getState().examResults.x.score10).toBe(8);
  });
  it('resetDemo restores seed', () => {
    useDemo.getState().setGrade(6);
    useDemo.getState().resetDemo();
    expect(useDemo.getState().profile.grade).toBe(9);
  });
});

describe('hydration resilience', () => {
  it('recovers from unparsable localStorage', async () => {
    localStorage.setItem('thi-ai-demo', '{bad');
    await useDemo.persist.rehydrate();
    expect(useDemo.persist.hasHydrated()).toBe(true);
    expect(useDemo.getState().profile).toEqual({ name: 'Minh', grade: 9 });
  });
});

describe('soundOn', () => {
  it('defaults to true and toggleSound flips it', () => {
    expect(createSeed(NOW).soundOn).toBe(true);
    useDemo.getState().toggleSound();
    expect(useDemo.getState().soundOn).toBe(false);
    useDemo.getState().toggleSound();
    expect(useDemo.getState().soundOn).toBe(true);
  });
  it('persists soundOn', () => {
    useDemo.getState().toggleSound();
    expect(JSON.parse(localStorage.getItem('thi-ai-demo')!).state.soundOn).toBe(false);
  });
  it('old persisted data without soundOn keeps progress and defaults to true', () => {
    const { soundOn: _omit, ...old } = createSeed(NOW);
    void _omit;
    const out = sanitizePersisted({ ...old, xp: 777 }, NOW);
    expect(out.xp).toBe(777);
    expect(out.soundOn).toBe(true);
  });
  it('non-boolean soundOn falls back to true; false is kept', () => {
    expect(sanitizePersisted({ ...createSeed(NOW), soundOn: 'x' }, NOW).soundOn).toBe(true);
    expect(sanitizePersisted({ ...createSeed(NOW), soundOn: false }, NOW).soundOn).toBe(false);
  });
  it('resetDemo keeps the sound preference', () => {
    useDemo.getState().toggleSound();
    useDemo.getState().resetDemo();
    expect(useDemo.getState().soundOn).toBe(false);
  });
});
