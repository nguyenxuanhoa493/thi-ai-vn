import confetti from 'canvas-confetti';
export function fireConfetti(opts: { origin?: { x: number; y: number } } = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  void confetti({ particleCount: 110, spread: 75, startVelocity: 38, origin: opts.origin ?? { x: 0.5, y: 0.6 },
    colors: ['#ff8a65', '#a8b5ff', '#c9f2dc', '#ffd166', '#ffb3a7'], scalar: 1.1 });
}
