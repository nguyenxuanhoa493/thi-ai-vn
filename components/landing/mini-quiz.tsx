'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { getQuestion } from '@/lib/bank';
import { checkAnswer } from '@/lib/bank/check';
import type { AnswerValue, Question } from '@/lib/bank/types';
import { QuestionView } from '@/components/questions/question-view';
import { StreamText } from '@/components/questions/stream-text';
import { Owl, type OwlState } from '@/components/owl/owl';
import { OwlHome, useOwlHome } from '@/components/landing/mascot';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { ClayButton } from '@/components/ui/clay-button';
import { playSfx } from '@/lib/ui/sfx';
import { fireConfetti } from '@/lib/ui/confetti';

/** Toán (KaTeX) · Tiếng Anh có hình (Task 19) · Đúng/Sai 4 ý */
export const QUIZ_IDS = ['t9-hpt-khai-niem-NB-1', 'e9-vocab-NB-img1', 't9-pt-bac-hai-VD-1'] as const;
const QUESTIONS = QUIZ_IDS.map((id) => getQuestion(id)).filter((q): q is Question => !!q);

const hasAnswer = (v: AnswerValue) => (Array.isArray(v) ? v.length > 0 && v.every((x) => x !== null) : v !== null && v !== '');

export function MiniQuiz() {
  const [idx, setIdx] = useState(0);
  const home = useOwlHome();
  const [value, setValue] = useState<AnswerValue>(null);
  const [reveal, setReveal] = useState<boolean | null>(null); // null = chưa kiểm tra, true/false = kết quả câu hiện tại
  const [score, setScore] = useState(0);
  const q = QUESTIONS[idx];
  if (!q) return null;
  const last = idx === QUESTIONS.length - 1;
  const perfect = reveal !== null && last && score === QUESTIONS.length;

  const state: OwlState = reveal === null ? (hasAnswer(value) ? 'thinking' : 'idle') : perfect ? 'celebrate' : reveal ? 'correct' : 'wrong';
  const bubble = reveal === null
    ? (hasAnswer(value) ? 'Hmm, em chắc chưa nào?' : 'Thử 1 câu cho vui nhé, không tính điểm đâu!')
    : perfect ? 'Tuyệt vời! 3/3 luôn, em giỏi quá!'
      : reveal ? 'Đúng rồi! Em làm tốt lắm' : 'Không sao, sai là cơ hội để nhớ lâu hơn';

  const check = () => {
    const ok = checkAnswer(q, value).correct;
    setReveal(ok);
    const total = score + (ok ? 1 : 0);
    if (ok) setScore(total);
    playSfx(ok ? 'correct' : 'wrong');
    if (ok && last && total === QUESTIONS.length) { playSfx('complete'); fireConfetti(); }
  };
  const next = () => { setIdx((i) => i + 1); setValue(null); setReveal(null); };
  const restart = () => { setIdx(0); setValue(null); setReveal(null); setScore(0); };

  return (
    <section id="thu-ngay" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="rounded-full bg-peach px-3 py-1 text-sm font-bold text-peach-dark">Học thử</span>
        <h2 className="mt-3 text-4xl font-extrabold">Thử ngay 1 câu</h2>
        <p className="mt-3 text-lg text-muted">Làm thử 3 câu hỏi mẫu và xem Bé Cú phản ứng nhé. Không cần đăng nhập.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5 rounded-[28px] bg-white p-5 shadow-clay-lg sm:p-8">
          <div className="flex items-center justify-between text-sm font-bold text-lavender-dark">
            <span>Câu {idx + 1}/{QUESTIONS.length}</span>
            <span>Đúng: {score}</span>
          </div>
          <QuestionView key={q.id} question={q} value={value} onChange={setValue} disabled={reveal !== null} reveal={reveal !== null} />
          <div className="flex items-end gap-3 lg:hidden">
            <Owl state={state} size={100} />
            <OwlBubble text={bubble} />
          </div>
          {reveal !== null && (
            <div role="status" className={`rounded-2xl p-4 ${reveal ? 'bg-mint/60' : 'bg-peach/70'}`}>
              <p className="font-display font-extrabold">{reveal ? 'Chính xác!' : 'Chưa đúng rồi'}</p>
              <StreamText text={q.explanation} className="mt-1 block text-sm text-muted" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {reveal === null && <ClayButton onClick={check} disabled={!hasAnswer(value)}>Kiểm tra</ClayButton>}
            {reveal !== null && !last && <ClayButton onClick={next}>Câu tiếp</ClayButton>}
            {reveal !== null && last && (
              <>
                <Link href="/danh-gia" className="rounded-2xl bg-coral px-6 py-3 font-display font-extrabold text-white shadow-[0_6px_0_var(--color-coral-dark)]">Làm bài đánh giá đầy đủ →</Link>
                <ClayButton variant="ghost" onClick={restart}>Thử lại</ClayButton>
              </>
            )}
          </div>
        </div>
        <div className="hidden flex-col items-center gap-3 lg:sticky lg:top-24 lg:flex">
          <OwlBubble text={home ? bubble : null} />
          <OwlHome><Owl state={state} size={200} /></OwlHome>
        </div>
      </motion.div>
    </section>
  );
}
