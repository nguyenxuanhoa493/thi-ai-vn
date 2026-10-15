'use client';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { MatchQuestion } from '@/lib/bank/types';
import { deterministicShuffle } from './order';
import type { QuestionProps } from './types';

const PAIR_COLORS = ['#a8b5ff', '#ff8a65', '#3ccf8e', '#ffd166', '#f472b6', '#22d3ee'];

export function MatchView({ question: q, value, onChange, disabled, reveal }: QuestionProps<MatchQuestion>) {
  const pairs = Array.isArray(value) && value.length === q.left.length ? (value as number[]) : q.left.map(() => -1);
  const [active, setActive] = useState<number | null>(null);
  const rightOrder = deterministicShuffle(q.right.length, q.id);
  const pairIndexOfRight = (r: number) => pairs.indexOf(r);

  const pickRight = (r: number) => {
    if (active === null) return;
    const next = pairs.map((p) => (p === r ? -1 : p));
    next[active] = r;
    onChange(next);
    setActive(null);
  };

  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-3">
      <div className="space-y-3">
        {q.left.map((l, i) => {
          const paired = pairs[i] !== -1;
          const ok = reveal ? pairs[i] === q.answer[i] : null;
          return (
            <motion.button key={l} type="button" disabled={disabled} whileTap={{ scale: 0.97 }} onClick={() => setActive(i)}
              style={paired && !reveal ? { boxShadow: `inset 6px 0 0 ${PAIR_COLORS[i % PAIR_COLORS.length]}` } : undefined}
              className={`w-full rounded-2xl p-4 text-left font-semibold shadow-clay ${active === i ? 'ring-2 ring-coral' : ''} ${ok === true ? 'bg-mint' : ok === false ? 'bg-peach' : 'bg-white'}`}>
              {l}
            </motion.button>
          );
        })}
      </div>
      <div className="space-y-3">
        {rightOrder.map((r) => {
          const li = pairIndexOfRight(r);
          return (
            <motion.button key={q.right[r]} type="button" disabled={disabled || active === null} whileTap={{ scale: 0.97 }} onClick={() => pickRight(r)}
              style={li !== -1 && !reveal ? { boxShadow: `inset -6px 0 0 ${PAIR_COLORS[li % PAIR_COLORS.length]}` } : undefined}
              className={`w-full rounded-2xl bg-white p-4 text-left shadow-clay ${active !== null ? 'hover:ring-2 hover:ring-lavender' : ''}`}>
              {q.right[r]}
            </motion.button>
          );
        })}
      </div>
      {reveal && (
        <p className="col-span-2 text-sm text-muted">
          Đáp án: {q.left.map((l, i) => `${l} → ${q.right[q.answer[i]]}`).join(' · ')}
        </p>
      )}
    </div>
  );
}
