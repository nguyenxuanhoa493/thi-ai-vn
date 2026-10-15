'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { questionsFor } from '@/lib/bank';
import { LEVELS, LEVEL_LABEL, SUBJECT_LABEL, type Grade, type Level, type Question, type Subject } from '@/lib/bank/types';
import { buildExam, type Matrix } from '@/lib/engine/exam-builder';
import { MathText } from '@/components/questions/math-text';
import { LevelPill } from '@/components/ui/level-pill';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';

const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export function ExamBuilderDemo() {
  const [subject, setSubject] = useState<Subject>('toan');
  const [grade, setGrade] = useState<Grade>(9);
  const [matrix, setMatrix] = useState<Matrix>({ NB: 4, TH: 3, VD: 2, VDC: 1 });
  const [state, setState] = useState<'idle' | 'building' | 'done'>('idle');
  const [result, setResult] = useState<{ questions: Question[]; room: string } | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const step = (l: Level, d: number) => setMatrix((m) => ({ ...m, [l]: Math.max(0, Math.min(20, m[l] + d)) }));
  const build = () => {
    setState('building');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      const r = buildExam(questionsFor(subject, grade).filter((q) => q.type !== 'speak'), matrix);
      setResult({ questions: r.questions, room: code() });
      setState('done');
    }, 1200);
  };
  const total = LEVELS.reduce((s, l) => s + matrix[l], 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <ClayCard className="space-y-5">
        <div className="flex gap-2">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`flex-1 rounded-xl py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'bg-lavender-soft text-muted'}`}>{SUBJECT_LABEL[s]}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {([6, 9, 12] as Grade[]).map((g) => (
            <button key={g} type="button" onClick={() => setGrade(g)} className={`flex-1 rounded-xl py-2 font-semibold ${grade === g ? 'bg-coral text-white' : 'bg-cream text-muted'}`}>Lớp {g}</button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-muted">Ma trận đề</p>
          {LEVELS.map((l) => (
            <div key={l} className="flex items-center justify-between">
              <LevelPill level={l} />
              <div className="flex items-center gap-2">
                <button type="button" aria-label={`Giảm ${LEVEL_LABEL[l]}`} onClick={() => step(l, -1)} className="h-8 w-8 rounded-lg bg-lavender-soft font-bold">−</button>
                <span data-testid={`count-${l}`} className="w-6 text-center font-display font-bold">{matrix[l]}</span>
                <button type="button" aria-label={`Tăng ${LEVEL_LABEL[l]}`} onClick={() => step(l, 1)} className="h-8 w-8 rounded-lg bg-lavender-soft font-bold">+</button>
              </div>
            </div>
          ))}
          <p className="pt-1 text-right text-sm text-muted">Tổng: <b className="text-ink">{total} câu</b></p>
        </div>
        <ClayButton className="w-full" size="lg" onClick={build} disabled={state === 'building' || total === 0}>Tạo đề</ClayButton>
      </ClayCard>

      <ClayCard className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" className="flex h-full min-h-[380px] flex-col items-center justify-center gap-2 text-center text-muted">
              <p className="text-5xl">📝</p>
              <p>Chọn môn, lớp, ma trận mức độ rồi bấm <b className="text-ink">Tạo đề</b>.</p>
            </motion.div>
          )}
          {state === 'building' && (
            <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="font-semibold">Đang lấy câu từ ngân hàng 40.000 câu…</p>
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div key={i} className="h-14 rounded-xl bg-lavender-soft" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </motion.div>
          )}
          {state === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg font-extrabold text-mint-dark">✓ Đề đã sẵn sàng · {result.questions.length} câu</p>
                <span className="rounded-xl bg-coral px-3 py-1 font-mono font-bold text-white">Mã phòng thi: {result.room}</span>
              </div>
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {result.questions.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-xl bg-cream px-4 py-2.5 text-sm">
                    <span className="font-display font-bold text-coral">{i + 1}</span>
                    <MathText text={q.content} className="line-clamp-1 flex-1" />
                    <LevelPill level={q.level} /><NxbBadge />
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-muted">* Bản demo dùng câu mẫu; hệ thống thật chọn từ toàn bộ 40.000 câu đã duyệt.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </ClayCard>
    </div>
  );
}
