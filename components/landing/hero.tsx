'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Owl } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { MathText } from '@/components/questions/math-text';

const FLOATING = [
  { text: '$x^2 - 5x + 6 = 0$', cls: 'left-0 top-10 bg-white', d: 0 },
  { text: 'I have been to Hội An ✓', cls: 'right-0 top-0 bg-mint', d: 0.6 },
  { text: '🔥 Combo x5', cls: 'left-8 bottom-16 bg-peach', d: 1.2 },
  { text: '🌱 Vùng mở rộng!', cls: 'right-6 bottom-6 bg-lavender-soft', d: 1.8 },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  return (
    <section onPointerMove={(e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      setLook({ x: Math.max(-1, Math.min(1, (e.clientX - cx) / 400)), y: Math.max(-1, Math.min(1, (e.clientY - cy) / 300)) });
    }} className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 pb-20 pt-12 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-clay">✨ Nền tảng thi & ôn luyện K12 · Toán · Tiếng Anh</span>
        <h1 className="text-5xl font-extrabold leading-[1.1] xl:text-6xl">Học <span className="text-coral">vừa sức</span>,<br />tiến bộ <span className="text-lavender-dark">mỗi ngày</span></h1>
        <p className="max-w-lg text-lg text-muted">AI đánh giá đúng năng lực, Learning Zone đưa ra câu hỏi không quá khó, không quá dễ, và mở rộng dần cùng em. Ngân hàng 40.000 câu hỏi được NXB phê duyệt.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="rounded-2xl bg-coral px-7 py-4 font-display text-lg font-extrabold text-white shadow-[0_6px_0_var(--color-coral-dark)] transition hover:-translate-y-0.5">Học thử miễn phí</Link>
          <a href="#nha-truong" className="rounded-2xl bg-white px-7 py-4 font-display text-lg font-extrabold shadow-[0_6px_0_#e3e6ff] transition hover:-translate-y-0.5">Dành cho nhà trường</a>
        </div>
      </motion.div>
      <div ref={ref} className="relative mx-auto h-[460px] w-full max-w-[520px]">
        <div className="absolute inset-10 rounded-full bg-gradient-to-br from-lavender-soft to-peach blur-2xl" />
        {FLOATING.map((f) => (
          <motion.div key={f.text} className={`absolute max-w-[62%] rounded-2xl px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base font-semibold shadow-clay ${f.cls}`}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ opacity: { delay: 0.4 + f.d * 0.3 }, scale: { delay: 0.4 + f.d * 0.3 }, y: { duration: 4, repeat: Infinity, delay: f.d, ease: 'easeInOut' } }}>
            <MathText text={f.text} />
          </motion.div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <OwlBubble text="Chào em! Mình là Bé Cú 🦉" />
          <Owl state="idle" size={240} lookAt={look} />
        </div>
      </div>
    </section>
  );
}
