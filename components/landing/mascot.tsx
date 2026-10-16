'use client';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import {
  createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  useSyncExternalStore, type ReactNode,
} from 'react';
import { Owl, type OwlState } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';

export interface Mood { state: OwlState; text: string }
/** Chỗ Bé Cú bay đến khi section đang xem: đậu ở mép trái/phải phần đệm trên của section,
 *  hoặc 'home' = đáp vào con cú có sẵn của section (phần tử có data-owl-home) rồi nhường chỗ cho nó. */
export type Perch = 'left' | 'right' | 'home';

interface Zone { el: HTMLElement; mood: Mood | null; perch: Perch }
interface Ctx {
  register: (id: string, z: Zone | null) => void;
  /** zone mà Bé Cú bay đang đáp và nhường chỗ (zone 'home'); null khi đang bay hoặc đang đậu ở zone khác */
  landedHome: string | null;
  /** false khi chưa có cú bay (màn hình nhỏ) hoặc cú bay chưa đặt chỗ lần đầu → mọi cú có sẵn đều hiện */
  enabled: boolean;
}
const MascotCtx = createContext<Ctx>({ register: () => {}, landedHome: null, enabled: false });
const ZoneIdCtx = createContext<string | null>(null);

const FLYER = 72; // px, kích thước cú bay
const CONTENT = 1280; // max-w-7xl
const GUTTER = 24;
const XL = '(min-width: 1280px)';

function useIsXl() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window.matchMedia !== 'function') return () => {};
      const m = window.matchMedia(XL); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb);
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(XL).matches,
    () => false,
  );
}

/** Con cú có sẵn trong một zone 'home' dùng hook này để biết lúc nào hiện (cú bay đã đáp vào) và lúc nào ẩn (cú đã bay đi). */
export function useOwlHome() {
  const zoneId = useContext(ZoneIdCtx);
  const { landedHome, enabled } = useContext(MascotCtx);
  return !enabled || landedHome === zoneId;
}

interface Target { x: number; y: number; scale: number; zoneId: string; perch: Perch; mood: Mood | null }

function measure(zones: Map<string, Zone>, w: HTMLElement | null, id: string): Target | null {
  const z = zones.get(id);
  if (!z || !w) return null;
  const wr = w.getBoundingClientRect(); const zr = z.el.getBoundingClientRect();
  if (z.perch === 'home') {
    const home = z.el.querySelector<HTMLElement>('[data-owl-home]');
    if (!home) return null;
    const hr = home.getBoundingClientRect();
    // offsetWidth: kích thước thật, không bị ảnh hưởng bởi scale khi cú có sẵn đang ẩn
    const s = home.offsetWidth / FLYER;
    // tâm cú bay trùng tâm cú có sẵn
    return { x: hr.left - wr.left + hr.width / 2 - FLYER / 2, y: hr.top - wr.top + hr.height / 2 - (FLYER * 0.95) / 2, scale: s, zoneId: id, perch: z.perch, mood: z.mood };
  }
  const inset = Math.max(GUTTER, (wr.width - CONTENT) / 2 + GUTTER);
  const px = z.perch === 'left' ? inset : wr.width - inset - FLYER;
  return { x: px, y: zr.top - wr.top + 6, scale: 1, zoneId: id, perch: z.perch, mood: z.mood };
}

