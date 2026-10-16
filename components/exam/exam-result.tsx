'use client';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, ChevronDown, Sparkles, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { ExamDef } from '@/lib/bank/exams';
import { skillName } from '@/lib/bank';
import type { Question } from '@/lib/bank/types';
import { LEVELS, LEVEL_LABEL } from '@/lib/bank/types';
import type { ExamResult } from '@/lib/engine/exam';
import { formatClock } from '@/lib/engine/exam';
import { examInsights } from '@/lib/engine/exam-insights';
import { MathText } from '@/components/questions/math-text';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { fireConfetti } from '@/lib/ui/confetti';

const OUTCOME = [
  { key: 'correct', label: 'Đúng', color: '#3ccf8e' },
  { key: 'partial', label: 'Đúng một phần', color: '#ffd166' },
  { key: 'wrong', label: 'Chưa đúng', color: '#ff8a65' },
] as const;
const LEVEL_COLOR = { NB: '#3ccf8e', TH: '#7c83db', VD: '#ffb54d', VDC: '#ff8a65' } as const;

export function ExamResultView({ exam, result, questions, onBack, onRetake }: { exam: ExamDef; result: ExamResult; questions: Question[]; onBack: () => void; onRetake?: () => void }) {
  const reduce = useReducedMotion();
  const [detail, setDetail] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { if (result.score10 >= 8) fireConfetti(); }, [result.score10]);
  const ins = useMemo(() => examInsights(result, questions, exam.durationMin, skillName), [result, questions, exam.durationMin]);
  const pie = OUTCOME.map((o) => ({ ...o, value: ins.outcome[o.key] })).filter((o) => o.value > 0);
  const levels = LEVELS.filter((l) => result.byLevel[l].total > 0).map((l) => ({
    level: l, label: LEVEL_LABEL[l], pct: Math.round((result.byLevel[l].correct / result.byLevel[l].total) * 100),
    text: `${result.byLevel[l].correct}/${result.byLevel[l].total}`,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <ClayCard className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:gap-8 sm:p-8 sm:text-left">
        <Owl state={result.score10 >= 5 ? 'celebrate' : 'cheer'} size={110} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted">Kết quả bài thi · {exam.title}</p>
          <p className="font-display text-5xl font-extrabold text-coral sm:text-7xl"><CountUp value={result.score10} format={(n) => n.toFixed(2).replace('.', ',')} /></p>
          <p className="text-muted">Đúng {result.correct}/{result.total} câu · Thời gian {formatClock(result.durationUsedSec)}
            {result.violations > 0 && <span className="ml-2 font-semibold text-peach-dark">· <TriangleAlert aria-hidden size={14} className="inline-block align-[-2px]" /> {result.violations} lần rời màn hình</span>}</p>
        </div>
      </ClayCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ClayCard className="space-y-2">
          <p className="font-bold">Tỉ lệ câu đúng</p>
          <div className="flex items-center gap-4">
            <div role="img" aria-label={`Đúng ${ins.outcome.correct}, đúng một phần ${ins.outcome.partial}, chưa đúng ${ins.outcome.wrong} câu`} className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="100%" paddingAngle={pie.length > 1 ? 3 : 0}
                    cornerRadius={6} stroke="none" startAngle={90} endAngle={-270} isAnimationActive={!reduce}>
                    {pie.map((p) => <Cell key={p.key} fill={p.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <p><span className="block font-display text-3xl font-extrabold">{Math.round((result.correct / Math.max(1, result.total)) * 100)}%</span><span className="text-xs text-muted">câu đúng</span></p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {OUTCOME.map((o) => (
                <li key={o.key} className="flex items-center gap-2">
                  <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: o.color }} />
                  {o.label}: <b>{ins.outcome[o.key]}</b>
                </li>
              ))}
            </ul>
          </div>
        </ClayCard>

        <ClayCard className="space-y-2">
          <p className="font-bold">Theo mức độ nhận thức</p>
          <div role="img" aria-label={`Tỉ lệ đúng theo mức độ: ${levels.map((l) => `${l.label} ${l.text}`).join(', ')}`} className="flex h-44 items-end gap-3 pt-2">
            {levels.map((l, i) => (
              <div key={l.level} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <span className="text-sm font-bold">{l.text}</span>
                <div className="relative w-full max-w-16 flex-1 overflow-hidden rounded-xl bg-lavender-soft">
                  <motion.div className="absolute inset-x-0 bottom-0 rounded-xl" style={{ background: LEVEL_COLOR[l.level] }}
                    initial={reduce ? false : { height: 0 }} animate={{ height: `${l.pct}%` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18, delay: reduce ? 0 : 0.1 * i }} />
                </div>
                <span className="text-center text-xs text-muted">{l.label}</span>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_1.1fr]">
        <ClayCard className="space-y-3">
          <p className="font-bold">Theo kiến thức</p>
          {ins.bySkill.map((s) => (
            <div key={s.skillId} className="space-y-1 text-sm">
              <div className="flex justify-between gap-3"><span className="truncate font-semibold">{skillName(s.skillId)}</span><span className="shrink-0 text-muted">{s.correct}/{s.total}</span></div>
              <ProgressBar value={s.ratio} color={s.ratio >= 0.8 ? 'mint' : s.ratio >= 0.5 ? 'lavender' : 'coral'} />
            </div>
          ))}
        </ClayCard>

        <ClayCard className="space-y-3 bg-gradient-to-br from-white to-lavender-soft">
          <p className="flex items-center gap-2 font-bold"><Sparkles aria-hidden size={18} className="text-lavender-dark" />Nhận xét của AI</p>
          <p className="font-semibold">{ins.headline}</p>
          <ul className="space-y-2 text-sm">
            {ins.notes.map((n, i) => (
              <motion.li key={n} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 0.2 + i * 0.15 }}
                className="flex gap-2"><span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lavender-dark" />{n}</motion.li>
            ))}
          </ul>
          <Link href="/learning-zone" className="inline-block text-sm font-bold text-coral">Luyện phần cần ôn ở Learning Zone →</Link>
        </ClayCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <ClayButton variant="secondary" aria-expanded={detail} aria-controls="exam-detail" onClick={() => setDetail((d) => !d)}>
          {detail ? 'Ẩn chi tiết bài làm' : 'Xem chi tiết bài làm'}<ChevronDown aria-hidden size={18} className={`ml-1.5 inline-block align-[-4px] transition-transform ${detail ? 'rotate-180' : ''}`} />
        </ClayButton>
        <ClayButton variant="ghost" onClick={onBack}>← Về danh sách bài thi</ClayButton>
        {onRetake && <ClayButton variant="ghost" onClick={onRetake}>Làm lại bài (demo)</ClayButton>}
      </div>

      <AnimatePresence initial={false}>
        {detail && (
          <motion.div id="exam-detail" key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <ClayCard className="space-y-2">
              <p className="font-bold">Chi tiết bài làm</p>
              {questions.map((q, i) => {
                const pq = result.perQuestion.find((p) => p.questionId === q.id);
                return (
                  <div key={q.id} className="rounded-xl border border-lavender-soft">
                    <button type="button" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id} className="flex w-full items-center gap-3 p-3 text-left">
                      <span className={`grid h-8 w-8 place-items-center rounded-lg font-bold ${pq?.correct ? 'bg-mint text-mint-dark' : pq && pq.fraction > 0 ? 'bg-[#fff1d6] text-[#b7791f]' : 'bg-peach text-peach-dark'}`}>{i + 1}</span>
                      <MathText text={q.content} className="line-clamp-1 flex-1 text-sm" />
                    </button>
                    {open === q.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden px-4 pb-4 text-sm">
                        <p className="font-semibold"><Bot aria-hidden size={16} className="inline-block align-[-3px] text-lavender-dark" /> Lời giải</p><MathText text={q.explanation} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
