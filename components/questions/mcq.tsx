'use client';
import { motion } from 'motion/react';
import type { ListenQuestion, McqQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import { resultClass, type QuestionProps } from './types';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function McqView({ question: q, value, onChange, disabled, reveal }: QuestionProps<McqQuestion | ListenQuestion>) {
  return (
    <div className="space-y-4">
      {q.type === 'listen' && (
        <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => speak(q.audioText)}
          className="flex items-center gap-3 rounded-2xl bg-peach px-5 py-3 font-semibold text-peach-dark shadow-clay">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white">▶</span> Nghe đoạn audio
        </motion.button>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const selected = value === i;
          const result = reveal ? (i === q.answer ? 'correct' : selected ? 'wrong' : null) : null;
          return (
            <motion.button key={i} type="button" disabled={disabled} data-result={result ?? undefined}
              whileHover={disabled ? undefined : { y: -2 }} whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => onChange(i)}
              className={`flex items-center gap-3 rounded-2xl ${result ? '' : 'bg-white'} p-4 text-left shadow-clay transition-colors ${selected && !reveal ? 'ring-2 ring-lavender' : ''} ${resultClass(result)}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${selected ? 'bg-lavender text-white' : 'bg-lavender-soft text-lavender-dark'}`}>{LETTERS[i]}</span>
              <MathText text={opt} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
