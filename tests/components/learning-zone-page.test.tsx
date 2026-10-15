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

describe('LearningZonePage expansion', () => {
  it('unlocks next level on a correct answer: toast, message, ring growth, badge', async () => {
    const { toast } = await import('sonner');
    const { prob } = await import('@/lib/engine/irt');
    const { LEVEL_B, LZ_K, MASTERY_P, pickNextQuestion } = await import('@/lib/engine/learning-zone');
    const { questionsFor, skillsFor } = await import('@/lib/bank');
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
    expect(skillsFor('toan', 9).length).toBeGreaterThan(1);
  });
});
