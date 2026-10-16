// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClayButton } from '@/components/ui/clay-button';
import { LevelPill } from '@/components/ui/level-pill';
import { Owl } from '@/components/owl/owl';

describe('ui primitives', () => {
  it('ClayButton renders and is clickable', () => {
    render(<ClayButton>Bắt đầu</ClayButton>);
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeInTheDocument();
  });
  it('LevelPill shows Vietnamese label', () => {
    render(<LevelPill level="VDC" />);
    expect(screen.getByText('Vận dụng cao')).toBeInTheDocument();
  });
  it('Owl aria-label is Vietnamese per state', () => {
    render(<Owl state="correct" />);
    expect(screen.getByRole('img', { name: 'Bé Cú (vui vì em làm đúng)' })).toHaveAttribute('data-state', 'correct');
  });
  it.each(['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'cheer'] as const)('Owl renders state %s', (state) => {
    render(<Owl state={state} />);
    expect(screen.getByRole('img', { name: /Bé Cú/ })).toHaveAttribute('data-state', state);
  });
});
