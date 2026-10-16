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
  it('typing into a write question (native textarea) does not play select', async () => {
    playSfx.mockClear();
    const onChange = vi.fn();
    const q = { ...base, id: 'wr', type: 'write', content: 'Viết', prompt: 'Viết đoạn văn', minWords: 1, sample: '', rubric: [] } as unknown as Question;
    render(<QuestionView question={q} value="" onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.type(screen.getByLabelText('Bài viết'), '12');
    expect(onChange).toHaveBeenLastCalledWith('2');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(playSfx).not.toHaveBeenCalled();
  });
  it('control: clicking an mcq option plays select', async () => {
    playSfx.mockClear();
    const q: Question = { ...base, id: 'mc', type: 'mcq', content: 'Chọn', options: ['A1', 'B1'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: /A1/ }));
    expect(playSfx).toHaveBeenCalledWith('select');
  });
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
  it('match: shows the same pair number on both paired items; re-picking unpairs', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'mt2', type: 'match', content: 'Ghép', left: ['L1', 'L2'], right: ['R1', 'R2'], answer: [1, 0] };
    render(<QuestionView question={q} value={[1, -1]} onChange={onChange} disabled={false} reveal={false} />);
    expect(screen.getByRole('button', { name: 'L1' })).toHaveAttribute('data-paired', 'true');
    expect(screen.getByRole('button', { name: 'R2' })).toHaveAttribute('data-paired', 'true');
    expect(screen.getByRole('button', { name: 'R1' })).toHaveAttribute('data-paired', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'L1' }));
    await userEvent.click(screen.getByRole('button', { name: 'R2' }));
    expect(onChange).toHaveBeenLastCalledWith([-1, -1]);
  });
  it('reveal marks correct option', () => {
    const q: Question = { ...base, id: 'm2', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={1} onChange={() => {}} disabled reveal />);
    expect(screen.getByRole('button', { name: /A/ })).toHaveAttribute('data-result', 'correct');
    expect(screen.getByRole('button', { name: /B/ })).toHaveAttribute('data-result', 'wrong');
  });
  it('shows level, without NXB badge', () => {
    const q: Question = { ...base, id: 'm3', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} index={3} />);
    expect(screen.getByText('Thông hiểu')).toBeInTheDocument();
    expect(screen.queryByText(/NXB phê duyệt/)).not.toBeInTheDocument();
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

describe('Task 19: image questions & MathText reveals', () => {
  const img = { src: '/images/questions/test.svg', alt: 'Tam giác vuông ABC' };
  it('renders the image with alt under the content', () => {
    const q = { ...base, id: 'im', type: 'mcq', content: 'Nhìn hình', options: ['A1', 'B1'], answer: 0, image: img } as Question;
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    const el = screen.getByRole('img', { name: img.alt });
    expect(el.getAttribute('src')).toBe(img.src);
  });
  it('no image → no img element', () => {
    const q: Question = { ...base, id: 'ni', type: 'mcq', content: 'Chọn', options: ['A1', 'B1'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('clicking the image opens a zoom dialog; Escape closes it', async () => {
    const q = { ...base, id: 'iz', type: 'mcq', content: 'Nhìn hình', options: ['A1', 'B1'], answer: 0, image: img } as Question;
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /phóng to/i }));
    const dlg = screen.getByRole('dialog');
    expect(dlg.getAttribute('aria-modal')).toBe('true');
    expect(screen.getAllByRole('img', { name: img.alt }).length).toBe(2);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('clicking the overlay closes the dialog', async () => {
    const q = { ...base, id: 'io', type: 'mcq', content: 'Nhìn hình', options: ['A1', 'B1'], answer: 0, image: img } as Question;
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: /phóng to/i }));
    await userEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('short reveal renders the correct answer through MathText', () => {
    const q: Question = { ...base, id: 'sr', type: 'short', content: 'Tính', answer: '$\\frac{3}{5}$' };
    const { container } = render(<QuestionView question={q} value="" onChange={() => {}} disabled reveal />);
    const reveal = screen.getByText(/Đáp án đúng/);
    expect(reveal.querySelector('[role="math"][aria-label="\\\\frac{3}{5}"]')).not.toBeNull();
    expect(container.textContent).not.toContain('$');
  });
  it('fill reveal renders answers through MathText', () => {
    const q: Question = { ...base, id: 'fr', type: 'fill', content: 'Điền', text: 'A ___ B ___', bank: ['$x^2$', 'b'], answer: ['$x^2$', 'b'] };
    render(<QuestionView question={q} value={['', '']} onChange={() => {}} disabled reveal />);
    const reveal = screen.getByText(/^Đáp án:/);
    expect(reveal.querySelector('[role="math"][aria-label="x^2"]')).not.toBeNull();
    expect(reveal.textContent).not.toContain('$');
  });
});

describe('Task 19 fix: lightbox focus & scroll lock', () => {
  const img = { src: '/images/questions/test.svg', alt: 'Hình thử' };
  const q = { ...base, id: 'fx', type: 'mcq', content: 'Nhìn hình', options: ['A1', 'B1'], answer: 0, image: img } as Question;
  it('focuses the close button on open and restores focus to the trigger on Escape', async () => {
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    const trigger = screen.getByRole('button', { name: /phóng to/i });
    await userEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Đóng' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('close button closes and restores focus', async () => {
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    const trigger = screen.getByRole('button', { name: /phóng to/i });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('locks body scroll while open and restores the previous value', async () => {
    document.body.style.overflow = 'scroll';
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: /phóng to/i }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });
});
