'use client';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Check, Dumbbell, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { questionsFor, skillName, skillsFor } from '@/lib/bank';
import { checkAnswer } from '@/lib/bank/check';
import { SUBJECT_LABEL, type AnswerValue, type Grade, type Question, type Subject } from '@/lib/bank/types';
import {
  ASSESSMENT_LENGTH, aiComment, currentTheta, emptyAssessment, nextAssessmentQuestion, recordAssessmentAnswer,
  summarizeAssessment, type AssessmentState, type AssessmentSummary,
} from '@/lib/engine/assessment';
import { BADGES } from '@/lib/engine/gamification';
import { isAnswered } from '@/lib/engine/exam';
import { QuestionView } from '@/components/questions/question-view';
import { DifficultyMeter } from '@/components/assessment/difficulty-meter';
import { SkillRadar } from '@/components/charts/skill-radar';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Typewriter } from '@/components/ui/typewriter';
import { fireConfetti } from '@/lib/ui/confetti';
import { playSfx } from '@/lib/ui/sfx';

type Phase = 'intro' | 'running' | 'analyzing' | 'report';
const STEPS = ['Ước lượng năng lực theo từng kiến thức…', 'Đối chiếu khung chương trình GDPT 2018…', 'Xây dựng Learning Zone cho em…'];

