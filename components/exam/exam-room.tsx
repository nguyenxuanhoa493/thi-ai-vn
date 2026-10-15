'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ExamDef } from '@/lib/bank/exams';
import { EXAM_KIND_LABEL } from '@/lib/bank/exams';
import { getQuestion } from '@/lib/bank';
import { getExam } from '@/lib/bank/exams';
import type { AnswerValue, Question } from '@/lib/bank/types';
import {
  addViolation, formatClock, gradeAttempt, isAnswered, isExpired, navStatus, remainingSec, setAnswer, startAttempt, toggleFlag, type ExamResult,
} from '@/lib/engine/exam';
import { BADGES } from '@/lib/engine/gamification';
import { useDemo } from '@/lib/store/demo-store';
import { playSfx } from '@/lib/ui/sfx';
import { QuestionView } from '@/components/questions/question-view';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { ExamResultView } from './exam-result';

type Phase = 'lobby' | 'countdown' | 'taking' | 'result';
const RULES = [
  'Bài thi có tính giờ, hệ thống tự nộp khi hết giờ.',
  'Không chuyển tab hoặc rời khỏi màn hình làm bài, mọi lần rời đi đều được ghi lại.',
  'Bài làm được tự động lưu sau mỗi câu, mất mạng hay tải lại trang không mất bài.',
  'Có thể đánh dấu câu để xem lại trước khi nộp.',
];

function leaveFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
function toastBadges(ids: string[]) {
  ids.forEach((b) => { const d = BADGES[b as keyof typeof BADGES]; if (d) toast(`${d.icon} Huy hiệu mới: ${d.name}`); });
}

