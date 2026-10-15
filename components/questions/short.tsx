'use client';
import type { ShortQuestion } from '@/lib/bank/types';
import { checkAnswer } from '@/lib/bank/check';
import { MathField } from './math-field';
import type { QuestionProps } from './types';

export function ShortView({ question: q, value, onChange, disabled, reveal }: QuestionProps<ShortQuestion>) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="font-semibold">Đáp án:</span>
      <MathField value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} />
      {q.unit && <span className="text-muted">{q.unit}</span>}
      {reveal && (() => {
        const mine = typeof value === 'string' ? value.trim() : '';
        const ok = mine !== '' && checkAnswer(q, mine).correct;
        return (
          <>
            <span className={`rounded-xl px-3 py-1.5 font-semibold ${ok ? 'bg-mint text-mint-dark' : 'bg-peach text-peach-dark'}`}>
              {ok ? 'Bạn trả lời đúng' : `Bạn trả lời: ${mine || '(bỏ trống)'}`}
            </span>
            <span className="rounded-xl bg-mint px-3 py-1.5 font-semibold text-mint-dark">Đáp án đúng: {q.answer}</span>
          </>
        );
      })()}
    </div>
  );
}
