'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useDemo } from '@/lib/store/demo-store';
import { BANK_TOTAL, chapterCount, chaptersFor, skillsFor } from '@/lib/bank';
import { practiceSetsFor } from '@/lib/bank/practice-sets';
import { SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { LevelPill } from '@/components/ui/level-pill';
import { getQuestion } from '@/lib/bank';
import { LEVELS } from '@/lib/bank/types';
import { ClayCard } from '@/components/ui/clay-card';
import { TiltCard } from '@/components/ui/tilt-card';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { CountUp } from '@/components/ui/count-up';

export default function LuyenTapPage() {
  const router = useRouter();
  const grade = useDemo((s) => s.profile.grade);
  const [subject, setSubject] = useState<Subject>('toan');
  const chapters = chaptersFor(subject, grade);
  const [openRaw, setOpenChapter] = useState<string | null>(null);
  const openChapter = chapters.some((c) => c.id === openRaw) ? openRaw : null;
  const gradeTotal = chapters.reduce((n, c) => n + chapterCount(c.id), 0);
  const sets = practiceSetsFor(subject, grade).filter((s) => !openChapter || s.chapterId === openChapter || s.chapterId === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Ngân hàng đề</h1>
          <p className="mt-1 text-muted"><b className="text-ink"><CountUp value={BANK_TOTAL} /></b> câu hỏi · Chuẩn chương trình GDPT 2018 · <NxbBadge /></p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-clay">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => { setSubject(s); setOpenChapter(null); }} className="relative rounded-xl px-5 py-2 font-semibold">
              {subject === s && <motion.span layoutId="subject-pill" className={`absolute inset-0 rounded-xl ${s === 'toan' ? 'bg-lavender' : 'bg-coral'}`} />}
              <span className={`relative ${subject === s ? 'text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ClayCard className="h-fit space-y-1 p-3">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted">Lớp {grade} · {gradeTotal.toLocaleString('vi-VN')} câu › Chương › Bài › Kiến thức</p>
          {chapters.map((ch) => {
            const open = openChapter === ch.id;
            return (
              <div key={ch.id}>
                <button type="button" onClick={() => setOpenChapter(open ? null : ch.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold ${open ? 'bg-lavender-soft' : 'hover:bg-cream'}`}>
                  <motion.span animate={{ rotate: open ? 90 : 0 }}>›</motion.span>
                  <span className="flex-1">{ch.name}</span>
                  <span className="text-xs text-muted">{chapterCount(ch.id).toLocaleString('vi-VN')}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7">
                      {ch.lessons.map((l) => (
                        <div key={l.id} className="py-1">
                          <p className="flex justify-between text-sm font-medium"><span>{l.name}</span><span className="text-xs text-muted">{skillsFor(subject, grade).filter((s) => s.lessonId === l.id).reduce((n, s) => n + s.bankCount, 0).toLocaleString('vi-VN')} câu</span></p>
                          {skillsFor(subject, grade).filter((s) => s.lessonId === l.id).map((s) => (
                            <p key={s.id} className="flex justify-between py-0.5 pl-3 text-xs text-muted"><span>• {s.name}</span><span>{s.bankCount} câu</span></p>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </ClayCard>

        <div className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sets.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TiltCard onClick={() => router.push(`/luyen-tap/${s.id}`)} className="flex h-full flex-col gap-3">
                <span className={`w-fit rounded-xl px-3 py-1 text-xs font-bold ${s.chapterId ? 'bg-lavender-soft text-lavender-dark' : 'bg-peach text-peach-dark'}`}>{s.subtitle}</span>
                <h3 className="flex-1 text-lg font-bold leading-snug">{s.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {LEVELS.filter((lv) => s.questionIds.some((id) => getQuestion(id)?.level === lv)).map((lv) => <LevelPill key={lv} level={lv} />)}
                </div>
                <div className="flex items-center justify-between text-sm"><NxbBadge /><span className="font-bold text-coral">Luyện ngay →</span></div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
