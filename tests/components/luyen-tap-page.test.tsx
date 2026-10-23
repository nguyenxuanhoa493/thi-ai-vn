// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import LuyenTapPage from '@/app/(app)/luyen-tap/page';
import { useDemo } from '@/lib/store/demo-store';
import { chaptersFor } from '@/lib/bank';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('LuyenTapPage', () => {
  it('shows one thumb per chapter plus the mixed set, and follows grade changes', async () => {
    act(() => useDemo.getState().setGrade(9));
    render(<LuyenTapPage />);
    expect(screen.getByText(chaptersFor('toan', 9)[0].name)).toBeTruthy();
    expect(screen.getByText('Đề tổng hợp')).toBeTruthy();
    act(() => useDemo.getState().setGrade(12));
    expect(await screen.findByText(chaptersFor('toan', 12)[0].name)).toBeTruthy();
  });
});
