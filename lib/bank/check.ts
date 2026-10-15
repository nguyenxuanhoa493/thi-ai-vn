import type { AnswerValue, GraphPoint, Question, SpeakAnswer } from './types';
import { countWords } from './simulate';

export interface CheckResult { correct: boolean; fraction: number }

const TF_FRACTION = [0, 0.1, 0.25, 0.5, 1];
const bool = (ok: boolean): CheckResult => ({ correct: ok, fraction: ok ? 1 : 0 });
const sameArray = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((v, i) => v === b[i]);

export function normalizeNumber(raw: string): number | null {
  let s = raw.trim().replace(/\s+/g, '');
  const tex = s.match(/^(-?)\\frac\{(-?[\d.,]+)\}\{(-?[\d.,]+)\}$/);
  if (tex) s = `${tex[1]}${tex[2]}/${tex[3]}`;
  s = s.replace(/[()]/g, '').replace(/,/g, '.');
  if (!s) return null;
  const num = /^-?\d+(?:\.\d+)?$/;
  const frac = s.split('/');
  if (frac.length === 2) {
    if (!num.test(frac[0]) || !num.test(frac[1])) return null;
    const d = Number(frac[1]);
    return d === 0 ? null : Number(frac[0]) / d;
  }
  return num.test(s) ? Number(s) : null;
}

export function checkAnswer(q: Question, a: AnswerValue): CheckResult {
  if (a === null || a === undefined) return bool(false);
  switch (q.type) {
    case 'mcq':
    case 'listen':
      return bool(a === q.answer);
    case 'multi': {
      if (!Array.isArray(a)) return bool(false);
      const sorted = [...(a as number[])].sort((x, y) => x - y);
      return bool(sameArray(sorted, [...q.answer].sort((x, y) => x - y)));
    }
    case 'tf4': {
      if (!Array.isArray(a)) return bool(false);
      const k = q.answer.filter((v, i) => (a as (boolean | null)[])[i] === v).length;
      return { correct: k === 4, fraction: TF_FRACTION[k] };
    }
    case 'short': {
      const n = normalizeNumber(String(a));
      const t = normalizeNumber(q.answer);
      return bool(n !== null && t !== null && Math.abs(n - t) <= 0.005);
    }
    case 'order':
    case 'match':
      return bool(Array.isArray(a) && sameArray(a as number[], q.answer));
    case 'fill': {
      if (!Array.isArray(a)) return bool(false);
      const arr = a as string[];
      return bool(q.answer.every((w, i) => (arr[i] ?? '').trim().toLowerCase() === w.toLowerCase()));
    }
    case 'graph': {
      const p = a as GraphPoint;
      return bool(typeof p?.x === 'number' && Math.abs(p.x - q.answer.x) <= 0.25 && Math.abs(p.y - q.answer.y) <= 0.25);
    }
    case 'speak':
      return bool(((a as SpeakAnswer).durationMs ?? 0) >= 1000);
    case 'write':
      return bool(countWords(String(a)) >= q.minWords);
  }
}
