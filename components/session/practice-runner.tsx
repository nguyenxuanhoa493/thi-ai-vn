'use client';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Flame, Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AnswerValue, Question, SpeakAnswer } from '@/lib/bank/types';
import { checkAnswer, type CheckResult } from '@/lib/bank/check';
import type { BadgeId } from '@/lib/engine/gamification';
import { BADGES } from '@/lib/engine/gamification';
import { isAnswered } from '@/lib/engine/exam';
import { QuestionView } from '@/components/questions/question-view';
import { SpeakFeedback, WritingFeedback } from '@/components/questions/feedback-extras';
import { MathText } from '@/components/questions/math-text';
import { Owl, type OwlState } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StreamText } from '@/components/questions/stream-text';
import { fireConfetti } from '@/lib/ui/confetti';
import { useSfx } from '@/lib/ui/use-sfx';
import { toast } from 'sonner';

export interface RunnerOutcome { xp: number; combo: number; newBadges: BadgeId[]; message?: string }
interface Props {
  title: string; maxQuestions: number; next: () => Question | null;
  onAnswered: (q: Question, r: CheckResult) => RunnerOutcome; onExit: () => void; aside?: ReactNode;
}

const PRAISE = ['Chính xác!', 'Tuyệt vời!', 'Giỏi quá!', 'Chuẩn luôn!'];
const ENCOURAGE = ['Gần đúng rồi, xem lời giải nhé!', 'Không sao, sai là để học!', 'Thử nghĩ theo gợi ý nhé!'];

export function PracticeRunner({ title, maxQuestions, next, onAnswered, onExit, aside }: Props) {
  const [q, setQ] = useState<Question | null>(null);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState<AnswerValue>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [outcome, setOutcome] = useState<RunnerOutcome | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [stats, setStats] = useState({ correct: 0, xp: 0 });
  const [owl, setOwl] = useState<OwlState>('idle');
  const started = useRef(false);
  const play = useSfx();

  const advance = useCallback(() => {
    const finish = () => { setDone(true); setOwl('celebrate'); fireConfetti(); play('complete'); };
    if (count >= maxQuestions) { finish(); return; }
    const n = next();
    if (!n) { finish(); return; }
    setQ(n); setValue(null); setResult(null); setOutcome(null); setHintsShown(0); setOwl('idle');
  }, [count, maxQuestions, next, play]);

  useEffect(() => { if (!started.current) { started.current = true; advance(); } }, [advance]);

  const check = () => {
    if (!q) return;
    const r = checkAnswer(q, value);
    const o = onAnswered(q, r);
    setResult(r); setOutcome(o); setCount((c) => c + 1);
    setStats((s) => ({ correct: s.correct + (r.correct ? 1 : 0), xp: s.xp + o.xp }));
    setOwl(r.correct ? (o.combo >= 3 ? 'celebrate' : 'correct') : 'wrong');
    if (r.correct && o.combo >= 3) fireConfetti({ origin: { x: 0.2, y: 0.4 } });
    play(!r.correct ? 'wrong' : o.combo >= 3 ? 'combo' : 'correct');
    o.newBadges.forEach((b) => toast(`Huy hiệu mới: ${BADGES[b].name}`));
  };

  if (done) {
    return (
      <ClayCard className="mx-auto max-w-xl space-y-5 p-10 text-center">
        <div className="flex justify-center"><Owl state={owl} size={160} /></div>
        <h2 className="text-3xl font-extrabold">Hoàn thành phiên!</h2>
        <div className="flex justify-center gap-8 text-lg">
          <div><p className="font-display text-4xl font-extrabold text-mint-dark">{stats.correct}/{count}</p><p className="text-muted">câu đúng</p></div>
          <div><p className="font-display text-4xl font-extrabold text-coral">+{stats.xp}</p><p className="text-muted">XP</p></div>
        </div>
        <ClayButton onClick={onExit} size="lg">Hoàn tất</ClayButton>
      </ClayCard>
    );
  }
  if (!q) return null;

  const owlText = result ? (result.correct ? PRAISE[count % PRAISE.length] : ENCOURAGE[count % ENCOURAGE.length]) : hintsShown ? 'Đọc gợi ý thử xem!' : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onExit} aria-label="Thoát" className="text-muted hover:text-ink"><X aria-hidden size={24} /></button>
          <ProgressBar value={count / maxQuestions} color="coral" className="flex-1" />
          <span className="text-sm font-bold text-muted">{title}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <ClayCard className="p-8">
              <QuestionView question={q} index={count + (result ? 0 : 1)} value={value} onChange={setValue} disabled={!!result} reveal={!!result} />
              {hintsShown > 0 && !result && (
                <div className="mt-5 space-y-2">
                  {q.hints.slice(0, hintsShown).map((h, hi) => (
                    <motion.p key={hi} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#fff8e1] px-4 py-2 text-sm"><Lightbulb aria-hidden size={16} className="mr-1.5 inline-block align-[-2px] text-coral-dark" /><MathText text={h} /></motion.p>
                  ))}
                </div>
              )}
            </ClayCard>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className={`rounded-[var(--radius-clay)] p-6 ${result.correct ? 'bg-mint' : 'bg-peach'}`}>
              <p className={`font-display text-xl font-extrabold ${result.correct ? 'text-mint-dark' : 'text-peach-dark'}`}>
                {result.correct ? 'Chính xác!' : result.fraction > 0 ? `Đúng một phần (${Math.round(result.fraction * 100)}%)` : 'Chưa đúng'}
                {outcome && outcome.xp > 0 && <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ml-3 text-coral">+{outcome.xp} XP</motion.span>}
              </p>
              {q.type === 'speak' && <div className="mt-3"><SpeakFeedback question={q} durationMs={(value as SpeakAnswer | null)?.durationMs ?? 0} /></div>}
              {q.type === 'write' && <div className="mt-3"><WritingFeedback question={q} text={String(value ?? '')} /></div>}
              <p className="mt-3 text-sm font-semibold"><Bot aria-hidden size={16} className="inline-block align-[-3px] text-lavender-dark" /> AI giải thích</p>
              <p className="mt-1 leading-relaxed">
                <StreamText text={q.explanation} />
              </p>
              {outcome?.message && <p className="mt-3 font-semibold text-mint-dark">{outcome.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <ClayButton variant="ghost" disabled={!!result || hintsShown >= q.hints.length} onClick={() => setHintsShown((h) => h + 1)}>
            <Lightbulb aria-hidden size={18} className="inline-block align-[-3px]" /> Gợi ý {q.hints.length ? `(${hintsShown}/${q.hints.length})` : ''}
          </ClayButton>
          {result
            ? <ClayButton size="lg" variant={result.correct ? 'mint' : 'primary'} onClick={advance}>Tiếp tục</ClayButton>
            : <ClayButton size="lg" disabled={!isAnswered(value)} onClick={check}>Kiểm tra</ClayButton>}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <OwlBubble text={owlText} />
          <Owl state={owl} size={150} />
          {outcome && outcome.combo >= 2 && (
            <motion.span key={outcome.combo} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="rounded-full bg-coral px-4 py-1.5 font-display font-extrabold text-white">
              <Flame aria-hidden size={18} className="inline-block align-[-3px]" /> Combo x{outcome.combo}
            </motion.span>
          )}
        </div>
        {aside}
      </aside>
    </div>
  );
}
