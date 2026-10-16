// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeRunner } from '@/components/session/practice-runner';
import type { Question } from '@/lib/bank/types';

vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
const playSfx = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ui/sfx', () => ({ playSfx }));

const mk = (id: string): Question => ({ id, subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: 0, source: 'NXB',
  content: `Đề ${id}`, explanation: `Giải ${id}`, hints: ['Gợi ý 1'], type: 'mcq', options: ['Đúng', 'Sai'], answer: 0 });

describe('PracticeRunner sounds', () => {
  const run = (combo: number, pick: RegExp, fraction?: number) => {
    playSfx.mockClear();
    const q = mk('s');
    render(<PracticeRunner title="T" maxQuestions={1} next={() => q} onAnswered={() => ({ xp: 1, combo, newBadges: [] })} onExit={() => {}} />);
    return { q, pick, fraction };
  };
  it('correct -> correct; no sound on initial render or answer selection beyond select', async () => {
    run(1, /Đúng/);
    expect(playSfx).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    expect(playSfx).toHaveBeenLastCalledWith('select');
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(playSfx).toHaveBeenLastCalledWith('correct');
  });
  it('wrong -> wrong', async () => {
    run(0, /Sai/);
    await userEvent.click(screen.getByRole('button', { name: /Sai/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(playSfx).toHaveBeenLastCalledWith('wrong');
  });
  it('combo >= 3 -> combo instead of correct', async () => {
    run(3, /Đúng/);
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(playSfx).toHaveBeenLastCalledWith('combo');
    expect(playSfx).not.toHaveBeenCalledWith('correct');
  });
  it('partial credit -> wrong', async () => {
    playSfx.mockClear();
    const q = { ...mk('p'), type: 'tf4', statements: ['A1', 'B1', 'C1', 'D1'], answer: [true, true, true, true] } as unknown as Question;
    render(<PracticeRunner title="T" maxQuestions={1} next={() => q} onAnswered={(_q, r) => { expect(r.fraction).toBeGreaterThan(0); expect(r.correct).toBe(false); return { xp: 0, combo: 0, newBadges: [] }; }} onExit={() => {}} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Đúng' })[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(playSfx).toHaveBeenLastCalledWith('wrong');
  });
  it('done screen -> complete', async () => {
    run(1, /Đúng/);
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    playSfx.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(playSfx).toHaveBeenCalledWith('complete');
    expect(playSfx.mock.calls.filter((c) => c[0] === 'complete')).toHaveLength(1);
  });
});

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
