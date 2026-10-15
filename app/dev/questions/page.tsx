'use client';
import { useState } from 'react';
import { ALL_QUESTIONS } from '@/lib/bank';
import type { AnswerValue, QuestionType } from '@/lib/bank/types';
import { QuestionView } from '@/components/questions/question-view';
import { ClayCard } from '@/components/ui/clay-card';
import { ClayButton } from '@/components/ui/clay-button';
import { checkAnswer } from '@/lib/bank/check';

const TYPES: QuestionType[] = ['mcq', 'multi', 'tf4', 'short', 'order', 'match', 'fill', 'graph', 'listen', 'speak', 'write'];

export default function QuestionsDev() {
  const [vals, setVals] = useState<Record<string, AnswerValue>>({});
  const [rev, setRev] = useState<Record<string, boolean>>({});
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-10">
      {TYPES.map((t) => {
        const q = ALL_QUESTIONS.find((x) => x.type === t);
        if (!q) return <p key={t}>Thiếu dạng {t}</p>;
        return (
          <ClayCard key={t} className="space-y-4">
            <p className="font-mono text-xs text-muted">{t}</p>
            <QuestionView question={q} value={vals[q.id] ?? null} onChange={(v) => setVals((s) => ({ ...s, [q.id]: v }))} disabled={!!rev[q.id]} reveal={!!rev[q.id]} />
            <ClayButton onClick={() => setRev((s) => ({ ...s, [q.id]: !s[q.id] }))}>Kiểm tra</ClayButton>
            {rev[q.id] && <p>{JSON.stringify(checkAnswer(q, vals[q.id] ?? null))}</p>}
          </ClayCard>
        );
      })}
    </main>
  );
}
