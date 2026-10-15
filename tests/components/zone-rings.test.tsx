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
