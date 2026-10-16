'use client';
import { motion } from 'motion/react';
import { Check, Star, Telescope } from 'lucide-react';
import { Owl } from '@/components/owl/owl';
import { TiltCard } from '@/components/ui/tilt-card';

const POINTS = [
  'Thời gian học mỗi tuần và mức độ đều đặn của con.',
  'Năng lực tăng bao nhiêu điểm sau mỗi tuần luyện tập.',
  'Điểm mạnh và phần cần tập trung, nêu rõ theo từng kiến thức.',
  'Lời nhắn thân thiện từ Bé Cú, không so sánh, không gây áp lực.',
];

export function ParentReport() {
  return (
    <section id="phu-huynh" className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
        <span className="rounded-full bg-peach px-3 py-1 text-sm font-bold text-peach-dark">Dành cho phụ huynh</span>
        <h2 className="text-4xl font-extrabold leading-tight">Báo cáo cho phụ huynh</h2>
        <p className="text-lg text-muted">Mỗi tuần, ba mẹ nhận một bản tóm tắt ngắn gọn, dễ hiểu về hành trình học của con.</p>
        <ul className="space-y-3">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-3"><span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-mint-dark"><Check size={14} strokeWidth={3} /></span><span>{p}</span></li>
          ))}
        </ul>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto w-full max-w-md">
        <TiltCard className="space-y-4 bg-white p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted">Báo cáo tuần · Demo</p><p className="font-display text-xl font-extrabold">Nguyễn Minh Anh · Lớp 9</p></div>
            <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-mint-dark">+7 điểm</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-lavender-soft p-3"><p className="font-display text-2xl font-extrabold text-lavender-dark">145</p><p className="text-xs text-muted">phút học tuần này</p></div>
            <div className="rounded-2xl bg-peach p-3"><p className="font-display text-2xl font-extrabold text-peach-dark">+7</p><p className="text-xs text-muted">năng lực so với tuần trước</p></div>
          </div>
          <div className="space-y-2 text-sm">
            <p><b className="text-mint-dark"><Star aria-hidden size={16} className="inline-block align-[-2px]" /> Điểm mạnh:</b> Căn bậc hai, Hệ phương trình.</p>
            <p><b className="text-peach-dark"><Telescope aria-hidden size={16} className="inline-block align-[-2px]" /> Cần tập trung:</b> Tỉ số lượng giác.</p>
          </div>
          <div className="flex items-end gap-3 rounded-2xl bg-sky p-3">
            <Owl state="cheer" size={56} />
            <p className="text-sm font-medium">&ldquo;Tuần này Minh Anh học rất đều. Mai mình cùng thử vùng mới nhé!&rdquo; - Bé Cú</p>
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}
