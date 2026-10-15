'use client';
import { motion } from 'motion/react';
import { CountUp } from '@/components/ui/count-up';
import { BANK_TOTAL } from '@/lib/bank';

const STATS = [
  { value: BANK_TOTAL, suffix: '+', label: 'câu hỏi trong ngân hàng' },
  { value: 100, suffix: '%', label: 'được NXB phê duyệt' },
  { value: 2018, suffix: '', label: 'chuẩn chương trình GDPT', plain: true },
  { value: 11, suffix: '', label: 'dạng câu hỏi tương tác' },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="grid grid-cols-2 gap-4 rounded-[32px] bg-white p-8 shadow-clay-lg md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl font-extrabold text-coral xl:text-5xl">
              {s.plain ? s.value : <CountUp value={s.value} />}{s.suffix}
            </p>
            <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
