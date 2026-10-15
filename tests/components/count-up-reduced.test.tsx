// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';

vi.mock('motion/react', () => ({ useReducedMotion: () => true, useInView: () => false, animate: (_from: number, to: number, o: { onUpdate: (v: number) => void }) => { o.onUpdate(to); return { stop() {} }; } }));
import { CountUp } from '@/components/ui/count-up';

describe('CountUp reduced motion', () => {
  it('server HTML starts at 0 (matches first client render), then shows the value', async () => {
    expect(renderToString(<CountUp value={40000} />)).toContain('>0<');
    render(<CountUp value={40000} />);
    expect(await screen.findByText('40.000')).toBeInTheDocument();
  });
});
