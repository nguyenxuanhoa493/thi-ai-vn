// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
const radarSpy = vi.fn();
vi.mock('@/components/charts/skill-radar', () => ({
  SkillRadar: (p: { data: unknown[] }) => { radarSpy(p.data); return <div>radar</div>; },
}));

import DashboardPage from '@/app/(app)/dashboard/page';
import { skillsFor } from '@/lib/bank';
import { useDemo, zoneKey } from '@/lib/store/demo-store';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  radarSpy.mockClear();
  useDemo.getState().resetDemo();
});

describe('Dashboard', () => {
  it('greets and shows empty radar CTA before assessment', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Chào Minh/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Làm bài đánh giá/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lịch thi sắp tới/)).toBeInTheDocument();
  });
  it('works for grades without data (6 and 12)', () => {
    useDemo.getState().setGrade(12);
    expect(() => render(<DashboardPage />)).not.toThrow();
    useDemo.getState().setGrade(6);
    expect(() => render(<DashboardPage />)).not.toThrow();
  });
  it('radar only plots measured skills', () => {
    const [a, b] = skillsFor('toan', 9);
    useDemo.getState().saveAssessment({
      subject: 'toan', grade: 9, theta: 0, score: 50, label: 'Khá' as never, completedAt: new Date().toISOString(),
      skills: [
        { skillId: a.id, theta: 0.5, score: 60, answered: 2 },
        { skillId: b.id, theta: 0, score: 50, answered: 0 },
      ],
      strengths: [], weaknesses: [],
    });
    render(<DashboardPage />);
    const data = radarSpy.mock.calls.at(-1)![0] as { name: string }[];
    const zone = useDemo.getState().zones[zoneKey('toan', 9)];
    const expected = skillsFor('toan', 9).filter((s) => zone[s.id] || s.id === a.id).map((s) => s.name);
    expect(data.map((d) => d.name)).toEqual(expected);
    expect(data.length).toBeLessThan(skillsFor('toan', 9).length);
  });
});
