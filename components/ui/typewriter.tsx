'use client';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

export function Typewriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) { setN(text.length); onDone?.(); return; }
    setN(0);
    const id = setInterval(() => setN((v) => {
      if (v >= text.length) { clearInterval(id); onDone?.(); return v; }
      return v + 1;
    }), speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span>{text.slice(0, n)}{n < text.length && <span className="animate-pulse">▍</span>}</span>;
}
