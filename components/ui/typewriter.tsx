'use client';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function Typewriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const shown = reduce ? text.length : n;

  useEffect(() => {
    if (reduce) return;
    setN(0);
    const id = setInterval(() => setN((v) => Math.min(v + 1, text.length)), speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  useEffect(() => {
    if (shown >= text.length) doneRef.current?.();
  }, [shown, text]);

  return <span>{text.slice(0, shown)}{shown < text.length && <span className="animate-pulse">▍</span>}</span>;
}
