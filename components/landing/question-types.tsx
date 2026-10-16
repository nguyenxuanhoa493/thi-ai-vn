'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { AudioLines, CircleDot, FileText, Link2, Mic, PencilLine, Puzzle, ListChecks, ListOrdered, SquareCheckBig, TrendingUp } from 'lucide-react';

const TYPES = [
  { icon: CircleDot, tint: 'bg-lavender-soft text-lavender-dark', name: 'Trắc nghiệm', ex: 'Chọn 1 đáp án đúng trong A–D.' },
  { icon: ListChecks, tint: 'bg-mint text-mint-dark', name: 'Nhiều đáp án', ex: 'Chọn tất cả các đáp án đúng.' },
  { icon: SquareCheckBig, tint: 'bg-peach text-peach-dark', name: 'Đúng/Sai 4 ý', ex: 'Xét đúng sai từng ý a, b, c, d.' },
  { icon: PencilLine, Puzzle, tint: 'bg-lavender-soft text-lavender-dark', name: 'Trả lời ngắn', ex: 'Nhập kết quả, ví dụ x = 3.' },
  { icon: ListOrdered, tint: 'bg-mint text-mint-dark', name: 'Sắp xếp', ex: 'Xếp các bước giải theo thứ tự.' },
  { icon: Link2, tint: 'bg-peach text-peach-dark', name: 'Nối cặp', ex: 'Nối từ vựng với nghĩa phù hợp.' },
  { icon: Puzzle, tint: 'bg-lavender-soft text-lavender-dark', name: 'Điền chỗ trống', ex: 'Kéo từ vào chỗ trống trong câu.' },
  { icon: TrendingUp, tint: 'bg-mint text-mint-dark', name: 'Đồ thị', ex: 'Chọn giao điểm hai đường thẳng.' },
  { icon: AudioLines, tint: 'bg-peach text-peach-dark', name: 'Nghe', ex: 'Nghe đoạn audio rồi trả lời.' },
  { icon: Mic, tint: 'bg-lavender-soft text-lavender-dark', name: 'Nói', ex: 'Đọc to câu mẫu và nhận xét.' },
  { icon: FileText, tint: 'bg-mint text-mint-dark', name: 'Viết', ex: 'Viết đoạn văn ngắn theo gợi ý.' },
];

export function QuestionTypes() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const auto = !reduce && !paused && inView;
  useEffect(() => {
    if (!auto) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0; let last = performance.now(); let pos = el.scrollLeft;
    const tick = (now: number) => {
      const dt = now - last; last = now;
      const half = el.scrollWidth / 2;
      if (half > 0) {
        pos = Math.abs(el.scrollLeft - Math.round(pos)) > 2 ? el.scrollLeft : pos; // người dùng vừa kéo tay
        pos += dt * 0.04; // ~40px/giây
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);
  const list = reduce ? TYPES : [...TYPES, ...TYPES];
  return (
    <section id="dang-cau-hoi" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-4xl font-extrabold">11 dạng câu hỏi</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted">Không chỉ trắc nghiệm: luyện đủ kỹ năng như bài thi thật.</p>
      </div>
      <div ref={ref} tabIndex={0} role="group" aria-label="Danh sách 11 dạng câu hỏi"
        onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}
        className={`mx-auto mt-10 flex max-w-7xl ${auto ? '' : 'snap-x snap-mandatory'} gap-4 overflow-x-auto px-4 pb-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
        {list.map((t, i) => (
          <div key={`${t.name}-${i}`} aria-hidden={i >= TYPES.length || undefined} className="w-56 shrink-0 snap-start rounded-3xl bg-white p-5 shadow-clay">
            <span aria-hidden className={`grid h-12 w-12 place-items-center rounded-2xl ${t.tint}`}><t.icon size={24} strokeWidth={2.25} /></span>
            <h3 className="mt-3 font-display text-lg font-extrabold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.ex}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
