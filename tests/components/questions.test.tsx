// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionView } from '@/components/questions/question-view';
import { deterministicShuffle } from '@/components/questions/order';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: -0.5, explanation: '', hints: [], source: 'NXB' } as const;

const playSfx = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ui/sfx', () => ({ playSfx }));

describe('QuestionView select sound', () => {
  it('plays select on user change only, not on render', async () => {
    playSfx.mockClear();
    const q: Question = { ...base, id: 'sm', type: 'mcq', content: 'Chọn', options: ['A1', 'B1'], answer: 0 };
    render(<QuestionView question={q} value={0} onChange={() => {}} disabled={false} reveal={false} />);
    expect(playSfx).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /B1/ }));
    expect(playSfx).toHaveBeenCalledWith('select');
    expect(playSfx).toHaveBeenCalledTimes(1);
  });
});

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

describe('fix round 1', () => {
  it('order: does not call onChange on mount; "Giữ thứ tự này" commits a permutation', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'o', type: 'order', content: 'Sắp', items: ['a', 'b', 'c'], answer: [0, 1, 2] };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Giữ thứ tự này' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect([...onChange.mock.calls[0][0]].sort()).toEqual([0, 1, 2]);
  });
  it('mcq reveal: correct option is bg-mint, not bg-white', () => {
    const q: Question = { ...base, id: 'm4', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={1} onChange={() => {}} disabled reveal />);
    const cls = screen.getByRole('button', { name: /A/ }).className.split(/\s+/);
    expect(cls).toContain('bg-mint');
    expect(cls).not.toContain('bg-white');
  });
  it('fill: drag end uses elementsFromPoint to target a blank', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'f2', type: 'fill', content: 'Điền', text: 'A ___ B ___', bank: ['who', 'which'], answer: ['who', 'which'] };
    const { container } = render(<QuestionView question={q} value={['', '']} onChange={onChange} disabled={false} reveal={false} />);
    const blank1 = container.querySelector('[data-blank="1"]')!;
    document.elementsFromPoint = vi.fn(() => [screen.getByRole('button', { name: 'who' }), blank1]);
    const chip = screen.getByRole('button', { name: 'who' });
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.pointerDown(chip, { clientX: 5, clientY: 5, button: 0, isPrimary: true });
    fireEvent.pointerMove(document, { clientX: 60, clientY: 60, isPrimary: true });
    fireEvent.pointerMove(document, { clientX: 120, clientY: 120, isPrimary: true });
    fireEvent.pointerUp(document, { clientX: 120, clientY: 120, isPrimary: true });
    await new Promise((r) => setTimeout(r, 50));
    expect(onChange).toHaveBeenCalledWith(['', 'who']);
  });
  it('speak: release before getUserMedia resolves stops the tracks', async () => {
    const stop = vi.fn();
    let resolve!: (s: unknown) => void;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => new Promise((r) => { resolve = r; }) } });
    const MR = vi.fn();
    vi.stubGlobal('MediaRecorder', MR);
    const onChange = vi.fn();
    const q: Question = { ...base, id: 's', type: 'speak', content: 'Nói', target: 'Hello' };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    const btn = screen.getByRole('button', { name: /Nhấn giữ/ });
    const { fireEvent, act } = await import('@testing-library/react');
    fireEvent.pointerDown(btn);
    fireEvent.pointerUp(btn);
    fireEvent.pointerUp(btn);
    expect(onChange).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ getTracks: () => [{ stop }] }); });
    expect(stop).toHaveBeenCalled();
    expect(MR).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
