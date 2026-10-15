import { LandingNav } from '@/components/landing/landing-nav';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Pillars } from '@/components/landing/pillars';
import { ZoneTeaser } from '@/components/landing/zone-teaser';
import { ExamBuilderDemo } from '@/components/landing/exam-builder-demo';
import { FooterCta } from '@/components/landing/footer-cta';
import { MiniQuiz } from '@/components/landing/mini-quiz';
import { HowItWorks } from '@/components/landing/how-it-works';
import { QuestionTypes } from '@/components/landing/question-types';
import { ParentReport } from '@/components/landing/parent-report';
import { Faq } from '@/components/landing/faq';
import { MascotProvider, MascotZone } from '@/components/landing/mascot';
import { NxbBadge } from '@/components/ui/nxb-badge';

export default function Home() {
  return (
    <MascotProvider>
      <LandingNav />
      <MascotZone mood={null} perch="home"><Hero /></MascotZone>
      <Stats />
      <MascotZone perch="left" mood={{ state: 'idle', text: 'Ba trụ cột này giúp em học vừa sức nè!' }}><Pillars /></MascotZone>
      <MascotZone mood={null} perch="home"><MiniQuiz /></MascotZone>
      <MascotZone perch="right" mood={{ state: 'cheer', text: 'Vùng vừa sức nè!' }}><ZoneTeaser /></MascotZone>
      <MascotZone perch="left" mood={{ state: 'idle', text: 'Chỉ 3 bước là xong!' }}><HowItWorks /></MascotZone>
      <MascotZone perch="right" mood={{ state: 'cheer', text: 'Wow, 11 dạng câu hỏi luôn!' }}><QuestionTypes /></MascotZone>
      <MascotZone perch="left" mood={{ state: 'thinking', text: 'Thầy cô chọn ma trận, Cú lo phần còn lại!' }}>
      <section id="nha-truong" className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 py-24">
        <div className="max-w-3xl space-y-4">
          <span className="rounded-full bg-lavender-soft px-3 py-1 text-sm font-bold text-lavender-dark">Dành cho nhà trường & giáo viên</span>
          <h2 className="text-4xl font-extrabold leading-tight">Tổ chức thi ngay, không cần soạn đề</h2>
          <p className="text-lg text-muted">Chọn môn, lớp và ma trận mức độ, hệ thống lấy câu hỏi từ ngân hàng 40.000 câu <NxbBadge /> và tạo đề cho bài 15 phút, 45 phút, giữa kỳ, cuối kỳ chỉ trong vài giây.</p>
        </div>
        <ExamBuilderDemo />
      </section>
      </MascotZone>
      <MascotZone perch="right" mood={{ state: 'idle', text: 'Cú gửi báo cáo cho ba mẹ nhé!' }}><ParentReport /></MascotZone>
      <MascotZone perch="left" mood={{ state: 'thinking', text: 'Em còn thắc mắc gì không?' }}><Faq /></MascotZone>
      <MascotZone perch="home" mood={null}><FooterCta /></MascotZone>
    </MascotProvider>
  );
}
