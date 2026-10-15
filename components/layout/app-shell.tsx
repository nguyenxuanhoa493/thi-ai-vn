'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useDemo } from '@/lib/store/demo-store';
import { useHydrated } from '@/lib/store/use-hydrated';
import { Owl } from '@/components/owl/owl';
import { GRADES, type Grade } from '@/lib/bank/types';

const NAV = [
  { href: '/dashboard', label: 'Trang chủ' },
  { href: '/luyen-tap', label: 'Luyện tập' },
  { href: '/danh-gia', label: 'Đánh giá AI' },
  { href: '/learning-zone', label: 'Learning Zone' },
  { href: '/phong-thi', label: 'Phòng thi' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { streak, xp, profile, setGrade, resetDemo } = useDemo();
  const focus = /^\/phong-thi\/.+/.test(pathname);

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center"><Owl state="thinking" size={90} /></div>;
  }
  if (focus) return <div className="min-h-screen">{children}</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <Owl size={36} /> thi<span className="text-coral">.ai</span>.vn
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link key={n.href} href={n.href} className="relative rounded-xl px-3.5 py-2 text-sm font-semibold">
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-white shadow-clay" />}
                  <span className={`relative ${active ? 'text-coral' : 'text-muted hover:text-ink'}`}>{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-clay" title="Chuỗi ngày học">🔥 <span>{streak.count}</span></span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-clay" title="Điểm kinh nghiệm">⭐ {xp.toLocaleString('vi-VN')}</span>
            <label className="sr-only" htmlFor="grade">Chọn lớp</label>
            <select id="grade" value={profile.grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}
              className="rounded-xl bg-white px-2 py-1.5 shadow-clay outline-none">
              {GRADES.map((g) => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
            <button type="button" title="Reset demo" aria-label="Reset demo"
              onClick={() => { if (confirm('Xoá toàn bộ tiến độ demo và bắt đầu lại?')) resetDemo(); }}
              className="rounded-xl bg-white px-3 py-1.5 shadow-clay hover:text-coral">↺</button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral font-display text-white">{profile.name[0]}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
