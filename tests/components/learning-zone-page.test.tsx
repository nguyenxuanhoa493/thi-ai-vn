// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LearningZonePage from '@/app/(app)/learning-zone/page';
import { useDemo } from '@/lib/store/demo-store';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('LearningZonePage', () => {
  it('seeds a basic zone and shows rings', async () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); });
    render(<LearningZonePage />);
    expect(screen.getByRole('button', { name: 'Làm bài đánh giá' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Bắt đầu ở mức cơ bản' }));
    expect(screen.getByRole('img', { name: 'Sơ đồ Learning Zone' })).toBeInTheDocument();
  });
});
