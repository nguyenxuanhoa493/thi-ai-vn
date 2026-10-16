// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { StreamText } from '@/components/questions/stream-text';
import { streamTokens } from '@/components/questions/math-text';

afterEach(() => { vi.useRealTimers(); });

describe('streamTokens', () => {
  it('splits words but keeps math and bold whole', () => {
    expect(streamTokens('Ta có $x^2 + 1$ và **đậm nhé**.\nXong')).toEqual(['Ta ', 'có ', '$x^2 + 1$', ' và ', '**đậm nhé**', '.', '\n', 'Xong']);
  });
});

describe('StreamText', () => {
  it('reveals tokens over time, full text is available to screen readers at once, onDone fires once', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { container } = render(<StreamText text="Một hai $x$ ba" speed={10} delay={10} onDone={onDone} />);
    const visual = container.querySelector('[data-stream]')!;
    expect(container.querySelector('.sr-only [role="math"]')).not.toBeNull();
    expect(visual.querySelectorAll('.stream-token')).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(25); });
    expect(visual.querySelectorAll('.stream-token').length).toBeGreaterThan(0);
    expect(onDone).not.toHaveBeenCalled();
    for (let i = 0; i < 10; i++) act(() => { vi.advanceTimersByTime(100); });
    expect(visual.querySelectorAll('.stream-token')).toHaveLength(4);
    expect(visual.querySelector('[role="math"]')).not.toBeNull();
    expect(visual.querySelector('.stream-caret')).toBeNull();
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
