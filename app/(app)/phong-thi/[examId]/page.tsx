import { EXAMS, getExam } from '@/lib/bank/exams';
import { ExamRoom } from '@/components/exam/exam-room';
import { ClayCard } from '@/components/ui/clay-card';

// Next 16 cacheComponents: dynamic params must be known at build time.
export function generateStaticParams() {
  return EXAMS.map((e) => ({ examId: e.id }));
}

export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) return <ClayCard className="m-10 p-10 text-center">Không tìm thấy bài thi.</ClayCard>;
  return <ExamRoom exam={exam} />;
}
