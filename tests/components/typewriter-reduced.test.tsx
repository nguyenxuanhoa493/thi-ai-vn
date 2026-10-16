// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { StrictMode } from 'react';
import { render } from '@testing-library/react';

vi.mock('motion/react', () => ({ useReducedMotion: () => true }));
import { Typewriter } from '@/components/ui/typewriter';

describe('Typewriter reduced motion', () => {
  it('shows full text and fires onDone once under StrictMode', () => {
    const onDone = vi.fn();
    const { container } = render(<StrictMode><Typewriter text="xin chào" onDone={onDone} /></StrictMode>);
    expect(container.textContent).toBe('xin chào');
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
