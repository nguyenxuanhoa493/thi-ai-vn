'use client';
import { motion } from 'motion/react';
import { useRef } from 'react';
import type { FillQuestion } from '@/lib/bank/types';
import type { QuestionProps } from './types';
import { MathText } from './math-text';

export function FillView({ question: q, value, onChange, disabled, reveal }: QuestionProps<FillQuestion>) {
  const dragged = useRef(false);
  const segments = q.text.split('___');
  const blanks = Array.isArray(value) && value.length === q.answer.length ? (value as string[]) : q.answer.map(() => '');
  const place = (word: string, target?: number) => {
    const i = target ?? blanks.findIndex((b) => !b);
    if (i < 0) return;
    onChange(blanks.map((b, j) => (j === i ? word : b === word ? '' : b)));
  };
  const clear = (i: number) => onChange(blanks.map((b, j) => (j === i ? '' : b)));

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-white p-5 text-lg leading-[2.6] shadow-clay">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blanks.length && (
              <motion.button type="button" data-blank={i} disabled={disabled} onClick={() => clear(i)} layout
                className={`mx-1 inline-flex min-w-24 justify-center rounded-xl border-2 border-dashed px-3 py-0.5 align-middle font-semibold
                  ${blanks[i] ? 'border-solid border-lavender bg-lavender-soft text-lavender-dark' : 'border-lavender text-transparent'}
                  ${reveal ? (blanks[i].toLowerCase() === q.answer[i].toLowerCase() ? '!border-mint-dark !bg-mint !text-mint-dark' : '!border-peach-dark !bg-peach !text-peach-dark') : ''}`}>
                {blanks[i] || '____'}
              </motion.button>
            )}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-3">
        {q.bank.map((w) => {
          const used = blanks.includes(w);
          return (
            <motion.button key={w} type="button" disabled={disabled || used} drag={!disabled && !used} dragSnapToOrigin
              whileDrag={{ scale: 1.1, zIndex: 10 }}
              onDragStart={() => { dragged.current = true; }}
              onDragEnd={(_, info) => {
                const x = info.point.x - window.scrollX, y = info.point.y - window.scrollY;
                const els = typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(x, y) : [];
                const el = els.map((e) => e.closest('[data-blank]')).find(Boolean);
                if (el) place(w, Number(el.getAttribute('data-blank')));
                setTimeout(() => { dragged.current = false; }, 0);
              }}
              onClick={() => { if (dragged.current) { dragged.current = false; return; } place(w); }}
              className={`rounded-xl px-4 py-2 font-semibold shadow-clay ${used ? 'bg-lavender-soft text-muted opacity-50' : 'bg-white text-ink'}`}>
              {w}
            </motion.button>
          );
        })}
      </div>
      {reveal && <p className="text-sm text-muted">Đáp án: <MathText text={q.answer.join(', ')} /></p>}
    </div>
  );
}
