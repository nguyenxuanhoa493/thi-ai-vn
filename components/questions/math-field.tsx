'use client';
import { useEffect, useRef, useState } from 'react';

type MathFieldEl = HTMLElement & { getValue: (fmt: string) => string; setValue?: (v: string, o?: { silenceNotifications?: boolean }) => void; value: string };

/** MathLive khi đã tải, fallback input thường trước đó / trong test */
export function MathField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const ref = useRef<MathFieldEl>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    import('mathlive').then(() => alive && setReady(true)).catch(() => {});
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    const handler = () => onChange(el.getValue('ascii-math'));
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [ready, onChange]);
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    if (el.getValue('ascii-math') !== value) el.setValue?.(value, { silenceNotifications: true });
  }, [ready, value]);
  if (!ready) {
    return (
      <input aria-label="Nhập đáp án" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-64 rounded-2xl border-2 border-lavender-soft bg-white px-4 py-3 text-lg outline-none focus:border-lavender" />
    );
  }
  return (
    <math-field ref={ref} aria-label="Nhập đáp án" math-virtual-keyboard-policy="auto"
      {...(disabled ? { 'read-only': '' } : {})}
      style={{ minWidth: 256, fontSize: 22, padding: '10px 16px', borderRadius: 16, border: '2px solid #eef0ff', background: '#fff' }} />
  );
}