export default function DanhGiaPage() {
  const router = useRouter();
  const { profile, assessments, saveAssessment } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<AssessmentState>(emptyAssessment());
  const [q, setQ] = useState<Question | null>(null);
  const [value, setValue] = useState<AnswerValue>(null);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [step, setStep] = useState(0);
  const [runCtx, setRunCtx] = useState<{ subject: Subject; grade: Grade } | null>(null);
  const ctx = phase !== 'intro' && runCtx ? runCtx : { subject, grade };
  const pool = useMemo(() => questionsFor(ctx.subject, ctx.grade), [ctx.subject, ctx.grade]);
  const skills = useMemo(() => skillsFor(ctx.subject, ctx.grade), [ctx.subject, ctx.grade]);
  const existing = assessments[zoneKey(subject, grade)];
  const [empty, setEmpty] = useState(false);

  const start = () => {
    const s = emptyAssessment();
    const first = pool.length ? nextAssessmentQuestion(pool, skills, s) : null;
    if (!first) { setEmpty(true); return; }
    setEmpty(false); setRunCtx({ subject, grade });
    setState(s); setQ(first); setValue(null); setPhase('running');
  };

  // đổi lớp giữa bài → làm lại từ đầu (điều chỉnh state khi render; toast ở effect, chỉ một lần mỗi lần reset)
  const [seenGrade, setSeenGrade] = useState(grade);
  const [gradeResets, setGradeResets] = useState(0);
  if (seenGrade !== grade) {
    setSeenGrade(grade);
    if (phase === 'running' && runCtx && runCtx.grade !== grade) {
      setPhase('intro'); setRunCtx(null); setQ(null); setValue(null); setGradeResets((n) => n + 1);
    }
  }
  const toastedResets = useRef(0);
  useEffect(() => {
    if (gradeResets <= toastedResets.current) return;
    toastedResets.current = gradeResets;
    toast('Đã đổi lớp — bài đánh giá được làm lại từ đầu');
  }, [gradeResets]);
  const answer = (correct: boolean) => {
    if (!q) return;
    const s = recordAssessmentAnswer(state, q, correct);
    setState(s); setValue(null);
    const n = nextAssessmentQuestion(pool, skills, s);
    if (n) { setQ(n); return; }
    const sum = summarizeAssessment(s, skills, ctx);
    setSummary(sum); setStep(0); setPhase('analyzing');
    saveAssessment(sum).forEach((b) => toast(`Huy hiệu mới: ${BADGES[b].name}`));
  };

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1600);
    const t3 = setTimeout(() => { setPhase('report'); fireConfetti(); playSfx('complete'); }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  if (phase === 'intro') {
    return (
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <span className="rounded-full bg-lavender-soft px-3 py-1 text-sm font-bold text-lavender-dark"><Bot aria-hidden size={16} className="mr-1.5 inline-block align-[-3px]" />AI đánh giá năng lực</span>
          <h1 className="text-4xl font-extrabold leading-tight">Chỉ {ASSESSMENT_LENGTH} câu, AI hiểu em đang ở đâu</h1>
          <p className="text-lg text-muted">Câu hỏi tự điều chỉnh độ khó theo từng câu trả lời. Kết quả là bản đồ năng lực theo từng kiến thức và Learning Zone dành riêng cho em.</p>
          <div className="flex rounded-2xl bg-white p-1 shadow-clay w-fit">
            {(['toan', 'anh'] as Subject[]).map((s) => (
              <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-5 py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</button>
            ))}
          </div>
          {(empty || pool.length === 0) && (
            <ClayCard className="space-y-3">
              <p className="font-semibold">Chưa có câu hỏi đánh giá cho {SUBJECT_LABEL[subject]} lớp {grade}</p>
              <ClayButton variant="ghost" onClick={() => router.push('/luyen-tap')}>Đến Luyện tập</ClayButton>
            </ClayCard>
          )}
          <div className="flex flex-wrap gap-3">
            <ClayButton size="lg" onClick={start} disabled={pool.length === 0}>Bắt đầu đánh giá {SUBJECT_LABEL[subject]}</ClayButton>
            {existing && <ClayButton size="lg" variant="ghost" onClick={() => { setSummary(existing); setPhase('report'); }}>Xem báo cáo gần nhất</ClayButton>}
          </div>
        </div>
        <div className="flex justify-center"><Owl state="cheer" size={260} /></div>
      </div>
    );
  }

  if (phase === 'running' && q) {
    const n = state.asked.length + 1;
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <ProgressBar value={state.asked.length / ASSESSMENT_LENGTH} className="flex-1" />
            <span className="font-display font-bold">{n}/{ASSESSMENT_LENGTH}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <ClayCard className="p-8"><QuestionView question={q} value={value} onChange={setValue} disabled={false} reveal={false} index={n} /></ClayCard>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between">
            <ClayButton variant="ghost" onClick={() => answer(false)}>Bỏ qua câu này</ClayButton>
            <ClayButton size="lg" disabled={!isAnswered(value)} onClick={() => answer(checkAnswer(q, value).correct)}>Trả lời</ClayButton>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="flex justify-center"><Owl state="thinking" size={140} /></div>
          <ClayCard><DifficultyMeter theta={currentTheta(state)} /></ClayCard>
          <p className="text-center text-sm text-muted">Bài đánh giá không hiện đúng/sai từng câu để kết quả khách quan nhất.</p>
        </aside>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <ClayCard className="mx-auto max-w-lg space-y-6 p-10 text-center">
        <div className="flex justify-center"><Owl state="thinking" size={150} /></div>
        <h2 className="text-2xl font-extrabold">AI đang phân tích bài làm…</h2>
        <ul className="space-y-3 text-left">
          {STEPS.map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0.3 }} animate={{ opacity: i <= step ? 1 : 0.3 }} className="flex items-center gap-3">
              <motion.span animate={{ scale: i < step ? 1 : [1, 1.2, 1] }} transition={{ repeat: i === step ? Infinity : 0, duration: 0.8 }}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm ${i < step ? 'bg-mint-dark text-white' : 'bg-lavender-soft'}`}>{i < step ? <Check aria-hidden size={16} strokeWidth={3} /> : '•'}</motion.span>
              {s}
            </motion.li>
          ))}
        </ul>
      </ClayCard>
    );
  }

  if (phase === 'report' && summary) {
    const radar = summary.skills.filter((r) => r.answered > 0).map((r) => ({ name: skillName(r.skillId), score: r.score }));
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold">Báo cáo năng lực · {SUBJECT_LABEL[summary.subject]} {summary.grade}</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <ClayCard className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-muted">Năng lực tổng thể</p>
            <p className="font-display text-6xl font-extrabold text-coral"><CountUp value={summary.score} /></p>
            <span className="rounded-full bg-lavender-soft px-4 py-1 font-bold text-lavender-dark">{summary.label}</span>
          </ClayCard>
          <ClayCard className="lg:col-span-2"><SkillRadar data={radar} /></ClayCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ClayCard className="space-y-3">
            <p className="font-bold"><Dumbbell aria-hidden size={18} className="mr-1.5 inline-block align-[-3px] text-mint-dark" />Điểm mạnh</p>
            <div className="flex flex-wrap gap-2">{summary.strengths.map((s) => <span key={s} className="rounded-xl bg-mint px-3 py-1.5 font-semibold text-mint-dark">{skillName(s)}</span>)}</div>
            <p className="pt-2 font-bold"><Target aria-hidden size={18} className="mr-1.5 inline-block align-[-3px] text-peach-dark" />Cần tập trung</p>
            <div className="flex flex-wrap gap-2">{summary.weaknesses.map((s) => <span key={s} className="rounded-xl bg-peach px-3 py-1.5 font-semibold text-peach-dark">{skillName(s)}</span>)}</div>
          </ClayCard>
          <ClayCard className="flex gap-4">
            <Owl state="cheer" size={90} />
            <div>
              <p className="font-bold"><Bot aria-hidden size={18} className="mr-1.5 inline-block align-[-3px] text-lavender-dark" />Nhận xét của AI</p>
              <p className="mt-2 leading-relaxed"><Typewriter text={aiComment(summary, profile.name, skillName)} /></p>
            </div>
          </ClayCard>
        </div>
        <div className="flex gap-3">
          <ClayButton size="lg" onClick={() => router.push('/learning-zone')}>Vào Learning Zone →</ClayButton>
          <ClayButton size="lg" variant="ghost" onClick={() => setPhase('intro')}>Làm lại</ClayButton>
        </div>
      </div>
    );
  }
  return null;
}
