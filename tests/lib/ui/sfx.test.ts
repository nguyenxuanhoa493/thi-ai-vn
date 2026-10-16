// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const created: { oscs: { type: string; frequency: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> }; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[]; gains: number; resume: ReturnType<typeof vi.fn>; instances: number } =
  { oscs: [], gains: 0, resume: vi.fn(), instances: 0 };

class FakeCtx {
  currentTime = 0; state = 'suspended'; destination = {};
  constructor() { created.instances++; }
  resume() { (created.resume as unknown as () => void)(); this.state = 'running'; return Promise.resolve(); }
  createOscillator() {
    const o = { type: 'sine', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    created.oscs.push(o);
    return o;
  }
  createGain() {
    created.gains++;
    return { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 1 }, connect: vi.fn() };
  }
}

beforeEach(async () => {
  vi.resetModules();
  created.oscs = []; created.gains = 0; created.instances = 0; created.resume.mockClear();
  (window as unknown as { AudioContext?: unknown }).AudioContext = FakeCtx;
});
// vi.resetModules() gives each test a fresh store instance, so import both together
const load = async (soundOn = true) => {
  const { useDemo } = await import('@/lib/store/demo-store');
  useDemo.setState({ soundOn });
  return import('@/lib/ui/sfx');
};
afterEach(() => { delete (window as unknown as { AudioContext?: unknown }).AudioContext; });

describe('playSfx', () => {
  it('correct schedules at least two oscillators and starts them', async () => {
    const { playSfx } = await load();
    playSfx('correct');
    expect(created.oscs.length).toBeGreaterThanOrEqual(2);
    created.oscs.forEach((o) => { expect(o.start).toHaveBeenCalled(); expect(o.stop).toHaveBeenCalled(); });
    expect(created.resume).toHaveBeenCalled();
  });
  it('reuses one shared AudioContext', async () => {
    const { playSfx } = await load();
    playSfx('select'); playSfx('tick');
    expect(created.instances).toBe(1);
  });
  it('every sound name produces oscillators', async () => {
    const { playSfx } = await load();
    for (const n of ['select', 'correct', 'wrong', 'combo', 'complete', 'zoneExpand', 'tick', 'submit', 'warning'] as const) {
      created.oscs = []; playSfx(n);
      expect(created.oscs.length, n).toBeGreaterThan(0);
    }
  });
  it('is silent when muted', async () => {
    const { playSfx } = await load(false);
    playSfx('correct');
    expect(created.oscs).toHaveLength(0);
    expect(created.instances).toBe(0);
  });
  it('does not throw without AudioContext', async () => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    const { playSfx } = await load();
    expect(() => playSfx('correct')).not.toThrow();
  });
});
