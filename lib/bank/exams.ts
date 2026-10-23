import { questionsFor, SKILLS } from '.';
import { LEVELS, type Grade, type Question, type Subject } from './types';

export type ExamKind = '15p' | '45p' | 'giua-ky' | 'cuoi-ky';
export const EXAM_KIND_LABEL: Record<ExamKind, string> = {
  '15p': 'Kiểm tra 15 phút', '45p': 'Kiểm tra 45 phút', 'giua-ky': 'Thi giữa kỳ', 'cuoi-ky': 'Thi cuối kỳ',
};
export interface ExamDef {
  id: string; title: string; kind: ExamKind; subject: Subject; grade: Grade;
  durationMin: number; questionIds: string[]; schedule: string;
  /** Mã hình minh hoạ cho thumbnail (xem components/ui/topic-art) */
  art: string;
}

/** Tỉ lệ mức độ của ma trận đề: NB 40% · TH 30% · VD 20% · VDC 10% */
const LEVEL_MATRIX = [0.4, 0.3, 0.2, 0.1];

/** Chọn câu theo ma trận mức độ (thiếu ở mức nào thì bù từ mức kề cận), xoay vòng theo skill, tất định. */
function pick(subject: Subject, grade: Grade, count: number, skillIds?: string[]): string[] {
  const pool = questionsFor(subject, grade)
    .filter((q) => q.type !== 'speak' && (!skillIds || skillIds.includes(q.skillId)));
  const n = Math.min(count, pool.length);
  // Trong mỗi mức: xoay vòng giữa các skill để đề phủ đều chủ đề.
  const byLevel = LEVELS.map((lv) => {
    const groups = new Map<string, Question[]>();
    for (const q of pool) if (q.level === lv) groups.set(q.skillId, [...(groups.get(q.skillId) ?? []), q]);
    const lists = [...groups.values()];
    const out: Question[] = [];
    for (let i = 0; out.length < lists.reduce((s, l) => s + l.length, 0); i++)
      for (const l of lists) if (l[i]) out.push(l[i]);
    return out;
  });
  // Số câu mục tiêu mỗi mức: làm tròn theo phần dư lớn nhất (hoà thì ưu tiên mức thấp hơn).
  const target = LEVEL_MATRIX.map((p) => Math.floor(n * p));
  const byRemainder = LEVEL_MATRIX.map((p, i) => i).sort((i, j) => (n * LEVEL_MATRIX[j] % 1) - (n * LEVEL_MATRIX[i] % 1) || i - j);
  for (let k = 0; target.reduce((s, t) => s + t, 0) < n; k++) target[byRemainder[k % LEVELS.length]]++;
  const take = target.map((t, i) => Math.min(t, byLevel[i].length));
  // Bù phần thiếu từ các mức kề cận (khoảng cách 1, rồi 2, rồi 3).
  let short = n - take.reduce((s, t) => s + t, 0);
  for (let d = 1; short > 0 && d < LEVELS.length; d++)
    for (let i = 0; short > 0 && i < LEVELS.length; i++) {
      if (take[i] >= target[i]) continue;
      for (const j of [i - d, i + d]) {
        if (j < 0 || j >= LEVELS.length) continue;
        const add = Math.min(short, byLevel[j].length - take[j]);
        if (add > 0) { take[j] += add; short -= add; }
      }
    }
  return byLevel.flatMap((qs, i) => qs.slice(0, take[i]).map((q) => q.id));
}

const skillsOfChapters = (chapterIds: string[]) =>
  SKILLS.filter((s) => chapterIds.includes(s.chapterId)).map((s) => s.id);

export const EXAMS: ExamDef[] = [
  { id: 'toan9-15p-can', title: 'Kiểm tra 15 phút — Căn bậc hai', kind: '15p', subject: 'toan', grade: 9, durationMin: 15,
    questionIds: pick('toan', 9, 8, ['t9-can-bac-hai', 't9-bien-doi-can']), schedule: 'Đang mở · hạn 20/10', art: 't9-c3' },
  { id: 'toan9-45p-hpt', title: 'Kiểm tra 45 phút — Hệ phương trình', kind: '45p', subject: 'toan', grade: 9, durationMin: 45,
    questionIds: pick('toan', 9, 15, ['t9-hpt-khai-niem', 't9-hpt-giai', 't9-hpt-bai-toan', 't9-bpt']), schedule: 'Đang mở · hạn 22/10', art: 't9-c1' },
  { id: 'anh9-giua-ky', title: 'Thi giữa kỳ I — Tiếng Anh 9', kind: 'giua-ky', subject: 'anh', grade: 9, durationMin: 60,
    questionIds: pick('anh', 9, 20), schedule: 'Thứ Hai 28/10 · 7:30', art: 'exam-paper' },
  { id: 'toan9-cuoi-ky', title: 'Thi cuối kỳ I — Toán 9', kind: 'cuoi-ky', subject: 'toan', grade: 9, durationMin: 90,
    questionIds: pick('toan', 9, 25, skillsOfChapters(['t9-c1', 't9-c2', 't9-c3', 't9-c4'])), schedule: 'Thứ Sáu 20/12 · 7:30', art: 'exam-paper' },
  { id: 'toan6-15p', title: 'Kiểm tra 15 phút — Số tự nhiên', kind: '15p', subject: 'toan', grade: 6, durationMin: 15,
    questionIds: pick('toan', 6, 8, ['t6-so-tu-nhien']), schedule: 'Đang mở · hạn 21/10', art: 't6-c1' },
  { id: 'anh6-15p', title: 'Kiểm tra 15 phút — Present simple', kind: '15p', subject: 'anh', grade: 6, durationMin: 15,
    questionIds: pick('anh', 6, 8, ['e6-present-simple']), schedule: 'Đang mở · hạn 23/10', art: 'e6-c1' },
  { id: 'toan12-45p', title: 'Kiểm tra 45 phút — Đạo hàm', kind: '45p', subject: 'toan', grade: 12, durationMin: 45,
    questionIds: pick('toan', 12, 10, ['t12-don-dieu']), schedule: 'Đang mở · hạn 25/10', art: 't12-c1' },
  { id: 'anh12-15p', title: 'Kiểm tra 15 phút — Cấu trúc nâng cao', kind: '15p', subject: 'anh', grade: 12, durationMin: 15,
    questionIds: pick('anh', 12, 8, ['e12-grammar']), schedule: 'Đang mở · hạn 24/10', art: 'e12-c1' },
];

export const examsFor = (grade: Grade) => EXAMS.filter((e) => e.grade === grade);
export const getExam = (id: string) => EXAMS.find((e) => e.id === id);
