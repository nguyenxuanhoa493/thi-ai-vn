'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { skillsFor } from '@/lib/bank';
import { examsFor, EXAM_KIND_LABEL } from '@/lib/bank/exams';
import { SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { thetaToScore } from '@/lib/engine/irt';
import { BADGES, type BadgeId, toDateKey } from '@/lib/engine/gamification';
import { SkillRadar } from '@/components/charts/skill-radar';
import { ProgressChart, type ProgressMark, type ProgressRow } from '@/components/charts/progress-chart';
import { ZoneRings } from '@/components/zone/zone-rings';
import { Owl } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';

const BAR_MAX_PX = 112; // h-36 (144px) trừ nhãn ngày + khoảng cách
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const router = useRouter();
  const { profile, streak, xp, history, assessments, zones, badges, examResults, progress, milestones } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const key = zoneKey(subject, grade);
  const skills = skillsFor(subject, grade);
  const assessment = assessments[key];
  const zone = zones[key];
  const radar = skills
    .map((s) => {
      const r = assessment?.skills.find((x) => x.skillId === s.id);
      const measured = !!zone?.[s.id] || (r?.answered ?? 0) > 0;
      return { measured, name: s.name, score: zone?.[s.id] ? thetaToScore(zone[s.id].theta) : r?.score ?? 0 };
    })
    .filter((x) => x.measured)
    .map(({ name, score }) => ({ name, score }));
  const today = toDateKey(new Date());
  const todayItems = history.filter((h) => h.date === today);
  const answeredToday = todayItems.reduce((s, h) => s + h.answered, 0);
  const exams = examsFor(grade).filter((e) => !examResults[e.id]).slice(0, 3);
  const tasks = [
    { label: `Làm bài đánh giá năng lực ${SUBJECT_LABEL[subject]}`, done: !!assessment, href: '/danh-gia' },
    { label: 'Luyện 10 câu trong Learning Zone', done: answeredToday >= 10, href: '/learning-zone' },
    { label: exams[0] ? `Làm bài: ${exams[0].title}` : 'Ôn tập đề tổng hợp', done: false, href: exams[0] ? `/phong-thi/${exams[0].id}` : '/luyen-tap' },
  ];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = toDateKey(d);
    return { k, label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()], xp: history.filter((h) => h.date === k).reduce((s, h) => s + h.xp, 0) };
  });
  // năng lực theo thời gian: 14 ngày gần nhất của lớp đang chọn
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { k: toDateKey(d), label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` };
  });
  const gradeProgress = progress.filter((p) => p.grade === grade);
  const chartData: ProgressRow[] = days14.map((d) => {
    const row: ProgressRow = { label: d.label };
    for (const sj of ['toan', 'anh'] as Subject[]) {
      const hit = gradeProgress.find((p) => p.date === d.k && p.subject === sj);
      if (hit) row[sj] = hit.score;
    }
    return row;
  });
  const chartSubjects = (['toan', 'anh'] as Subject[]).filter((sj) => chartData.some((r) => r[sj] != null));
  const marks: ProgressMark[] = milestones.filter((m) => m.grade === grade).flatMap((m) => {
    const day = days14.find((d) => d.k === m.date);
    const score = gradeProgress.find((p) => p.date === m.date && p.subject === m.subject)?.score;
    return day && score != null ? [{ label: day.label, subject: m.subject, score, kind: m.kind }] : [];
  });
  const summarySubject = chartSubjects[0];
  const series = summarySubject ? chartData.map((r) => r[summarySubject]).filter((v): v is number => v != null) : [];
  const delta = series.length > 1 ? series[series.length - 1] - series[0] : 0;
  const summaryText = !summarySubject ? '' : series.length < 2 ? 'Mới bắt đầu, hãy luyện tiếp để thấy đường tiến bộ nhé!'
    : delta > 0 ? `+${delta} điểm ${SUBJECT_LABEL[summarySubject]} sau 2 tuần` : 'Em đang giữ vững phong độ, cố lên!';
  const maxXp = Math.max(50, ...last7.map((d) => d.xp));

  return (
    <motion.div className="grid grid-cols-12 gap-5" initial="hidden" animate="show" transition={{ staggerChildren: 0.06 }}>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="flex h-full flex-col items-center gap-4 sm:flex-row sm:gap-6 bg-gradient-to-br from-white to-lavender-soft">
          <Owl state="cheer" size={130} />
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold">Chào {profile.name}! 👋</h1>
            <OwlBubble text={assessment ? 'Hôm nay luyện 15 phút trong Learning Zone nhé!' : 'Làm bài đánh giá để Bé Cú hiểu em hơn nhé!'} />
            <ClayButton onClick={() => router.push(assessment ? '/learning-zone' : '/danh-gia')}>{assessment ? 'Vào Learning Zone' : 'Làm bài đánh giá'}</ClayButton>
          </div>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-6 lg:col-span-3">
        <ClayCard className="flex h-full flex-col justify-between bg-gradient-to-br from-[#fff1e6] to-white">
          <p className="font-semibold text-muted">Chuỗi ngày học</p>
          <p className="font-display text-5xl font-extrabold text-coral sm:text-6xl"><motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block">🔥</motion.span><CountUp value={streak.count} /></p>
          <p className="text-sm text-muted">Giữ lửa mỗi ngày nhé!</p>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-6 lg:col-span-3">
        <ClayCard className="flex h-full flex-col justify-between">
          <p className="font-semibold text-muted">Điểm kinh nghiệm</p>
          <p className="font-display text-3xl font-extrabold text-lavender-dark sm:text-5xl">⭐ <CountUp value={xp} /></p>
          <p className="text-sm text-muted">Hôm nay: {answeredToday} câu</p>
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full">
          <div className="flex items-center justify-between">
            <p className="font-bold">Bản đồ năng lực</p>
            <div className="flex gap-1 rounded-xl bg-lavender-soft p-1">
              {(['toan', 'anh'] as Subject[]).map((s) => (
                <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${subject === s ? 'bg-white shadow' : 'text-muted'}`}>{SUBJECT_LABEL[s]}</button>
              ))}
            </div>
          </div>
          {radar.length > 0 ? <SkillRadar data={radar} color={subject === 'toan' ? '#a8b5ff' : '#ff8a65'} /> : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center text-muted">
              <p>AI chưa có dữ liệu năng lực {SUBJECT_LABEL[subject]} lớp {grade} của em.</p>
              <ClayButton variant="secondary" onClick={() => router.push('/danh-gia')}>Làm bài đánh giá</ClayButton>
            </div>
          )}
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="flex h-full flex-col items-center gap-4 sm:flex-row">
          <div className="w-full max-w-[240px] sm:w-1/2"><ZoneRings skills={skills} map={zone ?? {}} size={240} /></div>
          <div className="space-y-3">
            <p className="font-bold">Learning Zone · {SUBJECT_LABEL[subject]}</p>
            <p className="text-sm text-muted">{zone ? `${Object.keys(zone).length}/${skills.length} kiến thức đang trong vùng vừa sức.` : 'Vùng vừa sức sẽ xuất hiện sau bài đánh giá.'}</p>
            <ClayButton onClick={() => router.push('/learning-zone')}>Luyện ngay</ClayButton>
          </div>
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12">
        <ClayCard>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">Năng lực theo thời gian</p>
            {summarySubject && <p className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-mint-dark">{summaryText}</p>}
          </div>
          {summarySubject ? (
            <>
              <ProgressChart data={chartData} marks={marks} subjects={chartSubjects} />
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                {chartSubjects.map((sj) => (
                  <span key={sj} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: sj === 'toan' ? '#7c83db' : '#ff8a65' }} />{SUBJECT_LABEL[sj]}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center text-muted">
              <p>Chưa có dữ liệu tiến bộ lớp {grade}. Làm bài đánh giá để bắt đầu theo dõi nhé!</p>
              <ClayButton variant="secondary" onClick={() => router.push('/danh-gia')}>Làm bài đánh giá</ClayButton>
            </div>
          )}
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full space-y-3">
          <p className="font-bold">Nhiệm vụ hôm nay</p>
          {tasks.map((t) => (
            <button key={t.label} type="button" onClick={() => router.push(t.href)} className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left hover:bg-lavender-soft">
              <span className={`grid h-7 w-7 place-items-center rounded-full ${t.done ? 'bg-mint-dark text-white' : 'border-2 border-lavender'}`}>{t.done ? '✓' : ''}</span>
              <span className={`flex-1 font-medium ${t.done ? 'text-muted line-through' : ''}`}>{t.label}</span>
              <span className="text-coral">→</span>
            </button>
          ))}
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full space-y-3">
          <p className="font-bold">📅 Lịch thi sắp tới</p>
          {exams.length === 0 && <p className="text-sm text-muted">Không có bài thi nào đang chờ.</p>}
          {exams.map((e) => (
            <button key={e.id} type="button" onClick={() => router.push(`/phong-thi/${e.id}`)} className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left hover:bg-lavender-soft">
              <span className="rounded-lg bg-lavender-soft px-2 py-1 text-xs font-bold text-lavender-dark">{EXAM_KIND_LABEL[e.kind]}</span>
              <span className="flex-1 font-medium">{e.title}</span>
              <span className="text-xs text-muted">{e.schedule}</span>
            </button>
          ))}
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-8">
        <ClayCard>
          <p className="font-bold">Hoạt động 7 ngày</p>
          <div className="mt-4 flex h-36 items-end gap-3">
            {last7.map((d, i) => (
              <div key={d.k} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                {/* chiều cao px: % trong flex item không có chiều cao xác định sẽ sụp về 0 */}
                <motion.div className="w-full rounded-t-xl bg-gradient-to-t from-lavender to-[#c9d0ff]"
                  initial={{ height: 0 }} animate={{ height: Math.round((d.xp / maxXp) * BAR_MAX_PX) }} transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 120, damping: 16 }} />
                <span className={`text-xs ${d.k === today ? 'font-bold text-coral' : 'text-muted'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-4">
        <ClayCard className="h-full">
          <p className="font-bold">Huy hiệu</p>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(Object.keys(BADGES) as BadgeId[]).map((b) => {
              const has = badges.includes(b);
              return (
                <motion.div key={b} whileHover={{ scale: 1.1, rotate: -4 }} title={BADGES[b].name}
                  className={`grid aspect-square place-items-center rounded-2xl text-3xl ${has ? 'bg-[#fff1d6] shadow-clay' : 'bg-lavender-soft opacity-40 grayscale'}`}>
                  {BADGES[b].icon}
                </motion.div>
              );
            })}
          </div>
        </ClayCard>
      </motion.div>
    </motion.div>
  );
}
