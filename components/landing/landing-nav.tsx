import Link from 'next/link';
import { Owl } from '@/components/owl/owl';
import { SoundToggle } from '@/components/landing/sound-toggle';
export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-cream/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"><Owl size={40} /> thi<span className="text-coral">.ai</span>.vn</Link>
        <nav className="hidden flex-1 gap-6 text-sm font-semibold text-muted md:flex">
          <a href="#tinh-nang" className="hover:text-ink">Tính năng</a>
          <a href="#learning-zone" className="hover:text-ink">Learning Zone</a>
          <a href="#nha-truong" className="hover:text-ink">Dành cho nhà trường</a>
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <SoundToggle />
          <Link href="/dashboard" className="rounded-2xl bg-coral px-5 py-2.5 font-display font-extrabold text-white shadow-[0_5px_0_var(--color-coral-dark)] transition hover:-translate-y-0.5">Vào học thử</Link>
        </div>
      </div>
    </header>
  );
}
