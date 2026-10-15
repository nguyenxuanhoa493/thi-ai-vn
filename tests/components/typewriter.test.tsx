// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { Typewriter } from '@/components/ui/typewriter';

describe('Typewriter', () => {
  it('calls onDone exactly once after finishing', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { container } = render(<Typewriter text="abc" speed={10} onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    expect(container.textContent).toBe('abc');
    expect(onDone).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
