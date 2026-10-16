export type Subject = 'toan' | 'anh';
export type Grade = 6 | 9 | 12;
export type Level = 'NB' | 'TH' | 'VD' | 'VDC';

export const LEVELS: Level[] = ['NB', 'TH', 'VD', 'VDC'];
export const GRADES: Grade[] = [6, 9, 12];
export const LEVEL_LABEL: Record<Level, string> = {
  NB: 'Nhận biết', TH: 'Thông hiểu', VD: 'Vận dụng', VDC: 'Vận dụng cao',
};
export const SUBJECT_LABEL: Record<Subject, string> = { toan: 'Toán', anh: 'Tiếng Anh' };

export interface Lesson { id: string; name: string }
export interface Chapter { id: string; subject: Subject; grade: Grade; name: string; order: number; lessons: Lesson[] }
export interface Skill {
  id: string; subject: Subject; grade: Grade; chapterId: string; lessonId: string;
  name: string; prerequisites: string[]; bankCount: number;
}

export interface QuestionImage { src: string; alt: string; width?: number; height?: number }

interface QuestionBase {
  id: string; subject: Subject; grade: Grade; skillId: string; level: Level;
  /** Độ khó Rasch, khoảng -3..3 */
  b: number;
  /** Đề bài; công thức trong $...$ */
  content: string;
  explanation: string;
  hints: readonly string[];
  source: 'NXB';
  /** Hình minh hoạ tĩnh (SVG trong /public), hiển thị dưới đề bài */
  image?: QuestionImage;
}

export type McqQuestion = QuestionBase & { type: 'mcq'; options: string[]; answer: number };
export type MultiQuestion = QuestionBase & { type: 'multi'; options: string[]; answer: number[] };
export type Tf4Question = QuestionBase & { type: 'tf4'; statements: [string, string, string, string]; answer: [boolean, boolean, boolean, boolean] };
export type ShortQuestion = QuestionBase & { type: 'short'; answer: string; unit?: string };
/** items lưu theo thứ tự ĐÚNG; answer = [0..n-1]; UI tự xáo */
export type OrderQuestion = QuestionBase & { type: 'order'; items: string[]; answer: number[] };
/** answer[i] = chỉ số bên phải ghép với left[i] */
export type MatchQuestion = QuestionBase & { type: 'match'; left: string[]; right: string[]; answer: number[] };
/** text chứa các chỗ trống "___" */
export type FillQuestion = QuestionBase & { type: 'fill'; text: string; bank: string[]; answer: string[] };
export type ListenQuestion = QuestionBase & { type: 'listen'; audioText: string; options: string[]; answer: number };
export type SpeakQuestion = QuestionBase & { type: 'speak'; target: string };
export type WriteQuestion = QuestionBase & { type: 'write'; prompt: string; minWords: number };
export type GraphQuestion = QuestionBase & { type: 'graph'; lines: { a: number; b: number; label: string }[]; answer: GraphPoint };

export type Question =
  | McqQuestion | MultiQuestion | Tf4Question | ShortQuestion | OrderQuestion | MatchQuestion
  | FillQuestion | ListenQuestion | SpeakQuestion | WriteQuestion | GraphQuestion;
export type QuestionType = Question['type'];

export interface GraphPoint { x: number; y: number }
export interface SpeakAnswer { durationMs: number }
export type AnswerValue =
  | number | number[] | (boolean | null)[] | string | string[] | GraphPoint | SpeakAnswer | null;
