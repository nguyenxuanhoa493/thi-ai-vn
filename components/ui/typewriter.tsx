'use client';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function Typewriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const reduce = useReducedMotion();
  // counter is tied to the text it belongs to, so a text change never shows stale progress
  const [st, setSt] = useState({ text, n: 0 });
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; });
  const doneFor = useRef<string | null>(null);

  const shown = reduce ? text.length : st.text === text ? Math.min(st.n, text.length) : 0;
  const complete = shown >= text.length;

  useEffect(() => {
    if (reduce || complete) return;
    const id = setInterval(
      () => setSt((s) => ({ text, n: Math.min((s.text === text ? s.n : 0) + 1, text.length) })),
      speed,
    );
    return () => clearInterval(id);
  }, [text, speed, reduce, complete]);

  useEffect(() => {
    if (!complete) { doneFor.current = null; return; }
    if (doneFor.current === text) return;
    doneFor.current = text;
    doneRef.current?.();
  }, [complete, text]);

  return <span>{text.slice(0, shown)}{!complete && <span className="animate-pulse">▍</span>}</span>;
}
