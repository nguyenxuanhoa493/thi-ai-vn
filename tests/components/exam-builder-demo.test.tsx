// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamBuilderDemo } from '@/components/landing/exam-builder-demo';

describe('ExamBuilderDemo', () => {
  it('builds an exam from the matrix after a short "AI" delay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExamBuilderDemo />);
    await user.click(screen.getByRole('button', { name: 'Tạo đề' }));
    expect(screen.getByText(/Đang lấy câu từ ngân hàng/)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(await screen.findByText(/Đề đã sẵn sàng/)).toBeInTheDocument();
    expect(screen.getByText(/Mã phòng thi/)).toBeInTheDocument();
    vi.useRealTimers();
  });
  it('clears the pending build timer on unmount', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { unmount } = render(<ExamBuilderDemo />);
    await user.click(screen.getByRole('button', { name: 'Tạo đề' }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
  it('matrix stepper changes counts', async () => {
    render(<ExamBuilderDemo />);
    const plus = screen.getByRole('button', { name: 'Tăng Nhận biết' });
    const before = screen.getByTestId('count-NB').textContent;
    await userEvent.click(plus);
    expect(screen.getByTestId('count-NB').textContent).toBe(String(Number(before) + 1));
  });
});
