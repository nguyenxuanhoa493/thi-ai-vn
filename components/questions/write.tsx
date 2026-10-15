'use client';
import type { WriteQuestion } from '@/lib/bank/types';
import { countWords } from '@/lib/bank/simulate';
import type { QuestionProps } from './types';

export function WriteView({ question: q, value, onChange, disabled }: QuestionProps<WriteQuestion>) {
  const text = typeof value === 'string' ? value : '';
  const n = countWords(text);
  return (
    <div className="space-y-3">
      <p className="font-semibold">{q.prompt}</p>
      <textarea aria-label="Bài viết" value={text} disabled={disabled} onChange={(e) => onChange(e.target.value)} rows={7}
        className="w-full rounded-2xl border-2 border-lavender-soft bg-white p-4 text-base leading-relaxed outline-none focus:border-lavender" />
      <p className={`text-right text-sm font-semibold ${n >= q.minWords ? 'text-mint-dark' : 'text-muted'}`}>{n} / {q.minWords} từ</p>
    </div>
  );
}
