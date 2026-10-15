// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

let pathname = '/';
const push = vi.fn();
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push }) }));
const play = vi.fn();
vi.mock('@/lib/ui/use-sfx', () => ({ useSfx: () => play }));

import { ChatWidget } from '@/components/chat/chat-widget';

beforeEach(() => { pathname = '/'; push.mockClear(); play.mockClear(); try { sessionStorage.clear(); } catch { /* */ } vi.useFakeTimers({ shouldAdvanceTime: true }); });
afterEach(() => { vi.useRealTimers(); });

const open = () => fireEvent.click(screen.getByRole('button', { name: 'Hỏi Bé Cú' }));
const type = (t: string) => {
  fireEvent.change(screen.getByLabelText('Nhập câu hỏi'), { target: { value: t } });
  fireEvent.submit(screen.getByLabelText('Nhập câu hỏi').closest('form')!);
};

describe('ChatWidget', () => {
  it('shows launcher with unread dot, opens and closes via button and Escape', async () => {
    render(<ChatWidget />);
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(screen.getByTestId('unread-dot')).toBeInTheDocument();
    open();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Nhập câu hỏi')).toHaveFocus();
    expect(screen.queryByTestId('unread-dot')).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng trò chuyện' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('returns focus to the launcher when closed via button or Escape', async () => {
    render(<ChatWidget />);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng trò chuyện' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(screen.getByRole('button', { name: 'Hỏi Bé Cú' })).toHaveFocus();
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(screen.getByRole('button', { name: 'Hỏi Bé Cú' })).toHaveFocus();
  });

  it('sends a message, shows typing then the reply, plays sfx', async () => {
    render(<ChatWidget />);
    open();
    type('Learning Zone là gì?');
    expect(play).toHaveBeenCalledWith('select');
    expect(screen.getByText('Learning Zone là gì?')).toBeInTheDocument();
    expect(screen.getByText('Bé Cú đang gõ…')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.queryByText('Bé Cú đang gõ…')).toBeNull();
    expect(screen.getByText(/vùng vừa sức/)).toBeInTheDocument();
  });

  it('chip click sends and link navigates', async () => {
    render(<ChatWidget />);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Learning Zone là gì?' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    fireEvent.click(screen.getByRole('button', { name: 'Vào Learning Zone →' }));
    expect(push).toHaveBeenCalledWith('/learning-zone');
  });

  it('is hidden in exam focus mode but not on /phong-thi list', () => {
    pathname = '/phong-thi/abc';
    const { container, rerender } = render(<ChatWidget />);
    expect(container).toBeEmptyDOMElement();
    pathname = '/phong-thi';
    rerender(<ChatWidget />);
    expect(screen.getByRole('button', { name: 'Hỏi Bé Cú' })).toBeInTheDocument();
  });
});
