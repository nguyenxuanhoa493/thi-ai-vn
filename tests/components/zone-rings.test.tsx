// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoneRings } from '@/components/zone/zone-rings';
import { makeSkill } from '../fixtures';

const skills = [makeSkill('A'), makeSkill('B', ['A'])];

describe('ZoneRings', () => {
  it('renders one dot per skill with zone label', () => {
    render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'TH' } }} showLabels />);
    expect(screen.getByTestId('dot-A')).toHaveAttribute('data-zone', 'learning');
    expect(screen.getByTestId('dot-B')).toHaveAttribute('data-zone', 'challenge');
    expect(screen.getByText('Skill A')).toBeInTheDocument();
  });
  it('learning ring grows with extent', () => {
    const { rerender } = render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'NB' } }} />);
    const small = Number(screen.getByTestId('ring-learning').getAttribute('data-extent'));
    rerender(<ZoneRings skills={skills} map={{ A: { theta: 1, unlockedLevel: 'VD' }, B: { theta: 0, unlockedLevel: 'TH' } }} />);
    const big = Number(screen.getByTestId('ring-learning').getAttribute('data-extent'));
    expect(big).toBeGreaterThan(small);
  });
});

describe('ZoneRings wording', () => {
  it('uses positive labels and lavender challenge dots', () => {
    const { container } = render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'TH' } }} showLabels />);
    expect(container.textContent).toContain('SẮP KHÁM PHÁ');
    expect(container.textContent).toContain('VỪA SỨC');
    expect(container.textContent).toContain('ĐÃ VỮNG');
    expect(container.textContent).not.toMatch(/QUÁ SỨC|Quá sức|Chưa tới/);
    expect(screen.getByTestId('dot-B')).toHaveAttribute('fill', '#b39dff');
    expect(screen.getByText('Skill B')).toBeInTheDocument();
    expect(container.querySelector('svg.lucide-lock')).toBeInTheDocument();
  });
  it('mini rings show the VỪA SỨC label', () => {
    const { container } = render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'TH' } }} />);
    expect(container.textContent).toContain('VỪA SỨC');
  });
});
