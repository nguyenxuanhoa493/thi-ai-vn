'use client';
import type { Tf4Question } from '@/lib/bank/types';
import { MathText } from './math-text';
import type { QuestionProps } from './types';

const LABELS = ['a', 'b', 'c', 'd'];

export function Tf4View({ question: q, value, onChange, disabled, reveal }: QuestionProps<Tf4Question>) {
  const cur = (Array.isArray(value) ? value : [null, null, null, null]) as (boolean | null)[];
  const set = (i: number, v: boolean) => onChange(cur.map((x, j) => (j === i ? v : x)));
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-clay">
      {q.statements.map((s, i) => {
        const ok = reveal ? cur[i] === q.answer[i] : null;
        return (
          <div key={i} className={`flex items-center gap-4 border-b border-lavender-soft px-5 py-4 last:border-0 ${ok === true ? 'bg-mint/50' : ok === false ? 'bg-peach/60' : ''}`}>
            <span className="font-display font-bold text-lavender-dark">{LABELS[i]})</span>
            <MathText text={s} className="flex-1" />
            {[true, false].map((v) => (
              <button key={String(v)} type="button" disabled={disabled} onClick={() => set(i, v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${cur[i] === v ? (v ? 'bg-mint-dark text-white' : 'bg-coral text-white') : 'bg-lavender-soft text-muted'}`}>
                {v ? 'Đúng' : 'Sai'}
              </button>
            ))}
            {reveal && <span className="w-16 text-right text-xs font-semibold text-muted">→ {q.answer[i] ? 'Đúng' : 'Sai'}</span>}
          </div>
        );
      })}
    </div>
  );
}
