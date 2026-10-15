// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });

import { ExamRoom } from '@/components/exam/exam-room';
import { getExam } from '@/lib/bank/exams';
import { useDemo } from '@/lib/store/demo-store';
import { startAttempt } from '@/lib/engine/exam';

const exam = getExam('toan9-15p-can')!;
let clock = 1_000_000;
const now = () => clock;

beforeEach(() => { useDemo.getState().resetDemo(); clock = 1_000_000; });

describe('ExamRoom', () => {
  it('lobby requires accepting rules, then starts and persists attempt', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExamRoom exam={exam} now={now} />);
    const start = screen.getByRole('button', { name: 'Vào phòng thi' });
    expect(start).toBeDisabled();
    await user.click(screen.getByLabelText(/Tôi đã đọc và đồng ý/));
    await user.click(start);
    for (let i = 0; i < 4; i++) await act(async () => { vi.advanceTimersByTime(1000); });
    expect(await screen.findByText('15:00')).toBeInTheDocument();
    expect(useDemo.getState().exam?.examId).toBe(exam.id);
    vi.useRealTimers();
  });
  it('resumes in-progress attempt with remaining time from startedAt', () => {
    useDemo.getState().setExam({ ...startAttempt(exam, clock - 60_000), answers: {} });
    render(<ExamRoom exam={exam} now={now} />);
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });
  it('auto-submits when reopened after expiry', () => {
    useDemo.getState().setExam(startAttempt(exam, clock - 16 * 60_000));
    render(<ExamRoom exam={exam} now={now} />);
    expect(screen.getByText(/Kết quả bài thi/)).toBeInTheDocument();
    expect(useDemo.getState().examResults[exam.id]).toBeDefined();
    expect(useDemo.getState().exam).toBeNull();
  });
  it('tab switch records a violation and shows warning', () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    fireEvent(document, new Event('visibilitychange'));
    expect(useDemo.getState().exam?.violations).toBe(1);
    expect(screen.getByText(/rời khỏi màn hình làm bài/)).toBeInTheDocument();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  });
  it('submit confirmation warns about unanswered questions', async () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));
    expect(screen.getByText(new RegExp(`còn ${exam.questionIds.length} câu chưa làm`))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận nộp' }));
    expect(screen.getByText(/Kết quả bài thi/)).toBeInTheDocument();
  });
});
