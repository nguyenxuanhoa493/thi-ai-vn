'use client';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ExamDef } from '@/lib/bank/exams';
import type { Question } from '@/lib/bank/types';
import { LEVELS, LEVEL_LABEL } from '@/lib/bank/types';
import type { ExamResult } from '@/lib/engine/exam';
import { formatClock } from '@/lib/engine/exam';
import { MathText } from '@/components/questions/math-text';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { fireConfetti } from '@/lib/ui/confetti';

export function ExamResultView({ exam, result, questions, onBack }: { exam: ExamDef; result: ExamResult; questions: Question[]; onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { if (result.score10 >= 8) fireConfetti(); }, [result.score10]);
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <ClayCard className="flex items-center gap-8 p-8">
        <Owl state={result.score10 >= 5 ? 'celebrate' : 'cheer'} size={140} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted">Kết quả bài thi · {exam.title}</p>
          <p className="font-display text-7xl font-extrabold text-coral"><CountUp value={result.score10} format={(n) => n.toFixed(2).replace('.', ',')} /></p>
          <p className="text-muted">Đúng {result.correct}/{result.total} câu · Thời gian {formatClock(result.durationUsedSec)}
            {result.violations > 0 && <span className="ml-2 font-semibold text-peach-dark">· ⚠️ {result.violations} lần rời màn hình</span>}</p>
        </div>
      </ClayCard>
      <ClayCard className="space-y-3">
        <p className="font-bold">Phân tích theo mức độ</p>
        {LEVELS.filter((l) => result.byLevel[l].total > 0).map((l) => (
          <div key={l} className="grid grid-cols-[120px_1fr_60px] items-center gap-3 text-sm">
            <span className="font-semibold">{LEVEL_LABEL[l]}</span>
            <ProgressBar value={result.byLevel[l].correct / result.byLevel[l].total} color="mint" />
            <span className="text-right">{result.byLevel[l].correct}/{result.byLevel[l].total}</span>
          </div>
        ))}
      </ClayCard>
      <ClayCard className="space-y-2">
        <p className="font-bold">Xem lại bài làm</p>
        {questions.map((q, i) => {
          const pq = result.perQuestion.find((p) => p.questionId === q.id);
          return (
            <div key={q.id} className="rounded-xl border border-lavender-soft">
              <button type="button" onClick={() => setOpen(open === q.id ? null : q.id)} className="flex w-full items-center gap-3 p-3 text-left">
                <span className={`grid h-8 w-8 place-items-center rounded-lg font-bold ${pq?.correct ? 'bg-mint text-mint-dark' : pq && pq.fraction > 0 ? 'bg-[#fff1d6] text-[#b7791f]' : 'bg-peach text-peach-dark'}`}>{i + 1}</span>
                <MathText text={q.content} className="line-clamp-1 flex-1 text-sm" />
              </button>
              {open === q.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden px-4 pb-4 text-sm">
                  <p className="font-semibold">🤖 Lời giải</p><MathText text={q.explanation} />
                </motion.div>
              )}
            </div>
          );
        })}
      </ClayCard>
      <ClayButton onClick={onBack}>← Về danh sách bài thi</ClayButton>
    </div>
  );
}
