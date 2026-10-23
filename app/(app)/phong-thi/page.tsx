'use client';
import { motion } from 'motion/react';
import { ArrowRight, Check, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/store/demo-store';
import { examsFor, type ExamKind } from '@/lib/bank/exams';
import { SUBJECT_LABEL } from '@/lib/bank/types';
import { TiltCard } from '@/components/ui/tilt-card';
import { TopicArt } from '@/components/ui/topic-art';

const KIND: Record<ExamKind, { label: string; bg: string }> = {
  '15p': { label: '15 phút', bg: 'from-[#7fd8a8] to-mint-dark' },
  '45p': { label: '45 phút', bg: 'from-lavender to-lavender-dark' },
  'giua-ky': { label: 'Giữa kỳ', bg: 'from-sun to-[#f4a259]' },
  'cuoi-ky': { label: 'Cuối kỳ', bg: 'from-coral to-coral-dark' },
};

/** "Kiểm tra 15 phút — Căn bậc hai" → "Căn bậc hai" (loại đề đã hiện ở nhãn trên ảnh) */
const shortTitle = (t: string) => t.split(' — ').pop()!;

export default function PhongThiPage() {
  const router = useRouter();
  const { profile, examResults, exam } = useDemo();
  const list = examsFor(profile.grade);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Phòng thi</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {list.map((e, i) => {
          const r = examResults[e.id];
          const inProgress = exam?.examId === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TiltCard onClick={() => router.push(`/phong-thi/${e.id}`)} className="group flex h-full flex-col overflow-hidden !p-0">
                <div className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${KIND[e.kind].bg}`}>
                  <TopicArt art={e.art} />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink">{KIND[e.kind].label}</span>
                  {inProgress ? (
                    <span className="absolute right-2 top-2 rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">● Đang làm dở</span>
                  ) : r && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-mint-dark px-2 py-0.5 text-xs font-bold text-white">
                      <Check aria-hidden size={12} strokeWidth={3} />Đã làm · {r.score10.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <h3 className="line-clamp-2 flex-1 font-bold leading-snug" title={e.title}>{shortTitle(e.title)}</h3>
                  <p className="text-xs text-muted">{SUBJECT_LABEL[e.subject]} · {e.schedule}</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted">
                    <span className="flex items-center gap-1"><Timer aria-hidden size={13} />{e.durationMin}′ · {e.questionIds.length} câu</span>
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
