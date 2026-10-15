'use client';
/* eslint-disable @next/next/no-img-element -- SVG tĩnh trong /public, không cần tối ưu ảnh */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { QuestionImage as QImage } from '@/lib/bank/types';

/** Hình minh hoạ của câu hỏi: khung clay, bấm để phóng to (lightbox, Esc/bấm nền để đóng).
 *  Lightbox render qua portal vào body vì tổ tiên có transform (template animation) làm lệch position: fixed. */
export function QuestionImage({ image }: { image: QImage }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Đóng lightbox và trả focus về khung hình đã mở nó
  const close = useCallback(() => { setOpen(false); triggerRef.current?.focus(); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    // Khoá cuộn trang nền khi đang phóng to
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);
  return (
    <>
      <figure className="flex justify-center">
        <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-label={`Phóng to hình: ${image.alt}`}
          className="cursor-zoom-in rounded-2xl bg-white p-3 shadow-clay transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-lavender-dark">
          <img src={image.src} alt={image.alt} width={image.width} height={image.height}
            className="mx-auto block h-auto max-h-[260px] w-auto max-w-full object-contain" />
        </button>
      </figure>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={image.alt} onClick={close}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <img src={image.src} alt={image.alt}
            className="h-auto max-h-[90vh] w-[min(94vw,880px)] rounded-2xl bg-white object-contain p-3 shadow-clay-lg" />
          <button type="button" autoFocus onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-4 right-4 cursor-pointer rounded-xl bg-white/90 px-4 py-2 font-semibold text-ink shadow-clay transition hover:bg-white focus-visible:outline-2 focus-visible:outline-lavender-dark">
            Đóng
          </button>
          <span className="sr-only">Nhấn Esc hoặc bấm ra ngoài để đóng</span>
        </div>,
        document.body,
      )}
    </>
  );
}
