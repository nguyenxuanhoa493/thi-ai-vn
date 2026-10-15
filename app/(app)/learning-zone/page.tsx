'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { questionsFor, skillName, skillsFor } from '@/lib/bank';
import { LEVELS, LEVEL_LABEL, SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { applyAnswer, LEVEL_B, pickNextQuestion, skillZone, zoneExtent, type ZoneEvent } from '@/lib/engine/learning-zone';
import { prob } from '@/lib/engine/irt';
import { ZoneRings } from '@/components/zone/zone-rings';
import { PracticeRunner } from '@/components/session/practice-runner';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { fireConfetti } from '@/lib/ui/confetti';
import { playSfx } from '@/lib/ui/sfx';

const SESSION = 10;

function eventText(e: ZoneEvent) {
  return e.type === 'level'
    ? `🌱 Vùng của em vừa mở rộng: ${skillName(e.skillId)} · ${LEVEL_LABEL[e.level]}`
    : `🔓 Mở khoá kiến thức mới: ${skillName(e.skillId)}`;
}

export default function LearningZonePage() {
  const router = useRouter();
  const { profile, zones, zoneBaseline, assessments, ensureZone, setZone, addMilestone, recordAnswer, awardBadge } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const [run, setRun] = useState<{ subject: Subject; grade: typeof profile.grade } | null>(null);
  const [highlight, setHighlight] = useState<string>();
  const recent = useRef<string[]>([]);
  const sfxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(sfxTimer.current), []);
  const key = zoneKey(subject, grade);
  const map = zones[key];
  const skills = useMemo(() => skillsFor(subject, grade), [subject, grade]);
  const pool = useMemo(() => questionsFor(subject, grade).filter((q) => q.type !== 'write'), [subject, grade]);
  const hasAssessment = !!assessments[key];
  const running = !!run && run.grade === grade;
  const setRunning = (v: boolean) => setRun(v ? { subject, grade } : null);
  // đổi lớp → huỷ phiên đang luyện (điều chỉnh state ngay khi render, không qua effect)
  const [seenGrade, setSeenGrade] = useState(grade);
  if (seenGrade !== grade) {
    setSeenGrade(grade);
    if (run && run.grade !== grade) { setRun(null); setHighlight(undefined); }
  }

  if (!map) {
    return (
      <ClayCard className="mx-auto max-w-xl space-y-5 p-10 text-center">
        <div className="flex justify-center"><Owl state="cheer" size={150} /></div>
        <h1 className="text-2xl font-extrabold">Learning Zone {SUBJECT_LABEL[subject]} {grade}</h1>
        <p className="text-muted">Làm bài đánh giá năng lực 12 câu để AI xác định vùng vừa sức của em.</p>
        <div className="flex justify-center gap-3">
          <ClayButton size="lg" onClick={() => router.push('/danh-gia')}>Làm bài đánh giá</ClayButton>
          <ClayButton size="lg" variant="ghost" onClick={() => ensureZone(subject, grade)}>Bắt đầu ở mức cơ bản</ClayButton>
        </div>
        <div className="flex justify-center gap-2">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-4 py-1.5 text-sm font-semibold ${subject === s ? 'bg-lavender text-white' : 'bg-white text-muted'}`}>{SUBJECT_LABEL[s]}</button>
          ))}
        </div>
      </ClayCard>
    );
  }

  const inZone = skills.filter((s) => map[s.id]);
  const locked = skills.filter((s) => !map[s.id]);
  const baseline = zoneBaseline[key];
  const growth = baseline == null ? 0 : Math.round((zoneExtent(map, skills) - baseline) * 100);

  const aside = (
    <ClayCard className="space-y-2 p-3">
      <p className="text-center text-xs font-bold uppercase tracking-wider text-muted">Vùng của em</p>
      <ZoneRings skills={skills} map={useDemo.getState().zones[key] ?? map} size={260} highlight={highlight} />
    </ClayCard>
  );

  if (running) {
    return (
      <PracticeRunner
        title={`Learning Zone · ${SUBJECT_LABEL[subject]}`}
        maxQuestions={SESSION}
        aside={aside}
        next={() => {
          const current = useDemo.getState().zones[key] ?? map;
          const q = pickNextQuestion(pool, current, recent.current);
          if (q) { recent.current = [...recent.current, q.id].slice(-15); setHighlight(q.skillId); }
          return q;
        }}
        onAnswered={(q, r) => {
          const current = useDemo.getState().zones[key] ?? map;
          const { map: nextMap, events } = applyAnswer(current, skills, q, r.correct);
          setZone(run!.subject, run!.grade, nextMap);
          const base = recordAnswer(run!.subject, q, r.correct);
          const newBadges = [...base.newBadges];
          if (events.length) {
            events.forEach((e) => toast.success(eventText(e)));
            addMilestone(run!.subject, run!.grade, 'zone-expand');
            fireConfetti({ origin: { x: 0.85, y: 0.5 } });
            sfxTimer.current = setTimeout(() => playSfx('zoneExpand'), 250); // lệch sau âm đúng/sai để không chồng nhau
            if (awardBadge('zone-expand')) newBadges.push('zone-expand');
          }
          return { ...base, newBadges, message: events.length ? eventText(events[0]) : undefined };
        }}
        onExit={() => { clearTimeout(sfxTimer.current); setRunning(false); setHighlight(undefined); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Learning Zone</h1>
          <p className="mt-1 max-w-2xl text-muted">Câu hỏi luôn <b className="text-ink">vừa sức</b>: em làm đúng khoảng 70–85%. Khi đã vững, vùng xanh sẽ <b className="text-ink">mở rộng dần</b> sang mức độ và kiến thức mới.</p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-clay">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-5 py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <ClayCard className="flex flex-col items-center gap-4 p-8">
          <p className="rounded-full bg-mint px-4 py-1.5 text-center text-sm font-bold text-mint-dark">
            {growth > 0 ? `🌱 Vùng vừa sức của em đã rộng thêm +${growth}% so với lần đầu` : 'Luyện thêm để vùng vừa sức của em rộng ra nhé!'}
          </p>
          <ZoneRings skills={skills} map={map} size={520} showLabels />
          <ul className="space-y-1.5 text-sm text-muted">
            <li className="flex items-start gap-2"><i className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#8b95e0]" /> <span>⭐ Đã vững: không cần luyện thêm</span></li>
            <li className="flex items-start gap-2"><i className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#22c55e]" /> <span>🌱 Vừa sức: câu hỏi em làm đúng khoảng 3/4 — luyện ở đây tiến bộ nhanh nhất</span></li>
            <li className="flex items-start gap-2"><i className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#b39dff]" /> <span>🔭 Sắp khám phá: sẽ mở khi em vững phần trước</span></li>
          </ul>
        </ClayCard>

        <div className="space-y-4">
          <ClayCard className="flex items-center gap-4">
            <Owl state="cheer" size={80} />
            <div className="flex-1">
              <p className="font-bold">Phiên luyện {SESSION} câu vừa sức</p>
              <p className="text-sm text-muted">{hasAssessment ? 'Dựa trên bài đánh giá AI gần nhất' : 'Đang ở mức cơ bản, làm bài đánh giá để chính xác hơn'}</p>
            </div>
            <ClayButton onClick={() => { recent.current = []; setRunning(true); }}>Luyện ngay</ClayButton>
          </ClayCard>
          <ClayCard className="space-y-3">
            <p className="font-bold">Kiến thức trong vùng</p>
            {inZone.map((s, i) => {
              const sp = map[s.id];
              const { zone } = skillZone(sp);
              const pFrontier = prob(sp.theta, LEVEL_B[sp.unlockedLevel]);
              const status = zone === 'mastered' ? '✓ Đã vững'
                : pFrontier < 0.5 ? 'Đang củng cố'
                : pFrontier < 0.85 ? `~${Math.round(pFrontier * 100)}% đúng ở mức ${LEVEL_LABEL[sp.unlockedLevel]}`
                : 'Sẵn sàng lên mức mới';
              return (
                <motion.div key={s.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{s.name}</span>
                    <span className={pFrontier < 0.5 && zone !== 'mastered' ? 'text-muted/70' : 'text-muted'}>{status}</span>
                  </div>
                  <div className="flex gap-1">
                    {LEVELS.map((l) => (
                      <motion.span key={l} layout title={LEVEL_LABEL[l]}
                        className={`h-2 flex-1 rounded-full ${LEVELS.indexOf(l) < LEVELS.indexOf(sp.unlockedLevel) || zone === 'mastered' ? 'bg-[#8b95e0]' : l === sp.unlockedLevel ? 'bg-[#22c55e]' : 'bg-lavender-soft'}`} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {locked.length > 0 && (
              <>
                <p className="pt-2 font-bold">🔭 Sắp khám phá</p>
                {locked.map((s) => (
                  <p key={s.id} className="text-sm text-muted">🔒 {s.name} <span className="text-xs">· cần vững: {s.prerequisites.map(skillName).join(', ')}</span></p>
                ))}
              </>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
}
