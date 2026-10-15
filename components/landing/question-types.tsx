'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const TYPES = [
  { icon: '🔘', name: 'Trắc nghiệm', ex: 'Chọn 1 đáp án đúng trong A–D.' },
  { icon: '☑️', name: 'Nhiều đáp án', ex: 'Chọn tất cả các đáp án đúng.' },
  { icon: '✅', name: 'Đúng/Sai 4 ý', ex: 'Xét đúng sai từng ý a, b, c, d.' },
  { icon: '✍️', name: 'Trả lời ngắn', ex: 'Nhập kết quả, ví dụ x = 3.' },
  { icon: '🔀', name: 'Sắp xếp', ex: 'Xếp các bước giải theo thứ tự.' },
  { icon: '🔗', name: 'Nối cặp', ex: 'Nối từ vựng với nghĩa phù hợp.' },
  { icon: '🧩', name: 'Điền chỗ trống', ex: 'Kéo từ vào chỗ trống trong câu.' },
  { icon: '📈', name: 'Đồ thị', ex: 'Chọn giao điểm hai đường thẳng.' },
  { icon: '🎧', name: 'Nghe', ex: 'Nghe đoạn audio rồi trả lời.' },
  { icon: '🎤', name: 'Nói', ex: 'Đọc to câu mẫu và nhận xét.' },
  { icon: '📝', name: 'Viết', ex: 'Viết đoạn văn ngắn theo gợi ý.' },
];

export function QuestionTypes() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduce || paused) return;
    const el = ref.current;
    if (!el) return;
    let dir = 1;
    const id = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 1) dir = -1;
      else if (el.scrollLeft <= 0) dir = 1;
      el.scrollLeft += dir * 1;
    }, 30);
    return () => clearInterval(id);
  }, [reduce, paused]);
  return (
    <section id="dang-cau-hoi" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-4xl font-extrabold">11 dạng câu hỏi</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted">Không chỉ trắc nghiệm: luyện đủ kỹ năng như bài thi thật.</p>
      </div>
      <div ref={ref} tabIndex={0} role="group" aria-label="Danh sách 11 dạng câu hỏi"
        onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        className="mx-auto mt-10 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPES.map((t) => (
          <div key={t.name} className="w-56 shrink-0 snap-start rounded-3xl bg-white p-5 shadow-clay">
            <p className="text-4xl">{t.icon}</p>
            <h3 className="mt-3 font-display text-lg font-extrabold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.ex}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
