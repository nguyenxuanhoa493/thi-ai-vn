export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export interface SpeakingScore { overall: number; words: { word: string; ok: boolean }[] }

/** Mô phỏng chấm phát âm: tất định theo (target, duration) để demo ổn định. */
export function simulateSpeakingScore(target: string, durationMs: number): SpeakingScore {
  const words = target.split(/\s+/).filter(Boolean);
  const expectedMs = Math.max(1, words.length * 400);
  const pace = Math.min(1, durationMs / expectedMs);
  const overall = Math.min(98, 60 + Math.round(pace * 30) + (hash(target + durationMs) % 8));
  return {
    overall,
    words: words.map((word, i) => ({ word, ok: overall > 90 || hash(word + i + durationMs) % 5 !== 0 })),
  };
}

export interface WritingRubric {
  criteria: { name: string; score: number; max: number; comment: string }[];
  total: number;
  max: number;
}

const half = (n: number) => Math.round(n * 2) / 2;

/** Mô phỏng AI chấm viết theo 4 tiêu chí, thang 10. */
export function simulateWritingRubric(text: string, minWords: number): WritingRubric {
  const words = countWords(text);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const tokens = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const uniqueRatio = tokens.length ? new Set(tokens).size / tokens.length : 0;
  const capitalized = sentences.length > 0 && sentences.every((s) => /^[A-Z]/.test(s));
  const criteria = [
    { name: 'Hoàn thành yêu cầu', score: half(Math.min(2.5, (words / Math.max(1, minWords)) * 2.5)), max: 2.5,
      comment: words >= minWords ? 'Đủ độ dài, đúng chủ đề.' : `Cần viết thêm (tối thiểu ${minWords} từ).` },
    { name: 'Mạch lạc & liên kết', score: half(Math.min(2.5, sentences.length * 0.8)), max: 2.5,
      comment: sentences.length >= 3 ? 'Các ý được sắp xếp rõ ràng.' : 'Hãy chia ý thành nhiều câu hơn.' },
    { name: 'Từ vựng', score: half(Math.min(2.5, uniqueRatio * 3)), max: 2.5,
      comment: uniqueRatio > 0.7 ? 'Vốn từ đa dạng.' : 'Thử dùng thêm từ đồng nghĩa để tránh lặp.' },
    { name: 'Ngữ pháp', score: capitalized ? 2 : 1.5, max: 2.5,
      comment: capitalized ? 'Câu viết đúng cấu trúc cơ bản.' : 'Chú ý viết hoa đầu câu.' },
  ];
  return { criteria, total: half(criteria.reduce((s, c) => s + c.score, 0)), max: 10 };
}
