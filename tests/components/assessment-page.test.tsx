// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
vi.mock('@/components/charts/skill-radar', () => ({ SkillRadar: () => <div>radar</div> }));

import DanhGiaPage from '@/app/(app)/danh-gia/page';
import { useDemo, zoneKey } from '@/lib/store/demo-store';

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
});
