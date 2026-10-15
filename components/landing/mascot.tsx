'use client';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Owl, type OwlState } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';

export interface Mood { state: OwlState; text: string }
interface Ctx { mood: Mood | null; setMood: (m: Mood | null) => void }

const MascotCtx = createContext<Ctx>({ mood: null, setMood: () => {} });

/** Bé Cú nhỏ ở góc dưới-trái (chỉ desktop), đổi trạng thái/lời thoại theo khu vực đang xem.
 *  Góc dưới-phải để dành cho nút chat. */
function StickyOwl() {
  const { mood } = useContext(MascotCtx);
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-30 hidden lg:block" aria-hidden={!mood}>
      <AnimatePresence>
        {mood && (
          <motion.div key="sticky-owl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="flex flex-col items-start gap-1">
            <OwlBubble text={mood.text} side="left" />
            <Owl state={mood.state} size={84} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MascotProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<Mood | null>(null);
  const value = useMemo(() => ({ mood, setMood }), [mood]);
  return <MascotCtx.Provider value={value}>{children}<StickyOwl /></MascotCtx.Provider>;
}

/** Khi vùng này nằm giữa màn hình, Bé Cú nhỏ đổi sang mood tương ứng (null = ẩn). */
export function MascotZone({ mood, children, className }: { mood: Mood | null; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const { setMood } = useContext(MascotCtx);
  const state = mood?.state; const text = mood?.text;
  useEffect(() => { if (inView) setMood(state && text ? { state, text } : null); }, [inView, state, text, setMood]);
  return <div ref={ref} className={className}>{children}</div>;
}
