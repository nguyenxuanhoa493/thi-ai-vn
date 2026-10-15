'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/store/demo-store';
import { EXAM_KIND_LABEL, examsFor } from '@/lib/bank/exams';
import { SUBJECT_LABEL } from '@/lib/bank/types';
import { TiltCard } from '@/components/ui/tilt-card';

const KIND_STYLE = { '15p': 'bg-mint text-mint-dark', '45p': 'bg-lavender-soft text-lavender-dark', 'giua-ky': 'bg-[#fff1d6] text-[#b7791f]', 'cuoi-ky': 'bg-peach text-peach-dark' } as const;

export default function PhongThiPage() {
  const router = useRouter();
  const { profile, examResults, exam } = useDemo();
  const list = examsFor(profile.grade);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Phòng thi</h1>
        <p className="mt-1 text-muted">Bài kiểm tra do nhà trường tổ chức, đề lấy trực tiếp từ ngân hàng 40.000 câu đã được NXB phê duyệt.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e, i) => {
          const r = examResults[e.id];
          const inProgress = exam?.examId === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <TiltCard onClick={() => router.push(`/phong-thi/${e.id}`)} className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold ${KIND_STYLE[e.kind]}`}>{EXAM_KIND_LABEL[e.kind]}</span>
                  <span className="text-sm text-muted">{SUBJECT_LABEL[e.subject]}</span>
                </div>
                <h3 className="flex-1 text-lg font-bold">{e.title}</h3>
                <p className="text-sm text-muted">⏱ {e.durationMin} phút · {e.questionIds.length} câu · {e.schedule}</p>
                <p className="font-bold">
                  {inProgress ? <span className="text-coral">● Đang làm dở, vào tiếp →</span>
                    : r ? <span className="text-mint-dark">✓ Đã làm · {r.score10.toFixed(2).replace('.', ',')} điểm</span>
                    : <span className="text-coral">Vào thi →</span>}
                </p>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
