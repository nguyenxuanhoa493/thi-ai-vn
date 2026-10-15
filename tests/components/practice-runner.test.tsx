// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeRunner } from '@/components/session/practice-runner';
import type { Question } from '@/lib/bank/types';

vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));

const mk = (id: string): Question => ({ id, subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: 0, source: 'NXB',
  content: `Đề ${id}`, explanation: `Giải ${id}`, hints: ['Gợi ý 1'], type: 'mcq', options: ['Đúng', 'Sai'], answer: 0 });

describe('PracticeRunner', () => {
  it('answers, shows feedback, advances and finishes at maxQuestions', async () => {
    const qs = [mk('a'), mk('b'), mk('c')];
    let i = 0;
    const onAnswered = vi.fn(() => ({ xp: 10, combo: 1, newBadges: [] }));
    render(<PracticeRunner title="T" maxQuestions={2} next={() => qs[i++] ?? null} onAnswered={onAnswered} onExit={() => {}} />);
    expect(screen.getByText('Đề a')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(onAnswered).toHaveBeenCalledWith(qs[0], { correct: true, fraction: 1 });
    expect(await screen.findByText(/Chính xác/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByText('Đề b')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Sai/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByText(/Hoàn thành phiên/)).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });
  it('finishes gracefully when next() runs out', async () => {
    render(<PracticeRunner title="T" maxQuestions={10} next={() => null} onAnswered={() => ({ xp: 0, combo: 0, newBadges: [] })} onExit={() => {}} />);
    expect(await screen.findByText(/Hoàn thành phiên/)).toBeInTheDocument();
  });
  it('Kiểm tra disabled until answered; hints reveal', async () => {
    render(<PracticeRunner title="T" maxQuestions={1} next={() => mk('a')} onAnswered={() => ({ xp: 0, combo: 0, newBadges: [] })} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Gợi ý/ }));
    expect(screen.getByText('Gợi ý 1')).toBeInTheDocument();
  });
  it('renders math in the AI explanation instead of raw LaTeX', async () => {
    const q = { ...mk('m'), explanation: 'Dạng $ax^2 + bx + c = 0$ với $a \\ne 0$, ví dụ $x^2$.' } as Question;
    render(<PracticeRunner title="T" maxQuestions={1} next={() => q} onAnswered={() => ({ xp: 0, combo: 0, newBadges: [] })} onExit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await screen.findByText(/AI giải thích/);
    expect(document.querySelector('[role="math"][aria-label="ax^2 + bx + c = 0"]')).not.toBeNull();
    expect(document.querySelector('[role="math"][aria-label="x^2"]')).not.toBeNull();
    expect(screen.queryByText(/\$ax\^2/)).toBeNull();
  });
});
