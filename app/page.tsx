import { LandingNav } from '@/components/landing/landing-nav';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Pillars } from '@/components/landing/pillars';
import { ZoneTeaser } from '@/components/landing/zone-teaser';
import { ExamBuilderDemo } from '@/components/landing/exam-builder-demo';
import { FooterCta } from '@/components/landing/footer-cta';
import { NxbBadge } from '@/components/ui/nxb-badge';

export default function Home() {
  return (
    <>
      <LandingNav />
      <Hero />
      <Stats />
      <Pillars />
      <ZoneTeaser />
      <section id="nha-truong" className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 py-24">
        <div className="max-w-3xl space-y-4">
          <span className="rounded-full bg-lavender-soft px-3 py-1 text-sm font-bold text-lavender-dark">Dành cho nhà trường & giáo viên</span>
          <h2 className="text-4xl font-extrabold leading-tight">Tổ chức thi ngay, không cần soạn đề</h2>
          <p className="text-lg text-muted">Chọn môn, lớp và ma trận mức độ, hệ thống lấy câu hỏi từ ngân hàng 40.000 câu <NxbBadge /> và tạo đề cho bài 15 phút, 45 phút, giữa kỳ, cuối kỳ chỉ trong vài giây.</p>
        </div>
        <ExamBuilderDemo />
      </section>
      <FooterCta />
    </>
  );
}
