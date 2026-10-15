// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionView } from '@/components/questions/question-view';
import { deterministicShuffle } from '@/components/questions/order';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: -0.5, explanation: '', hints: [], source: 'NXB' } as const;

describe('QuestionView', () => {
  it('mcq selects option', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'm', type: 'mcq', content: 'Chọn', options: ['$x=1$', 'B'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: /B/ }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
  it('tf4 toggles a statement', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 't', type: 'tf4', content: 'Xét', statements: ['s1', 's2', 's3', 's4'], answer: [true, true, true, true] };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Sai' })[1]);
    expect(onChange).toHaveBeenCalledWith([null, false, null, null]);
  });
  it('fill: clicking a chip fills the first empty blank', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'f', type: 'fill', content: 'Điền', text: 'A ___ B ___', bank: ['who', 'which'], answer: ['who', 'which'] };
    render(<QuestionView question={q} value={['', '']} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'which' }));
    expect(onChange).toHaveBeenCalledWith(['which', '']);
  });
  it('match: select left then right pairs them', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'mt', type: 'match', content: 'Ghép', left: ['L1', 'L2'], right: ['R1', 'R2'], answer: [1, 0] };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'L1' }));
    await userEvent.click(screen.getByRole('button', { name: 'R2' }));
    expect(onChange).toHaveBeenLastCalledWith([1, -1]);
  });
  it('reveal marks correct option', () => {
    const q: Question = { ...base, id: 'm2', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={1} onChange={() => {}} disabled reveal />);
    expect(screen.getByRole('button', { name: /A/ })).toHaveAttribute('data-result', 'correct');
    expect(screen.getByRole('button', { name: /B/ })).toHaveAttribute('data-result', 'wrong');
  });
  it('shows level and NXB badge', () => {
    const q: Question = { ...base, id: 'm3', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} index={3} />);
    expect(screen.getByText('Thông hiểu')).toBeInTheDocument();
    expect(screen.getByText(/NXB phê duyệt/)).toBeInTheDocument();
    expect(screen.getByText('Câu 3')).toBeInTheDocument();
  });
});

describe('deterministicShuffle', () => {
  it('is a stable non-identity permutation for n ≥ 2', () => {
    const a = deterministicShuffle(4, 'q1');
    expect([...a].sort()).toEqual([0, 1, 2, 3]);
    expect(a).toEqual(deterministicShuffle(4, 'q1'));
    expect(a).not.toEqual([0, 1, 2, 3]);
    expect(deterministicShuffle(2, 'x')).toEqual([1, 0]);
  });
});
