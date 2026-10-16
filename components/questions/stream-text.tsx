'use client';
import { useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MathText, renderPiece, streamTokens } from './math-text';

/** Hiện lời giải như AI đang "gõ": từng từ hiện mờ dần lên, công thức hiện nguyên khối, con trỏ nhấp nháy ở cuối.
 *  Trình đọc màn hình nhận toàn bộ nội dung ngay (bản sr-only), phần chạy hiệu ứng ẩn với nó. */
export function StreamText({ text, speed = 38, delay = 250, className = '', onDone, onProgress }: {
  text: string; speed?: number; delay?: number; className?: string; onDone?: () => void; onProgress?: () => void;
}) {
  const reduce = useReducedMotion();
  const tokens = useMemo(() => streamTokens(text), [text]);
  // bộ đếm gắn với văn bản của nó: đổi câu không bao giờ hiện tiến độ cũ
  const [st, setSt] = useState({ text, n: 0 });
  const shown = reduce ? tokens.length : st.text === text ? Math.min(st.n, tokens.length) : 0;
  const complete = shown >= tokens.length;
  const doneRef = useRef(onDone);
  const progressRef = useRef(onProgress);
  useEffect(() => { doneRef.current = onDone; progressRef.current = onProgress; });
  useEffect(() => { progressRef.current?.(); }, [shown]);

  useEffect(() => {
    if (reduce || complete) return;
    const step = () => setSt((s) => ({ text, n: (s.text === text ? s.n : 0) + 1 }));
    // khựng nhẹ lúc đầu như AI đang "nghĩ", sau đó đều tay; công thức dài thì chờ lâu hơn chút
    const next = tokens[shown] ?? '';
    const wait = shown === 0 ? delay : speed + (next.startsWith('$') ? Math.min(160, next.length * 4) : 0);
    const id = setTimeout(step, wait);
    return () => clearTimeout(id);
  }, [text, tokens, shown, speed, delay, reduce, complete]);

  useEffect(() => { if (complete) doneRef.current?.(); }, [complete]);

  return (
    <span className={className}>
      <span className="sr-only"><MathText text={text} /></span>
      <span aria-hidden="true" data-stream>
        {tokens.slice(0, shown).map((t, i) => (t === '\n'
          ? <br key={i} />
          : <span key={i} className="stream-token">{renderPiece(t, i)}</span>))}
        {!complete && <span className="stream-caret" />}
      </span>
    </span>
  );
}
