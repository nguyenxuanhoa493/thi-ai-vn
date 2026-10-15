// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/charts/skill-radar', () => ({ SkillRadar: () => <div>radar</div> }));
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  const React = await import('react');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) => React.cloneElement(children, { width: 600, height: 280 } as object),
  };
});

import DashboardPage from '@/app/(app)/dashboard/page';
import { useDemo } from '@/lib/store/demo-store';
import { toDateKey } from '@/lib/engine/gamification';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  useDemo.getState().resetDemo();
});

describe('Dashboard progress chart', () => {
  it('shows title and +N điểm summary with seeded grade 9 data', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Năng lực theo thời gian')).toBeInTheDocument();
    expect(screen.getByText(/\+\d+ điểm Toán sau 2 tuần/)).toBeInTheDocument();
  });
  it('shows empty state CTA for grade 12', () => {
    useDemo.getState().setGrade(12);
    render(<DashboardPage />);
    expect(screen.getByText('Năng lực theo thời gian')).toBeInTheDocument();
    expect(screen.getByText(/Chưa có dữ liệu tiến bộ/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Làm bài đánh giá' }).length).toBeGreaterThan(1);
  });
  it('one data point does not crash and says Mới bắt đầu', () => {
    useDemo.getState().setGrade(6);
    useDemo.setState({ progress: [{ date: toDateKey(new Date()), subject: 'toan', grade: 6, score: 40 }] });
    render(<DashboardPage />);
    expect(screen.getByText(/Mới bắt đầu/)).toBeInTheDocument();
  });
});