function Flyer({ zones, active, wrap, onLanded }: {
  zones: React.RefObject<Map<string, Zone>>; active: string | null; wrap: React.RefObject<HTMLDivElement | null>;
  onLanded: (id: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0); const y = useMotionValue(0); const scale = useMotionValue(1); const rotate = useMotionValue(0);
  const [flying, setFlying] = useState(false);
  const [shown, setShown] = useState<Target | null>(null);
  const placed = useRef(false);


  useEffect(() => {
    if (!active) return;
    const t = measure(zones.current, wrap.current, active);
    if (!t) return;
    // lần đầu (hoặc giảm chuyển động): đặt thẳng vào chỗ, không bay
    if (!placed.current || reduce) {
      placed.current = true;
      x.set(t.x); y.set(t.y); scale.set(t.scale); rotate.set(0);
      setShown(t); setFlying(false); onLanded(t.perch === 'home' ? t.zoneId : null);
      return;
    }
    onLanded(null);
    setShown(t); setFlying(true);
    const x0 = x.get(); const y0 = y.get();
    const dist = Math.hypot(t.x - x0, t.y - y0);
    const duration = Math.min(1.6, 0.8 + dist / 2500);
    const dir = Math.sign(t.x - x0) || 1;
    const ease = 'easeInOut' as const;
    // đường vòng cung: lượn ra giữa trang và nhấc lên một chút trước khi đáp
    const midX = (x0 + t.x) / 2 + (Math.abs(t.x - x0) < 40 ? -dir * 160 : 0);
    const midY = (y0 + t.y) / 2 - 80;
    const opts = { duration, ease, times: [0, 0.5, 1] };
    const anims = [
      animate(x, [x0, midX, t.x], opts),
      animate(y, [y0, midY, t.y], opts),
      animate(scale, [scale.get(), 1, t.scale], opts),
      animate(rotate, [0, dir * 14, 0], opts),
    ];
    let cancelled = false;
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (cancelled) return;
      setFlying(false); onLanded(t.perch === 'home' ? t.zoneId : null);
    });
    return () => { cancelled = true; anims.forEach((a) => a.stop()); };
  }, [active, zones, wrap, reduce, x, y, scale, rotate, onLanded]);

  // giữ đúng chỗ đậu khi đổi kích thước cửa sổ / nội dung trang đổi chiều cao
  useEffect(() => {
    const w = wrap.current;
    if (!w || !active) return;
    const ro = new ResizeObserver(() => {
      if (flying) return;
      const t = measure(zones.current, wrap.current, active);
      if (t) { x.set(t.x); y.set(t.y); scale.set(t.scale); }
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, [zones, wrap, active, flying, x, y, scale]);

  if (!shown) return null;
  const atHome = !flying && shown.perch === 'home';
  const bubble = !flying && !atHome ? shown.mood?.text ?? null : null;
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-30"
      style={{ x, y, scale, rotate, width: FLYER, originX: 0.5, originY: 0.5, opacity: atHome ? 0 : 1 }}>
      <Owl state={flying ? 'fly' : shown.mood?.state ?? 'idle'} size={FLYER} />
      {bubble && (
        <div className={`absolute top-1/2 w-max -translate-y-1/2 ${shown.perch === 'left' ? 'left-full ml-2' : 'right-full mr-2'}`}>
          <OwlBubble text={bubble} side={shown.perch === 'left' ? 'right' : 'left'} />
        </div>
      )}
    </motion.div>
  );
}

export function MascotProvider({ children }: { children: ReactNode }) {
  const zones = useRef(new Map<string, Zone>());
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [landedHome, setLandedHome] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const isXl = useIsXl();
  const onLanded = useCallback((id: string | null) => { setReady(true); setLandedHome(id); }, []);
  const register = useCallback((id: string, z: Zone | null) => { if (z) zones.current.set(id, z); else zones.current.delete(id); }, []);
  // zone đang xem = zone cắt đường giữa màn hình; cuộn tới cuối trang thì lấy zone cuối cùng
  // (footer thấp, không bao giờ chạm được đường giữa)
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const list = [...zones.current.entries()].map(([id, z]) => ({ id, r: z.el.getBoundingClientRect() })).sort((p, q) => p.r.top - q.r.top);
      if (!list.length) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const mid = window.innerHeight / 2;
      const hit = atBottom ? list[list.length - 1] : list.find((z) => z.r.top <= mid && z.r.bottom > mid);
      if (hit) setActive(hit.id);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const value = useMemo<Ctx>(() => ({ register, landedHome, enabled: isXl && ready }), [register, landedHome, isXl, ready]);
  return (
    <MascotCtx.Provider value={value}>
      <div ref={wrap} className="relative">
        {children}
        {isXl && <Flyer zones={zones} active={active} wrap={wrap} onLanded={onLanded} />}
      </div>
    </MascotCtx.Provider>
  );
}

/** Khi vùng này nằm giữa màn hình, Bé Cú bay tới chỗ đậu của vùng và nói câu tương ứng. */
export function MascotZone({ mood, perch = 'right', children, className }: { mood: Mood | null; perch?: Perch; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { register } = useContext(MascotCtx);
  const state = mood?.state; const text = mood?.text;
  useLayoutEffect(() => {
    if (!ref.current) return;
    register(id, { el: ref.current, mood: state && text ? { state, text } : null, perch });
    return () => register(id, null);
  }, [id, register, state, text, perch]);
  return <ZoneIdCtx.Provider value={id}><div ref={ref} className={className}>{children}</div></ZoneIdCtx.Provider>;
}

/** Bọc con cú có sẵn của một zone 'home': ẩn khi Bé Cú đã bay đi, hiện lại khi cú bay đáp về. */
export function OwlHome({ children, className }: { children: ReactNode; className?: string }) {
  const present = useOwlHome();
  return (
    <motion.div data-owl-home className={className} initial={false}
      animate={{ opacity: present ? 1 : 0, scale: present ? 1 : 0.6 }} transition={{ duration: present ? 0.15 : 0.2 }}>
      {children}
    </motion.div>
  );
}
