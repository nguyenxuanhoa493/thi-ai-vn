// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Typewriter } from '@/components/ui/typewriter';

afterEach(() => { vi.useRealTimers(); });

describe('Typewriter', () => {
  it('calls onDone exactly once after finishing', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { container } = render(<Typewriter text="abc" speed={10} onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    expect(container.textContent).toBe('abc');
    expect(onDone).toHaveBeenCalledTimes(1);
  });
  it('text change to a shorter text does not fire onDone early', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { rerender, container } = render(<Typewriter text="hello" speed={10} onDone={onDone} />);
    act(() => { vi.advanceTimersByTime(500); });
    expect(onDone).toHaveBeenCalledTimes(1);
    rerender(<Typewriter text="hi" speed={10} onDone={onDone} />);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain('hi');
    act(() => { vi.advanceTimersByTime(500); });
    expect(container.textContent).toBe('hi');
    expect(onDone).toHaveBeenCalledTimes(2);
  });
});
