// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getQuestion } from '@/lib/bank';
import type { McqQuestion } from '@/lib/bank/types';
import { MiniQuiz, QUIZ_IDS } from '@/components/landing/mini-quiz';
import { Faq } from '@/components/landing/faq';
import { Hero } from '@/components/landing/hero';
import Home from '@/app/page';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  try { localStorage.clear(); } catch { /* noop */ }
});

describe('MiniQuiz', () => {
  it('uses existing bank ids', () => {
    expect(QUIZ_IDS).toHaveLength(3);
    for (const id of QUIZ_IDS) expect(getQuestion(id)).toBeDefined();
  });
  it('correct answer reveals result, owl turns correct, then moves to next', async () => {
    const user = userEvent.setup();
    render(<MiniQuiz />);
    const q = getQuestion(QUIZ_IDS[0]) as McqQuestion;
    expect(screen.getAllByRole('img', { name: /Bé Cú/ })[0]).toHaveAttribute('data-state', 'idle');
    await user.click(screen.getAllByRole('button')[q.answer]);
    expect(screen.getAllByRole('img', { name: /Bé Cú/ })[0]).toHaveAttribute('data-state', 'thinking');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(screen.getAllByRole('img', { name: /Bé Cú/ })[0]).toHaveAttribute('data-state', 'correct');
    expect(screen.getByText(/Chính xác/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Câu tiếp' }));
    expect(screen.getByText(/Câu 2\/3/)).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /Bé Cú/ })[0]).toHaveAttribute('data-state', 'idle');
  });
  it('wrong answer makes the owl sad', async () => {
    const user = userEvent.setup();
    render(<MiniQuiz />);
    const q = getQuestion(QUIZ_IDS[0]) as McqQuestion;
    await user.click(screen.getAllByRole('button')[(q.answer + 1) % q.options.length]);
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(screen.getAllByRole('img', { name: /Bé Cú/ })[0]).toHaveAttribute('data-state', 'wrong');
  });
});

describe('Faq', () => {
  it('toggles aria-expanded', async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const btns = screen.getAllByRole('button');
    expect(btns.length).toBeGreaterThanOrEqual(5);
    expect(btns[0]).toHaveAttribute('aria-expanded', 'false');
    await user.click(btns[0]);
    expect(btns[0]).toHaveAttribute('aria-expanded', 'true');
    await user.click(btns[0]);
    expect(btns[0]).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Hero owl', () => {
  it('click changes the bubble text and celebrates', async () => {
    const user = userEvent.setup();
    render(<Hero />);
    expect(screen.getByText(/Chào em! Mình là Bé Cú/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Bé Cú/ }));
    expect(screen.queryByText(/Chào em! Mình là Bé Cú/)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Bé Cú/ })).toHaveAttribute('data-state', 'celebrate');
  });
});

describe('Landing page', () => {
  it('renders all blocks with empty localStorage', () => {
    render(<Home />);
    for (const t of [/Thử ngay 1 câu/, /Cách hoạt động/, /11 dạng câu hỏi/, /Báo cáo cho phụ huynh/, /Câu hỏi thường gặp/]) {
      expect(screen.getAllByText(t).length).toBeGreaterThan(0);
    }
  });
});
