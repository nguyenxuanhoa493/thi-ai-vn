'use client';
import { motion } from 'motion/react';
import { TiltCard } from '@/components/ui/tilt-card';

const PILLARS = [
  { icon: '📚', title: 'Ngân hàng đề chuẩn', desc: '40.000 câu hỏi theo từng chương, bài và mức độ, đã được NXB phê duyệt. Có đủ dạng câu mới: Đúng/Sai 4 ý, trả lời ngắn, kéo thả, nghe, nói.', color: 'from-lavender-soft' },
  { icon: '🤖', title: 'AI đánh giá năng lực', desc: '12 câu thích ứng là đủ để AI vẽ bản đồ năng lực theo từng kiến thức, chỉ rõ điểm mạnh và phần cần tập trung.', color: 'from-peach' },
  { icon: '🌱', title: 'Learning Zone', desc: 'Luôn luyện ở vùng vừa sức (đúng khoảng 70–85%). Khi em vững, vùng tự mở rộng sang mức độ và kiến thức mới.', color: 'from-mint' },
];

export function Pillars() {
  return (
    <section id="tinh-nang" className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <h2 className="text-center text-4xl font-extrabold">Ba trụ cột của thi.ai.vn</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
            <TiltCard className={`h-full bg-gradient-to-br ${p.color} to-white p-8`}>
              <p className="text-5xl">{p.icon}</p>
              <h3 className="mt-4 text-2xl font-extrabold">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
