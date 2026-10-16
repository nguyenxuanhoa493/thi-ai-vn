'use client';
import { useState } from 'react';

const ITEMS = [
  { q: 'Learning Zone là gì?', a: 'Là vùng kiến thức vừa sức với riêng em: câu hỏi không quá dễ gây chán, không quá khó gây nản. Khi em làm đúng ổn định, vùng tự mở rộng sang mức độ và kiến thức mới.' },
  { q: 'Ngân hàng đề lấy từ đâu?', a: 'Hơn 40.000 câu hỏi được biên soạn theo chương trình GDPT 2018 và có nhãn NXB phê duyệt, phân loại theo chương, bài và 4 mức độ nhận thức.' },
  { q: 'Nhà trường tổ chức thi như thế nào?', a: 'Giáo viên chọn môn, lớp, ma trận mức độ; hệ thống tạo đề trong vài giây, sinh mã phòng thi (bản demo minh hoạ) để học sinh vào làm bài và tự chấm điểm.' },
  { q: 'Có miễn phí cho học sinh không?', a: 'Bản demo hiện tại cho em học thử miễn phí, chưa cần thanh toán. Gói chính thức sẽ được công bố khi sản phẩm ra mắt.' },
  { q: 'Dùng trên điện thoại được không?', a: 'Được. Giao diện tự điều chỉnh theo màn hình điện thoại, máy tính bảng và máy tính để bàn.' },
  { q: 'Dữ liệu của học sinh được xử lý ra sao?', a: 'Bản demo chỉ lưu dữ liệu trên trình duyệt của em; khi triển khai thật, dữ liệu học sinh sẽ được bảo vệ theo chính sách của nhà trường.' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="hoi-dap" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-4xl font-extrabold">Câu hỏi thường gặp</h2>
      <div className="mt-10 space-y-3">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className="overflow-hidden rounded-2xl bg-white shadow-clay">
              <h3>
                <button type="button" id={`faq-btn-${i}`} aria-expanded={isOpen} aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg font-bold">
                  {it.q}
                  <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft text-lavender-dark transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                </button>
              </h3>
              <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} inert={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden"><p className="px-5 pb-5 leading-relaxed text-muted">{it.a}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
