'use client';
import { motion } from 'motion/react';
import type { MultiQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import { resultClass, type QuestionProps } from './types';

export function MultiView({ question: q, value, onChange, disabled, reveal }: QuestionProps<MultiQuestion>) {
  const sel = Array.isArray(value) ? (value as number[]) : [];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Có thể chọn nhiều đáp án</p>
      {q.options.map((opt, i) => {
        const on = sel.includes(i);
        const should = q.answer.includes(i);
        const result = reveal ? (should && on ? 'correct' : on ? 'wrong' : should ? 'missed' : null) : null;
        return (
          <motion.button key={i} type="button" disabled={disabled} data-result={result ?? undefined} whileTap={{ scale: 0.98 }}
            onClick={() => onChange(on ? sel.filter((x) => x !== i) : [...sel, i])}
            className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-clay ${on && !reveal ? 'ring-2 ring-lavender' : ''} ${resultClass(result)}`}>
            <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }}
              className={`grid h-7 w-7 place-items-center rounded-lg border-2 ${on ? 'border-lavender bg-lavender text-white' : 'border-lavender-soft'}`}>{on ? '✓' : ''}</motion.span>
            <MathText text={opt} />
          </motion.button>
        );
      })}
    </div>
  );
}
