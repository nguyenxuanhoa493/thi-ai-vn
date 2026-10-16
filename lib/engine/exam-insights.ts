import type { Level, Question } from '@/lib/bank/types';
import type { ExamResult } from './exam';

export interface SkillStat { skillId: string; correct: number; total: number; ratio: number }
export interface ExamInsights {
  /** đúng hoàn toàn / đúng một phần / chưa đúng */
  outcome: { correct: number; partial: number; wrong: number };
  bySkill: SkillStat[];
  headline: string;
  notes: string[];
}

const ratio = (r: { correct: number; total: number }) => (r.total ? r.correct / r.total : 0);

/** Nhận xét "AI" cho kết quả bài thi: luật cố định, lời lẽ tích cực (mockup, không gọi AI thật). */
export function examInsights(result: ExamResult, questions: Question[], durationMin: number, skillName: (id: string) => string): ExamInsights {
  const outcome = { correct: 0, partial: 0, wrong: 0 };
  const skills = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const pq = result.perQuestion.find((p) => p.questionId === q.id);
    const f = pq?.fraction ?? 0;
    if (pq?.correct) outcome.correct += 1; else if (f > 0) outcome.partial += 1; else outcome.wrong += 1;
    const s = skills.get(q.skillId) ?? { correct: 0, total: 0 };
    s.total += 1; s.correct += pq?.correct ? 1 : 0;
    skills.set(q.skillId, s);
  }
  const bySkill = [...skills.entries()]
    .map(([skillId, s]) => ({ skillId, ...s, ratio: ratio(s) }))
    .sort((a, b) => b.ratio - a.ratio || b.total - a.total);

  const score = result.score10;
  const headline = score >= 8 ? 'Bài làm rất tốt! Em đã nắm vững phần lớn kiến thức của đề.'
    : score >= 6.5 ? 'Bài làm khá tốt, chỉ còn vài chỗ cần củng cố thêm.'
    : score >= 5 ? 'Em đã đạt yêu cầu. Ôn thêm vài phần dưới đây là điểm sẽ lên nhanh.'
    : 'Đề này còn khá mới với em. Bé Cú đã chọn sẵn những phần nên ôn trước.';

  const notes: string[] = [];
  const strong = bySkill.filter((s) => s.ratio >= 0.8).slice(0, 2);
  const weak = bySkill.filter((s) => s.ratio < 0.5).reverse().slice(0, 2);
  if (strong.length) notes.push(`Điểm mạnh: ${strong.map((s) => skillName(s.skillId)).join(', ')}.`);
  if (weak.length) notes.push(`Nên ôn lại: ${weak.map((s) => skillName(s.skillId)).join(', ')}. Luyện ở Learning Zone để tiến bộ từng bước.`);

  const lv = (l: Level) => result.byLevel[l];
  const basic = { correct: lv('NB').correct + lv('TH').correct, total: lv('NB').total + lv('TH').total };
  const apply = { correct: lv('VD').correct + lv('VDC').correct, total: lv('VD').total + lv('VDC').total };
  if (basic.total && apply.total && ratio(basic) >= 0.7 && ratio(apply) < 0.5) {
    notes.push('Em nắm lý thuyết tốt; các câu vận dụng còn lúng túng. Hãy luyện thêm bài tập vận dụng.');
  } else if (basic.total && ratio(basic) < 0.5) {
    notes.push('Nên ôn lại kiến thức nền (nhận biết, thông hiểu) trước khi chuyển sang câu khó hơn.');
  } else if (apply.total && ratio(apply) >= 0.7) {
    notes.push('Em xử lý câu vận dụng rất tốt, thử sức với đề nâng cao nhé.');
  }

  const usedShare = durationMin > 0 ? result.durationUsedSec / (durationMin * 60) : 1;
  if (usedShare < 0.4 && score < 6.5) notes.push('Em làm bài khá nhanh. Lần sau hãy dành thêm thời gian đọc kỹ đề và kiểm tra lại.');
  if (result.violations > 0) notes.push(`Có ${result.violations} lần rời màn hình trong lúc làm bài. Lần sau em tập trung hơn nhé.`);
  return { outcome, bySkill, headline, notes };
}
