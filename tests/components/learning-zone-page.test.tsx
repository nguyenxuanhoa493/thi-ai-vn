// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LearningZonePage from '@/app/(app)/learning-zone/page';
import { useDemo } from '@/lib/store/demo-store';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
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

describe('LearningZonePage grade switch', () => {
  it('cancels the running session when the grade changes, and does not resume it on switching back', async () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); useDemo.getState().ensureZone('toan', 9); });
    render(<LearningZonePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Luyện ngay' }));
    expect(screen.getByRole('button', { name: 'Thoát' })).toBeInTheDocument();
    act(() => useDemo.getState().setGrade(12));
    act(() => useDemo.getState().setGrade(9));
    expect(screen.queryByRole('button', { name: 'Thoát' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Luyện ngay' })).toBeInTheDocument();
  });
});

describe('LearningZonePage expansion', () => {
  it('unlocks next level on a correct answer: toast, message, ring growth, badge', async () => {
    const { toast } = await import('sonner');
    const { prob } = await import('@/lib/engine/irt');
    const { LEVEL_B, LZ_K, MASTERY_P, pickNextQuestion } = await import('@/lib/engine/learning-zone');
    const { questionsFor } = await import('@/lib/bank');
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const skillId = 't9-hpt-khai-niem';
    const theta = 0.18; // just below NB mastery (prob(0.18,-1.5) ~ 0.843 < 0.85)
    const map = { [skillId]: { theta, unlockedLevel: 'NB' as const } };
    const pool = questionsFor('toan', 9).filter((q) => q.type !== 'write');
    const q = pickNextQuestion(pool, map, [], () => 0)!;
    expect(q.type).toBe('mcq');
    expect(prob(theta, LEVEL_B.NB)).toBeLessThan(MASTERY_P);
    const after = theta + LZ_K * (1 - prob(theta, q.b));
    expect(prob(after, LEVEL_B.NB)).toBeGreaterThanOrEqual(MASTERY_P);

    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); useDemo.getState().setZone('toan', 9, map); });
    render(<LearningZonePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Luyện ngay' }));
    const before = Number(screen.getByTestId('ring-learning').getAttribute('data-extent'));
    const letter = 'ABCDEF'[(q as { answer: number }).answer];
    const opt = [...document.querySelectorAll('button')].find((b) => b.textContent?.startsWith(letter))!;
    await userEvent.click(opt);
    await userEvent.click(screen.getByRole('button', { name: /Kiểm tra/ }));
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Vùng của em vừa mở rộng'));
    expect(screen.getAllByText(/Vùng của em vừa mở rộng/).length).toBeGreaterThan(0);
    expect(Number(screen.getByTestId('ring-learning').getAttribute('data-extent'))).toBeGreaterThan(before);
    expect(useDemo.getState().badges).toContain('zone-expand');
    expect(useDemo.getState().milestones.some((m) => m.kind === 'zone-expand' && m.subject === 'toan' && m.grade === 9)).toBe(true);
  });
});

describe('LearningZonePage meaning', () => {
  it('shows legend and positive wording, no negative wording', async () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); useDemo.getState().ensureZone('toan', 9); });
    const { container } = render(<LearningZonePage />);
    expect(screen.getByText(/Đã vững: không cần luyện thêm/)).toBeInTheDocument();
    expect(screen.getByText(/Vừa sức: câu hỏi em làm đúng khoảng 3\/4/)).toBeInTheDocument();
    expect(screen.getByText(/Sắp khám phá: sẽ mở khi em vững phần trước/)).toBeInTheDocument();
    expect(screen.getByText('🔭 Sắp khám phá')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Quá sức|QUÁ SỨC|Chưa tới|Chưa mở/);
    expect(screen.getByText(/Luyện thêm để vùng vừa sức của em rộng ra nhé/)).toBeInTheDocument();
  });
  it('summary shows growth vs baseline', () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); useDemo.getState().ensureZone('toan', 9); });
    act(() => {
      const z = useDemo.getState().zones['toan-9'];
      const grown = Object.fromEntries(Object.entries(z).map(([k]) => [k, { theta: 1.6, unlockedLevel: 'VDC' as const }]));
      useDemo.getState().setZone('toan', 9, grown);
    });
    render(<LearningZonePage />);
    expect(screen.getByText(/rộng thêm \+\d+% so với lần đầu/)).toBeInTheDocument();
  });
  it('existing zone without baseline: growth is positive after a setZone expansion', () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); });
    act(() => {
      const base = { 't9-hpt-khai-niem': { theta: 0, unlockedLevel: 'NB' as const } };
      useDemo.setState({ zones: { 'toan-9': base }, zoneBaseline: {} });
      useDemo.getState().setZone('toan', 9, { 't9-hpt-khai-niem': { theta: 1.6, unlockedLevel: 'VDC' as const } });
    });
    render(<LearningZonePage />);
    expect(screen.getByText(/rộng thêm \+\d+% so với lần đầu/)).toBeInTheDocument();
  });
  it('shows "Đang củng cố" without a percentage when p < 0.5, and a percentage when 0.5 <= p < 0.85', () => {
    act(() => { useDemo.getState().resetDemo(); useDemo.getState().setGrade(9); useDemo.getState().setZone('toan', 9, {
      't9-hpt-khai-niem': { theta: -2.5, unlockedLevel: 'TH' },
      't9-bpt': { theta: -0.2, unlockedLevel: 'TH' },
    }); });
    const { container } = render(<LearningZonePage />);
    expect(screen.getByText('Đang củng cố')).toBeInTheDocument();
    expect(container.textContent).toMatch(/~\d+% đúng ở mức/);
    expect(container.textContent).not.toMatch(/~(\d|1\d|2\d|3\d|4\d)% đúng/);
  });
});
