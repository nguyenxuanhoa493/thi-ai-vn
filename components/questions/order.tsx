'use client';
import { Reorder } from 'motion/react';
import type { OrderQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import type { QuestionProps } from './types';

export function deterministicShuffle(n: number, seed: string): number[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n >= 2 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

export function OrderView({ question: q, value, onChange, disabled, reveal }: QuestionProps<OrderQuestion>) {
  const answered = Array.isArray(value) && value.length === q.items.length;
  const order = answered ? (value as number[]) : deterministicShuffle(q.items.length, q.id);
  return (
    <div className="space-y-3">
      <Reorder.Group axis="y" values={order} onReorder={(v) => { if (!disabled) onChange(v); }} className="space-y-3">
        {order.map((itemIdx, pos) => {
          const ok = reveal ? itemIdx === q.answer[pos] : null;
          return (
            <Reorder.Item key={itemIdx} value={itemIdx} dragListener={!disabled}
              whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgb(184 192 255 / 0.6)' }}
              className={`flex cursor-grab items-center gap-4 rounded-2xl p-4 shadow-clay active:cursor-grabbing ${ok === true ? 'bg-mint' : ok === false ? 'bg-peach' : 'bg-white'}`}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-lavender-soft font-display font-bold text-lavender-dark">{pos + 1}</span>
              <MathText text={q.items[itemIdx]} className="flex-1" />
              <span className="text-muted">⋮⋮</span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      {!disabled && !answered && (
        <button type="button" onClick={() => onChange(order)}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-lavender-dark underline-offset-2 hover:underline">
          Giữ thứ tự này
        </button>
      )}
    </div>
  );
}
