import { useDemo } from '@/lib/store/demo-store';

export type SfxName = 'select' | 'correct' | 'wrong' | 'combo' | 'complete' | 'zoneExpand' | 'tick' | 'submit' | 'warning';

interface Note { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number; glideTo?: number }

const MASTER = 0.2;
const N = { C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, F5: 698.46, C6: 1046.5, E6: 1318.5, G6: 1568, B6: 1975.5, C7: 2093 };

/** Mỗi âm = vài nốt ngắn, sóng sine/triangle mềm để hợp phong cách Pastel Clay. */
const RECIPES: Record<SfxName, Note[]> = {
  select: [{ freq: 660, at: 0, dur: 0.06, gain: 0.8 }],
  correct: [{ freq: N.C6, at: 0, dur: 0.09 }, { freq: N.E6, at: 0.09, dur: 0.12 }],
  wrong: [{ freq: 220, at: 0, dur: 0.14, type: 'triangle', gain: 0.5, glideTo: 180 }],
  combo: [N.C5, N.E5, N.G5, N.C6].map((freq, i) => ({ freq, at: i * 0.07, dur: 0.12 })),
  complete: [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].map((freq, i) => ({ freq, at: i * 0.1, dur: i === 5 ? 0.4 : 0.16 })),
  zoneExpand: [N.E6, N.G6, N.B6, N.C7, N.E6 * 2].map((freq, i) => ({ freq, at: i * 0.06, dur: 0.1, gain: 0.7 })),
  tick: [{ freq: 1000, at: 0, dur: 0.025, gain: 0.35 }],
  submit: [{ freq: N.G5, at: 0, dur: 0.1 }, { freq: N.C6, at: 0.1, dur: 0.18 }],
  warning: [{ freq: N.A5, at: 0, dur: 0.12, type: 'triangle', gain: 0.7 }, { freq: N.F5, at: 0.16, dur: 0.14, type: 'triangle', gain: 0.7 }],
};

type Ctor = new () => AudioContext;
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  const C = w.AudioContext ?? w.webkitAudioContext;
  if (!C) return null;
  try { ctx = new C(); } catch { return null; }
  return ctx;
}

export function playSfx(name: SfxName): void {
  try {
    if (!useDemo.getState().soundOn) return;
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended' || (c.state as string) === 'interrupted') void c.resume()?.catch?.(() => {});
    const t0 = c.currentTime;
    for (const n of RECIPES[name]) {
      const start = t0 + n.at;
      const end = start + n.dur;
      const peak = MASTER * (n.gain ?? 1);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = n.type ?? 'sine';
      osc.frequency.setValueAtTime(n.freq, start);
      if (n.glideTo) osc.frequency.exponentialRampToValueAtTime(n.glideTo, end);
      // ADSR ngắn: attack 8ms rồi giảm dần để không bị "tạch"
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(peak, start + Math.min(0.008, n.dur / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch { /* âm thanh chỉ là phần thêm, không bao giờ làm hỏng UI */ }
}
