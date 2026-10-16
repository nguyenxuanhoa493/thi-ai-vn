'use client';
import { MathText } from './math-text';
import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { MatchQuestion } from '@/lib/bank/types';
import { deterministicShuffle } from './order';
import type { QuestionProps } from './types';

const PAIR_COLORS = ['#7c83db', '#ff8a65', '#22b07d', '#e0a800', '#e0559b', '#14a3c7'];

interface Line { d: string; color: string; key: string }

function Badge({ n, color }: { n: number | null; color?: string }) {
  return (
    <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold ${n === null ? 'border-2 border-dashed border-lavender text-transparent' : 'text-white'}`}
      style={n === null ? undefined : { background: color }}>
      {n ?? '·'}
    </span>
  );
}

export function MatchView({ question: q, value, onChange, disabled, reveal }: QuestionProps<MatchQuestion>) {
  const pairs = Array.isArray(value) && value.length === q.left.length ? (value as number[]) : q.left.map(() => -1);
  const [active, setActive] = useState<number | null>(null);
  const rightOrder = deterministicShuffle(q.right.length, q.id);
  const pairIndexOfRight = (r: number) => pairs.indexOf(r);
  const color = (li: number) => PAIR_COLORS[li % PAIR_COLORS.length];

  const box = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const pairsKey = pairs.join(',');

  // đường nối giữa hai ý đã ghép, vẽ lại khi ghép/đổi kích thước
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const draw = () => {
      const b = el.getBoundingClientRect();
      const next: Line[] = [];
      pairsKey.split(',').map(Number).forEach((r, li) => {
        const L = leftRefs.current[li]; const R = rightRefs.current[r];
        if (r < 0 || !L || !R) return;
        const lr = L.getBoundingClientRect(); const rr = R.getBoundingClientRect();
        const x1 = lr.right - b.left; const y1 = lr.top + lr.height / 2 - b.top;
        const x2 = rr.left - b.left; const y2 = rr.top + rr.height / 2 - b.top;
        const mx = (x1 + x2) / 2;
        next.push({ key: `${li}-${r}`, color: PAIR_COLORS[li % PAIR_COLORS.length], d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` });
      });
      setLines(next);
    };
    draw();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pairsKey]);

  const pickRight = (r: number) => {
    if (active === null) return;
    // bấm lại đúng ý đang ghép với ý trái đang chọn → bỏ ghép
    const next = pairs.map((p) => (p === r ? -1 : p));
    next[active] = pairs[active] === r ? -1 : r;
    onChange(next);
    setActive(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted" aria-live="polite">
        {active !== null
          ? <>Chọn ý bên phải để ghép với <b className="text-ink"><MathText text={q.left[active]} /></b></>
          : 'Chọn một ý bên trái, rồi chọn ý tương ứng bên phải.'}
      </p>
      <div ref={box} className="relative grid grid-cols-[1fr_56px_1fr] gap-y-3 sm:grid-cols-[1fr_96px_1fr]">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {lines.map((l) => (
            <motion.path key={l.key} d={l.d} fill="none" stroke={l.color} strokeWidth={3} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
          ))}
        </svg>
        <div className="col-start-1 space-y-3">
          {q.left.map((l, i) => {
            const paired = pairs[i] !== -1;
            const ok = reveal ? pairs[i] === q.answer[i] : null;
            const c = color(i);
            return (
              <motion.button key={l} ref={(el) => { leftRefs.current[i] = el; }} type="button" disabled={disabled} whileTap={{ scale: 0.97 }}
                onClick={() => setActive(active === i ? null : i)} data-paired={paired}
                style={paired && ok === null ? { borderColor: c, background: `${c}14` } : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold shadow-clay transition-colors
                  ${active === i ? 'border-coral! ring-4 ring-coral/25' : 'border-transparent'}
                  ${ok === true ? 'bg-mint' : ok === false ? 'bg-peach' : paired ? '' : 'bg-white'}`}>
                <Badge n={paired ? i + 1 : null} color={c} />
                <MathText text={l} className="min-w-0 flex-1" />
              </motion.button>
            );
          })}
        </div>
        <div className="col-start-3 space-y-3">
          {rightOrder.map((r) => {
            const li = pairIndexOfRight(r);
            const c = li === -1 ? undefined : color(li);
            return (
              <motion.button key={q.right[r]} ref={(el) => { rightRefs.current[r] = el; }} type="button" disabled={disabled || active === null} whileTap={{ scale: 0.97 }}
                onClick={() => pickRight(r)} data-paired={li !== -1}
                style={c && !reveal ? { borderColor: c, background: `${c}14` } : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 border-transparent p-4 text-left shadow-clay transition-colors disabled:cursor-default
                  ${li === -1 || reveal ? 'bg-white' : ''} ${active !== null ? 'hover:border-lavender!' : ''}`}>
                <Badge n={li === -1 ? null : li + 1} color={c} />
                <MathText text={q.right[r]} className="min-w-0 flex-1" />
              </motion.button>
            );
          })}
        </div>
      </div>
      {reveal && (
        <p className="text-sm text-muted">
          Đáp án: <MathText text={q.left.map((l, i) => `${l} → ${q.right[q.answer[i]]}`).join(' · ')} />
        </p>
      )}
    </div>
  );
}
