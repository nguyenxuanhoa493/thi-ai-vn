// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let pathname = '/dashboard';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { AppShell } from '@/components/layout/app-shell';
import { useDemo } from '@/lib/store/demo-store';

beforeEach(() => { pathname = '/dashboard'; useDemo.getState().resetDemo(); useDemo.setState({ soundOn: true }); });

describe('AppShell', () => {
  it('shows nav, streak and xp', async () => {
    render(<AppShell><p>nội dung</p></AppShell>);
    expect(await screen.findByText('nội dung')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learning Zone' })).toHaveAttribute('href', '/learning-zone');
    expect(screen.getByText('6')).toBeInTheDocument();
  });
  it('grade switch updates store', async () => {
    render(<AppShell><p>x</p></AppShell>);
    await userEvent.selectOptions(await screen.findByLabelText('Chọn lớp'), '12');
    expect(useDemo.getState().profile.grade).toBe(12);
  });
  it('hides nav in exam focus mode', async () => {
    pathname = '/phong-thi/toan9-45p-hpt';
    render(<AppShell><p>exam</p></AppShell>);
    expect(await screen.findByText('exam')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Learning Zone' })).toBeNull();
  });
  it('sound toggle flips store and label', async () => {
    render(<AppShell><p>x</p></AppShell>);
    await userEvent.click(await screen.findByRole('button', { name: 'Tắt âm thanh' }));
    expect(useDemo.getState().soundOn).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Bật âm thanh' }));
    expect(useDemo.getState().soundOn).toBe(true);
  });
});