export function ExamRoom({ exam, now = Date.now }: { exam: ExamDef; now?: () => number }) {
  const router = useRouter();
  const { exam: attempt, setExam, finishExam, examResults } = useDemo();
  const questions = useMemo(() => exam.questionIds.map(getQuestion).filter(Boolean) as Question[], [exam]);
  const mine = attempt && attempt.examId === exam.id && !attempt.submittedAt ? attempt : null;
  const other = attempt && attempt.examId !== exam.id && !attempt.submittedAt ? attempt : null;
  const otherExam = other ? getExam(other.examId) : undefined;
  const otherLive = !!other && !!otherExam && !isExpired(other, now());

  const submit = useCallback((): ExamResult | null => {
    const a = useDemo.getState().exam;
    if (!a || a.examId !== exam.id) return null;
    const r = gradeAttempt(questions, a, now());
    toastBadges(finishExam(r));
    playSfx('submit');
    return r;
  }, [exam.id, questions, now, finishExam]);

  // Mở lại khi đã hết giờ → chấm ngay; lưu vào store trong effect (không set store khi đang render)
  const [result, setResult] = useState<ExamResult | null>(() =>
    mine && isExpired(mine, now()) ? gradeAttempt(questions, mine, now()) : null);
  useEffect(() => {
    if (result && useDemo.getState().exam?.examId === exam.id) toastBadges(finishExam(result));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>(result || (!mine && examResults[exam.id]) ? 'result' : mine ? 'taking' : 'lobby');
  const [agreed, setAgreed] = useState(false);
  const [count, setCount] = useState(3);
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState(() => (mine ? remainingSec(mine, now()) : exam.durationMin * 60));
  const [warning, setWarning] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  // đếm ngược 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) {
      const t = setTimeout(() => {
        setExam(startAttempt(exam, now()));
        setLeft(exam.durationMin * 60);
        setPhase('taking');
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count, exam, now, setExam]);

  // đồng hồ
  useEffect(() => {
    if (phase !== 'taking') return;
    let lastTick = -1;
    const id = setInterval(() => {
      const a = useDemo.getState().exam;
      if (!a) return;
      const r = remainingSec(a, now());
      // tick mỗi giây (không phải mỗi 500ms) trong 60 giây cuối
      if (r <= 60 && r > 0 && r !== lastTick) { lastTick = r; playSfx('tick'); }
      setLeft(r);
      if (r === 0) { const res = submit(); if (res) { setResult(res); setPhase('result'); leaveFullscreen(); toast('⏰ Hết giờ, bài đã được tự động nộp'); } }
    }, 500);
    return () => clearInterval(id);
  }, [phase, now, submit]);

  // phát hiện rời tab
  useEffect(() => {
    if (phase !== 'taking') return;
    // tải lại trang (F5) cũng bắn visibilitychange → hidden; không tính là rời màn hình
    let unloading = false;
    const onUnload = () => { unloading = true; };
    const onHide = () => {
      if (!document.hidden || unloading) return;
      const a = useDemo.getState().exam;
      if (!a) return;
      const next = addViolation(a);
      setExam(next);
      setWarning(next.violations);
      playSfx('warning');
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('visibilitychange', onHide);
    return () => { window.removeEventListener('beforeunload', onUnload); document.removeEventListener('visibilitychange', onHide); };
  }, [phase, setExam]);

  const back = () => router.push('/phong-thi');

  if (phase === 'result') {
    const r = result ?? examResults[exam.id];
    return r ? <ExamResultView exam={exam} result={r} questions={questions} onBack={back}
      onRetake={() => { setResult(null); setAgreed(false); setCurrent(0); setPhase('lobby'); }} /> : null;
  }

  if (phase === 'lobby' || phase === 'countdown') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <ClayCard className="w-full max-w-2xl space-y-6 p-5 sm:p-10">
          <AnimatePresence mode="wait">
            {phase === 'countdown' ? (
              <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                className="py-16 text-center font-display text-7xl font-extrabold text-coral sm:text-9xl">{count || 'Bắt đầu!'}</motion.div>
            ) : (
              <motion.div key="lobby" className="space-y-6">
                <div className="flex items-center gap-5">
                  <Owl state="idle" size={100} />
                  <div>
                    <span className="rounded-full bg-lavender-soft px-3 py-1 text-xs font-bold text-lavender-dark">{EXAM_KIND_LABEL[exam.kind]}</span>
                    <h1 className="mt-2 text-2xl font-extrabold">{exam.title}</h1>
                    <p className="text-muted">{questions.length} câu · {exam.durationMin} phút</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {RULES.map((r) => <li key={r} className="flex gap-3 rounded-xl bg-cream px-4 py-2.5 text-sm">📌 {r}</li>)}
                </ul>
                {other && otherExam && otherLive && (
                  <div className="space-y-3 rounded-xl bg-peach px-4 py-3 text-sm text-peach-dark">
                    <p className="font-semibold">Em đang làm dở bài «{otherExam.title}»</p>
                    <ClayButton onClick={() => router.push(`/phong-thi/${otherExam.id}`)}>Tiếp tục bài đang làm</ClayButton>
                  </div>
                )}
                <label className="flex items-center gap-3 font-semibold">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-5 w-5 accent-coral" />
                  Tôi đã đọc và đồng ý với quy chế thi
                </label>
                <div className="flex justify-between">
                  <ClayButton variant="ghost" onClick={back}>← Quay lại</ClayButton>
                  <ClayButton size="lg" disabled={!agreed || otherLive} onClick={() => {
                    if (other && otherExam && !otherLive) toastBadges(finishExam(gradeAttempt(otherExam.questionIds.map(getQuestion).filter(Boolean) as Question[], other, now())));
                    document.documentElement.requestFullscreen?.().catch(() => {});
                    setCount(3); setPhase('countdown');
                  }}>Vào phòng thi</ClayButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ClayCard>
      </div>
    );
  }

  // taking
  const a = mine;
  if (!a) return null;
  const q = questions[current];
  const status = navStatus(a, exam.questionIds);
  const unanswered = exam.questionIds.filter((id) => !isAnswered(a.answers[id])).length;
  const urgent = left <= 300;
  const update = (v: AnswerValue) => setExam(setAnswer(a, q.id, v));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-white/60 bg-cream/90 px-8 py-3 backdrop-blur">
        <p className="flex-1 font-display font-bold">{exam.title}</p>
        {a.violations > 0 && <span className="rounded-xl bg-peach px-3 py-1 text-sm font-semibold text-peach-dark">⚠️ {a.violations}</span>}
        <motion.span animate={left <= 60 ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ repeat: left <= 60 ? Infinity : 0, duration: 1 }}
          className={`rounded-2xl px-5 py-2 font-display text-2xl font-extrabold tabular-nums shadow-clay ${urgent ? 'bg-peach text-peach-dark' : 'bg-white'}`}>
          {formatClock(left)}
        </motion.span>
        <ClayButton onClick={() => setConfirming(true)}>Nộp bài</ClayButton>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <ClayCard className="p-8">
                <QuestionView question={q} index={current + 1} value={a.answers[q.id] ?? null} onChange={update} disabled={false} reveal={false} />
              </ClayCard>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <ClayButton variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>← Câu trước</ClayButton>
            <ClayButton variant="secondary" onClick={() => setExam(toggleFlag(a, q.id))}>{a.flagged.includes(q.id) ? '★ Bỏ đánh dấu' : '☆ Đánh dấu xem lại'}</ClayButton>
            <ClayButton variant="ghost" disabled={current === questions.length - 1} onClick={() => setCurrent((c) => c + 1)}>Câu sau →</ClayButton>
          </div>
        </div>
        <ClayCard className="h-fit space-y-4">
          <p className="font-bold">Danh sách câu hỏi</p>
          <div className="grid grid-cols-5 gap-2">
            {exam.questionIds.map((id, i) => (
              <motion.button key={id} type="button" layout onClick={() => setCurrent(i)} aria-label={`Câu ${i + 1}`}
                className={`h-10 rounded-xl text-sm font-bold ${i === current ? 'ring-2 ring-coral' : ''}
                  ${status[id] === 'answered' ? 'bg-lavender text-white' : status[id] === 'flagged' ? 'bg-sun text-ink' : 'bg-lavender-soft text-muted'}`}>
                {i + 1}
              </motion.button>
            ))}
          </div>
          <div className="space-y-1 text-xs text-muted">
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-lavender" />Đã làm</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-sun" />Đánh dấu xem lại</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-lavender-soft" />Chưa làm</p>
          </div>
          <p className="text-xs text-mint-dark">✓ Bài làm được tự động lưu</p>
        </ClayCard>
      </div>

      <AnimatePresence>
        {(warning !== null || confirming) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/30 backdrop-blur-sm">
            <motion.div role="dialog" aria-modal="true" aria-labelledby="exam-dialog-title" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md">
              <ClayCard className="space-y-4 p-8 text-center">
                {warning !== null ? (
                  <>
                    <div className="flex justify-center"><Owl state="wrong" size={100} /></div>
                    <p id="exam-dialog-title" className="text-lg font-bold">Bạn vừa rời khỏi màn hình làm bài (lần {warning})</p>
                    <p className="text-sm text-muted">Hành vi này đã được ghi lại và sẽ hiển thị trong kết quả bài thi.</p>
                    <ClayButton autoFocus onClick={() => setWarning(null)}>Tiếp tục làm bài</ClayButton>
                  </>
                ) : (
                  <>
                    <p id="exam-dialog-title" className="text-lg font-bold">Nộp bài?</p>
                    <p className="text-muted">{unanswered > 0 ? `Em còn ${unanswered} câu chưa làm.` : 'Em đã làm hết các câu.'} Sau khi nộp sẽ không sửa được nữa.</p>
                    <div className="flex justify-center gap-3">
                      <ClayButton variant="ghost" onClick={() => setConfirming(false)}>Làm tiếp</ClayButton>
                      <ClayButton autoFocus onClick={() => { const r = submit(); setConfirming(false); if (r) { setResult(r); setPhase('result'); leaveFullscreen(); } }}>Xác nhận nộp</ClayButton>
                    </div>
                  </>
                )}
              </ClayCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
