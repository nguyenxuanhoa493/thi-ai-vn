import { questionsFor } from '.';
import { LEVELS, type Grade, type Subject } from './types';

export type ExamKind = '15p' | '45p' | 'giua-ky' | 'cuoi-ky';
export const EXAM_KIND_LABEL: Record<ExamKind, string> = {
  '15p': 'Kiểm tra 15 phút', '45p': 'Kiểm tra 45 phút', 'giua-ky': 'Thi giữa kỳ', 'cuoi-ky': 'Thi cuối kỳ',
};
export interface ExamDef {
  id: string; title: string; kind: ExamKind; subject: Subject; grade: Grade;
  durationMin: number; questionIds: string[]; schedule: string;
}

function pick(subject: Subject, grade: Grade, count: number, skillIds?: string[]): string[] {
  const pool = questionsFor(subject, grade)
    .filter((q) => q.type !== 'speak' && (!skillIds || skillIds.includes(q.skillId)))
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
  return pool.slice(0, count).map((q) => q.id);
}

export const EXAMS: ExamDef[] = [
  { id: 'toan9-15p-can', title: 'Kiểm tra 15 phút — Căn bậc hai', kind: '15p', subject: 'toan', grade: 9, durationMin: 15,
    questionIds: pick('toan', 9, 8, ['t9-can-bac-hai', 't9-bien-doi-can']), schedule: 'Đang mở · hạn 20/10' },
  { id: 'toan9-45p-hpt', title: 'Kiểm tra 45 phút — Hệ phương trình', kind: '45p', subject: 'toan', grade: 9, durationMin: 45,
    questionIds: pick('toan', 9, 15, ['t9-hpt-khai-niem', 't9-hpt-giai', 't9-hpt-bai-toan', 't9-bpt']), schedule: 'Đang mở · hạn 22/10' },
  { id: 'anh9-giua-ky', title: 'Thi giữa kỳ I — Tiếng Anh 9', kind: 'giua-ky', subject: 'anh', grade: 9, durationMin: 60,
    questionIds: pick('anh', 9, 20), schedule: 'Thứ Hai 28/10 · 7:30' },
  { id: 'toan9-cuoi-ky', title: 'Thi cuối kỳ I — Toán 9', kind: 'cuoi-ky', subject: 'toan', grade: 9, durationMin: 90,
    questionIds: pick('toan', 9, 25), schedule: 'Thứ Sáu 20/12 · 7:30' },
  { id: 'toan6-15p', title: 'Kiểm tra 15 phút — Số tự nhiên', kind: '15p', subject: 'toan', grade: 6, durationMin: 15,
    questionIds: pick('toan', 6, 8), schedule: 'Đang mở · hạn 21/10' },
  { id: 'anh6-15p', title: 'Kiểm tra 15 phút — Present simple', kind: '15p', subject: 'anh', grade: 6, durationMin: 15,
    questionIds: pick('anh', 6, 8), schedule: 'Đang mở · hạn 23/10' },
  { id: 'toan12-45p', title: 'Kiểm tra 45 phút — Đạo hàm', kind: '45p', subject: 'toan', grade: 12, durationMin: 45,
    questionIds: pick('toan', 12, 10), schedule: 'Đang mở · hạn 25/10' },
  { id: 'anh12-15p', title: 'Kiểm tra 15 phút — Cấu trúc nâng cao', kind: '15p', subject: 'anh', grade: 12, durationMin: 15,
    questionIds: pick('anh', 12, 8), schedule: 'Đang mở · hạn 24/10' },
];

export const examsFor = (grade: Grade) => EXAMS.filter((e) => e.grade === grade);
export const getExam = (id: string) => EXAMS.find((e) => e.id === id);
