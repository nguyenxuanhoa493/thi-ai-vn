import Link from 'next/link';
import { Owl } from '@/components/owl/owl';
import { OwlHome } from '@/components/landing/mascot';
export function FooterCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <div className="flex flex-col items-center gap-6 rounded-[40px] bg-gradient-to-br from-coral to-[#ffb199] p-12 text-center text-white shadow-clay-lg md:flex-row md:text-left">
        <OwlHome><Owl state="cheer" size={140} /></OwlHome>
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold">Sẵn sàng học vừa sức cùng Bé Cú?</h2>
          <p className="mt-2 text-lg opacity-90">Miễn phí cho học sinh. Nhà trường tổ chức thi ngay từ ngân hàng đề chuẩn.</p>
        </div>
        <Link href="/dashboard" className="rounded-2xl bg-white px-8 py-4 font-display text-lg font-extrabold text-coral shadow-[0_6px_0_rgba(0,0,0,0.12)]">Bắt đầu ngay</Link>
      </div>
      <p className="mt-8 text-center text-sm text-muted">© 2026 thi.ai.vn · Bản demo</p>
    </section>
  );
}
