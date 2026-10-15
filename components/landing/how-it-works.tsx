'use client';
import { motion } from 'motion/react';

const STEPS = [
  { icon: '🤖', title: 'Đánh giá AI', desc: '12 câu thích ứng để Bé Cú hiểu năng lực của em.', bg: 'bg-peach' },
  { icon: '🌱', title: 'Learning Zone', desc: 'Luyện đúng vùng vừa sức, vùng tự mở rộng khi em vững.', bg: 'bg-mint' },
  { icon: '🏆', title: 'Thi & theo dõi tiến bộ', desc: 'Làm đề thật, xem báo cáo năng lực tăng mỗi tuần.', bg: 'bg-lavender-soft' },
];

export function HowItWorks() {
  return (
    <section id="cach-hoat-dong" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-4xl font-extrabold">Cách hoạt động</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted">Ba bước đơn giản, em chỉ cần bắt đầu.</p>
      <div className="relative mt-14">
        <motion.div aria-hidden className="absolute left-[16%] right-[16%] top-10 hidden origin-left border-t-2 border-dashed border-lavender md:block"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        <motion.div aria-hidden className="absolute bottom-16 left-1/2 top-10 origin-top border-l-2 border-dashed border-lavender md:hidden"
          initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        <ol className="relative z-10 grid gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.li key={s.title} className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.25 }}>
              <div className={`relative grid h-20 w-20 place-items-center rounded-3xl text-4xl shadow-clay ${s.bg}`}>
                {s.icon}
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-coral font-display text-sm font-extrabold text-white">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-muted">{s.desc}</p>
                          </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
