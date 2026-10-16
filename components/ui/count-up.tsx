'use client';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const vi = (n: number) => Math.round(n).toLocaleString('vi-VN');

export function CountUp({ value, duration = 1.2, format = vi }: { value: number; duration?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  // luôn bắt đầu từ 0 để HTML server và lần render đầu ở client khớp nhau (tránh hydration mismatch khi reduced motion)
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView && !reduce) return;
    const c = animate(0, value, { duration: reduce ? 0 : duration, ease: [0.2, 0.9, 0.3, 1], onUpdate: setDisplay });
    return () => c.stop();
  }, [inView, value, duration, reduce]);
  return <span ref={ref}>{format(display)}</span>;
}
