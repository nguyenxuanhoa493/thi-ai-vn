// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
const playSfx = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ui/sfx', () => ({ playSfx }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });

import { ExamRoom } from '@/components/exam/exam-room';
import { getExam } from '@/lib/bank/exams';
import { useDemo } from '@/lib/store/demo-store';
import { startAttempt } from '@/lib/engine/exam';

const exam = getExam('toan9-15p-can')!;
let clock = 1_000_000;
const now = () => clock;

beforeEach(() => { useDemo.getState().resetDemo(); clock = 1_000_000; playSfx.mockClear(); vi.useFakeTimers(); });
afterEach(() => vi.useRealTimers());

const tickCalls = () => playSfx.mock.calls.filter((c) => c[0] === 'tick').length;

describe('ExamRoom sounds', () => {
  it('no sound on mount, no tick while > 60s left', () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    act(() => { clock += 5000; vi.advanceTimersByTime(5000); });
    expect(playSfx).not.toHaveBeenCalled();
  });
  it('ticks once per displayed second when <= 60s, not every 500ms', () => {
    useDemo.getState().setExam(startAttempt(exam, clock - (exam.durationMin * 60 - 30) * 1000));
    render(<ExamRoom exam={exam} now={now} />);
    for (let i = 0; i < 6; i++) act(() => { clock += 500; vi.advanceTimersByTime(500); });
    expect(tickCalls()).toBeGreaterThanOrEqual(3);
    expect(tickCalls()).toBeLessThanOrEqual(4); // 6 intervals of 500ms = 3s, never 6 ticks
  });
  it('warning plays when the tab-switch modal opens', () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    fireEvent(document, new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    expect(playSfx).toHaveBeenCalledWith('warning');
  });
  it('manual submit plays submit once', () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận nộp' }));
    expect(playSfx.mock.calls.filter((c) => c[0] === 'submit')).toHaveLength(1);
  });
  it('auto submit on timeout plays submit', () => {
    useDemo.getState().setExam(startAttempt(exam, clock - (exam.durationMin * 60 - 1) * 1000));
    render(<ExamRoom exam={exam} now={now} />);
    act(() => { clock += 1500; vi.advanceTimersByTime(500); });
    expect(playSfx).toHaveBeenCalledWith('submit');
  });
});
