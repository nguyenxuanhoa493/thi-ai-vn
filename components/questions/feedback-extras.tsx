'use client';
import { motion } from 'motion/react';
import type { SpeakQuestion, WriteQuestion } from '@/lib/bank/types';
import { simulateSpeakingScore, simulateWritingRubric } from '@/lib/bank/simulate';
import { ProgressBar } from '@/components/ui/progress-bar';

export function SpeakFeedback({ question, durationMs }: { question: SpeakQuestion; durationMs: number }) {
  const s = simulateSpeakingScore(question.target, durationMs);
  return (
    <div className="space-y-2">
      <p className="font-semibold">AI chấm phát âm: <span className="font-display text-2xl text-coral">{s.overall}</span>/100</p>
      <div className="flex flex-wrap gap-1.5">
        {s.words.map((w, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-lg px-2 py-1 text-sm font-semibold ${w.ok ? 'bg-mint text-mint-dark' : 'bg-peach text-peach-dark'}`}>{w.word}</motion.span>
        ))}
      </div>
    </div>
  );
}

export function WritingFeedback({ question, text }: { question: WriteQuestion; text: string }) {
  const r = simulateWritingRubric(text, question.minWords);
  return (
    <div className="space-y-3">
      <p className="font-semibold">AI chấm bài viết: <span className="font-display text-2xl text-coral">{r.total}</span>/10</p>
      {r.criteria.map((c) => (
        <div key={c.name}>
          <div className="flex justify-between text-sm"><span className="font-semibold">{c.name}</span><span>{c.score}/{c.max}</span></div>
          <ProgressBar value={c.score / c.max} color="mint" className="my-1" />
          <p className="text-xs text-muted">{c.comment}</p>
        </div>
      ))}
    </div>
  );
}
