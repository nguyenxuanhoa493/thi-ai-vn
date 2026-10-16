// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Activity } from 'react';
import { render, screen } from '@testing-library/react';
import { OwlBubble } from '@/components/owl/owl-bubble';

describe('OwlBubble inside a hidden Activity (Next cacheComponents keeps pages alive)', () => {
  it('shows the new text after the page becomes visible again', async () => {
    const ui = (mode: 'visible' | 'hidden', text: string) => <Activity mode={mode}><OwlBubble text={text} /></Activity>;
    const { rerender } = render(ui('visible', 'cũ'));
    rerender(ui('hidden', 'cũ'));
    rerender(ui('hidden', 'mới'));
    rerender(ui('visible', 'mới'));
    expect(await screen.findByText('mới', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.queryByText('cũ')).toBeNull();
  });
});
