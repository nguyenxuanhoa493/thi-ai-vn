// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LuyenTapPage from '@/app/(app)/luyen-tap/page';
import { useDemo } from '@/lib/store/demo-store';
import { chaptersFor } from '@/lib/bank';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('LuyenTapPage', () => {
  it('resets open chapter when grade changes', async () => {
    act(() => useDemo.getState().setGrade(9));
    render(<LuyenTapPage />);
    const name = new RegExp(chaptersFor('toan', 9)[0].name.slice(0, 20));
    // thẻ bộ đề cũng là button (truy cập bàn phím) nên chọn nút chương theo aria-expanded
    await userEvent.click(screen.getAllByRole('button', { name }).find((b) => b.hasAttribute('aria-expanded'))!);
    act(() => useDemo.getState().setGrade(12));
    const ch12 = chaptersFor('toan', 12)[0].name;
    expect((await screen.findAllByText(ch12)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Luyện nhanh/).length).toBeGreaterThan(0);
  });
});
