// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
vi.mock('@/components/questions/math-field', () => ({
  MathField: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input aria-label="Nhập đáp án" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock('@/components/charts/skill-radar', () => ({ SkillRadar: () => <div>radar</div> }));

import DanhGiaPage from '@/app/(app)/danh-gia/page';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { questionsFor, skillsFor } from '@/lib/bank';
import { emptyAssessment, nextAssessmentQuestion } from '@/lib/engine/assessment';

beforeEach(() => useDemo.getState().resetDemo());

describe('Assessment page', () => {
  it('runs 12 adaptive questions then shows report and saves it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DanhGiaPage />);
    await user.click(screen.getByRole('button', { name: /Bắt đầu đánh giá Toán/ }));
    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`${i + 1}/12`)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));
    }
    expect(screen.getByText(/AI đang phân tích/)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(await screen.findByText(/Báo cáo năng lực/)).toBeInTheDocument();
    expect(useDemo.getState().assessments[zoneKey('toan', 9)]).toBeDefined();
    vi.useRealTimers();
  });

  it('resets to intro and saves nothing when grade changes mid-run', async () => {
    const user = userEvent.setup();
    render(<DanhGiaPage />);
    await user.click(screen.getByRole('button', { name: /Bắt đầu đánh giá Toán/ }));
    for (let i = 0; i < 2; i++) await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));
    expect(screen.getByText('3/12')).toBeInTheDocument();
    act(() => useDemo.getState().setGrade(12));
    expect(await screen.findByRole('button', { name: /Bắt đầu đánh giá Toán/ })).toBeInTheDocument();
    expect(useDemo.getState().assessments[zoneKey('toan', 9)]).toBeUndefined();
    expect(useDemo.getState().assessments[zoneKey('toan', 12)]).toBeUndefined();
  });

  it('continues to 2/12 after answering via the Trả lời button', async () => {
    const user = userEvent.setup();
    render(<DanhGiaPage />);
    await user.click(screen.getByRole('button', { name: /Bắt đầu đánh giá Toán/ }));
    const first = nextAssessmentQuestion(questionsFor('toan', 9), skillsFor('toan', 9), emptyAssessment());
    if (first?.type !== 'short') throw new Error(`expected first question to be short, got ${first?.type}`);
    fireEvent.change(screen.getByLabelText('Nhập đáp án'), { target: { value: first.answer } });
    await user.click(screen.getByRole('button', { name: 'Trả lời' }));
    expect(await screen.findByText('2/12')).toBeInTheDocument();
  });
});
