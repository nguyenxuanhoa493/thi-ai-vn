'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TopicArt } from '@/components/ui/topic-art';
import { useDemo } from '@/lib/store/demo-store';
import { BANK_TOTAL, getQuestion } from '@/lib/bank';
import { practiceSetsFor } from '@/lib/bank/practice-sets';
import { LEVELS, LEVEL_LABEL, SUBJECT_LABEL, type Level, type Subject } from '@/lib/bank/types';
import { TiltCard } from '@/components/ui/tilt-card';
import { CountUp } from '@/components/ui/count-up';

// Màu nền thumbnail, xoay vòng theo thứ tự chương
const THUMBS = [
  'from-lavender to-lavender-dark',
  'from-coral to-coral-dark',
  'from-[#7fd8a8] to-mint-dark',
  'from-sun to-[#f4a259]',
  'from-[#8fc8ff] to-[#4f86d9]',
  'from-[#ffb3c7] to-[#e0607e]',
];
const LEVEL_DOT: Record<Level, string> = { NB: 'bg-mint-dark', TH: 'bg-lavender-dark', VD: 'bg-[#e0a33a]', VDC: 'bg-peach-dark' };

export default function LuyenTapPage() {
  const router = useRouter();
  const grade = useDemo((s) => s.profile.grade);
  const [subject, setSubject] = useState<Subject>('toan');
  const sets = practiceSetsFor(subject, grade);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Luyện tập</h1>
          <p className="text-sm text-muted"><CountUp value={BANK_TOTAL} /> câu hỏi</p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-clay">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className="relative rounded-xl px-5 py-2 font-semibold">
              {subject === s && <motion.span layoutId="subject-pill" className={`absolute inset-0 rounded-xl ${s === 'toan' ? 'bg-lavender' : 'bg-coral'}`} />}
              <span className={`relative ${subject === s ? 'text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {sets.map((s, i) => {
          const mixed = s.chapterId === null;
          const levels = LEVELS.filter((lv) => s.questionIds.some((id) => getQuestion(id)?.level === lv));
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <TiltCard onClick={() => router.push(`/luyen-tap/${s.id}`)} className="group flex h-full flex-col overflow-hidden !p-0">
                <div className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${mixed ? 'from-ink to-[#4a4e6e]' : THUMBS[i % THUMBS.length]}`}>
                  <TopicArt art={s.chapterId ?? 'mixed'} fallback={String(i + 1).padStart(2, '0')} />
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink">{s.questionIds.length} câu</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <h3 className="line-clamp-2 flex-1 font-bold leading-snug" title={s.title}>{mixed ? 'Đề tổng hợp' : s.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {levels.map((lv) => <span key={lv} title={LEVEL_LABEL[lv]} className={`size-2 rounded-full ${LEVEL_DOT[lv]}`} />)}
                    </div>
                    <ArrowRight className="size-4 text-coral transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
