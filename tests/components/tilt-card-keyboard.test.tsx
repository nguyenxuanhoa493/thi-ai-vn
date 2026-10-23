// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/phong-thi' }));

import PhongThiPage from '@/app/(app)/phong-thi/page';
import { TiltCard } from '@/components/ui/tilt-card';
import { useDemo } from '@/lib/store/demo-store';

beforeEach(() => { push.mockClear(); useDemo.getState().resetDemo(); });

describe('TiltCard keyboard access', () => {
  it('is a focusable button only when clickable', () => {
    const { rerender } = render(<TiltCard>x</TiltCard>);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<TiltCard onClick={() => {}}>x</TiltCard>);
    const b = screen.getByRole('button');
    expect(b).toHaveAttribute('tabindex', '0');
    expect(b.className).toContain('focus-visible:ring-2');
  });
  it('Enter and Space trigger onClick', () => {
    const fn = vi.fn();
    render(<TiltCard onClick={fn}>x</TiltCard>);
    const b = screen.getByRole('button');
    fireEvent.keyDown(b, { key: 'Enter' });
    fireEvent.keyDown(b, { key: ' ' });
    fireEvent.keyDown(b, { key: 'a' });
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it('Enter on a practice-set card navigates to the exam', () => {
    render(<PhongThiPage />);
    const card = screen.getAllByRole('button')[0];
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/phong-thi\/.+/));
  });
});

describe('Phòng thi card status', () => {
  it('shows in-progress even when the exam already has a result (retake)', async () => {
    const { examsFor } = await import('@/lib/bank/exams');
    const e = examsFor(9)[0];
    useDemo.setState({
      exam: { examId: e.id, startedAt: Date.now(), durationSec: 600, answers: {}, violations: 0 } as never,
      examResults: { [e.id]: { examId: e.id, score10: 7.5 } as never },
    });
    render(<PhongThiPage />);
    expect(screen.getByText(/Đang làm dở/)).toBeInTheDocument();
    expect(screen.queryByText(/Đã làm/)).toBeNull();
  });
});
