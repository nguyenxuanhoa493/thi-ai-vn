// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: vi.fn() }) }));

import { Providers } from '@/components/providers';
import { LandingNav } from '@/components/landing/landing-nav';
import { useDemo } from '@/lib/store/demo-store';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  localStorage.clear();
});

describe('landing sound preference', () => {
  it('Providers rehydrates the persisted mute outside AppShell', async () => {
    useDemo.setState({ soundOn: true });
    localStorage.setItem('thi-ai-demo', JSON.stringify({ state: { ...useDemo.getState(), soundOn: false }, version: 1 }));
    await act(async () => { render(<Providers><div /></Providers>); });
    expect(useDemo.getState().soundOn).toBe(false);
  });
  it('landing nav shows a working sound toggle after hydration', async () => {
    useDemo.setState({ soundOn: true });
    await act(async () => { render(<Providers><LandingNav /></Providers>); });
    fireEvent.click(await screen.findByRole('button', { name: 'Tắt âm thanh' }));
    expect(useDemo.getState().soundOn).toBe(false);
    expect(screen.getByRole('button', { name: 'Bật âm thanh' })).toHaveTextContent('🔇');
  });
});
