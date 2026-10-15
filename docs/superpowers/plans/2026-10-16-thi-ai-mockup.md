# thi.ai.vn Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng clickable prototype thi.ai.vn (Landing, Dashboard, Ngân hàng đề/Luyện tập, AI đánh giá năng lực, Learning Zone, Phòng thi) với phong cách Pastel Clay 3D, linh vật Bé Cú, animation mượt và logic mô phỏng chạy thật ở frontend.

**Architecture:** Next.js App Router, frontend-only. Logic nghiệp vụ nằm trong `lib/engine/*` dưới dạng hàm thuần có unit test (IRT/Rasch, CAT, Learning Zone, chấm thi). Dữ liệu câu hỏi mẫu nằm trong `lib/bank/*`. Trạng thái demo dùng Zustand persist vào localStorage. UI gồm các component clay dùng chung, Bé Cú (SVG + Motion), và mỗi dạng câu hỏi là một component với cùng interface.

**Tech Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Motion 14 (`motion/react`), Zustand 5, KaTeX, MathLive, Recharts 3, canvas-confetti, sonner, Vitest 5 + Testing Library (jsdom). Node 22.

**Spec:** `docs/superpowers/specs/2026-10-16-thi-ai-mockup-design.md`

## Global Constraints

- Không có backend, không có đăng nhập thật, không gọi LLM thật. Toàn bộ dữ liệu và logic chạy ở client.
- Ưu tiên desktop ≥1280px; mobile chỉ cần không vỡ layout (không cuộn ngang).
- Toàn bộ chữ trên UI bằng **tiếng Việt** (riêng nội dung câu hỏi Tiếng Anh dùng tiếng Anh).
- Font: **Lexend** (tiêu đề), **Be Vietnam Pro** (nội dung), có subset `vietnamese`.
- Màu: nền kem `#FFF4EC` → xanh nhạt `#EEF3FF`; chính cam san hô `#FF8A65`; phụ lavender `#A8B5FF`; đúng = mint; sai = hồng đào nhạt (không dùng đỏ gắt). Toán = lavender, Tiếng Anh = cam đào.
- Khối bo góc 20–24px, bóng mềm; nút có "độ dày" đất sét (bóng đáy, lún xuống khi nhấn).
- Animation dùng Motion spring, 200–400ms; tôn trọng `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + CSS media query).
- Learning Zone: câu được chọn có xác suất đúng mục tiêu **~70–85%** (TARGET_P = 0.78); ngưỡng thành thạo **≥ 85%**; quá sức **< 50%**.
- Mức độ: `NB` Nhận biết · `TH` Thông hiểu · `VD` Vận dụng · `VDC` Vận dụng cao.
- Thông điệp: "**40.000** câu hỏi · **NXB phê duyệt** · Chuẩn chương trình **GDPT 2018**" (`BANK_TOTAL = 40000`).
- Hồ sơ demo: "Minh", lớp 9; có công tắc lớp 6 / 9 / 12 và nút **Reset demo**.
- Câu Đúng/Sai 4 ý tính điểm theo thang của Bộ: đúng 1/2/3/4 ý → 0.1/0.25/0.5/1 điểm của câu.

## Review Focus

1. **Tải lại trang giữa bài thi**: bài làm, câu đã đánh dấu và số lần vi phạm phải được khôi phục; đồng hồ tính theo `startedAt` (không reset). Nếu đã hết giờ trong lúc đóng tab thì tự nộp ngay khi mở lại. → test trong Task 5 (`exam.test.ts`) và Task 6 (store).
2. **Định dạng câu trả lời ngắn**: `"2,5"`, `"2.5"`, `" 2.5 "`, `"5/2"`, `"(5)/(2)"`, `"\frac{5}{2}"` phải được coi là bằng nhau; chuỗi rác không làm crash. → test trong Task 2 (`check.test.ts`).
3. **Learning Zone hết câu** (bank nhỏ, đã luyện hết, mọi kỹ năng đã thành thạo): phải chuyển sang trạng thái "Hoàn thành phiên", không treo, không lặp vô hạn, không crash. → test trong Task 4 (`learning-zone.test.ts`) và PracticeRunner trong Task 10.
4. **Đổi lớp (6/9/12)** khi chưa có dữ liệu đánh giá/zone cho lớp đó: mọi trang hiển thị trạng thái trống có CTA, không crash. Dữ liệu được tách riêng theo khoá `môn-lớp`. → test trong Task 6 (store) và Task 3 (bank helpers cho mọi lớp).
5. **localStorage hỏng hoặc từ phiên bản cũ**: store phải reset về dữ liệu seed thay vì crash; không lỗi hydration mismatch. → test `sanitizePersisted` trong Task 6.

---

## File Structure

```
app/
  layout.tsx                    # fonts, Providers (MotionConfig, Toaster)
  globals.css                   # Tailwind v4 + tokens
  page.tsx                      # Landing (không dùng AppShell)
  (app)/layout.tsx              # AppShell (nav, chips, grade switch, reset)
  (app)/template.tsx            # page transition
  (app)/dashboard/page.tsx
  (app)/luyen-tap/page.tsx
  (app)/luyen-tap/[id]/page.tsx
  (app)/danh-gia/page.tsx
  (app)/learning-zone/page.tsx
  (app)/phong-thi/page.tsx
  (app)/phong-thi/[examId]/page.tsx
components/
  providers.tsx
  owl/owl.tsx                   # Bé Cú (6 trạng thái)
  owl/owl-bubble.tsx
  ui/clay-button.tsx  ui/clay-card.tsx  ui/count-up.tsx  ui/tilt-card.tsx
  ui/progress-bar.tsx ui/level-pill.tsx ui/nxb-badge.tsx ui/typewriter.tsx
  layout/app-shell.tsx
  questions/types.ts  questions/math-text.tsx  questions/math-field.tsx
  questions/mcq.tsx questions/multi.tsx questions/tf4.tsx questions/short.tsx
  questions/order.tsx questions/match.tsx questions/fill.tsx questions/graph.tsx
  questions/speak.tsx questions/write.tsx questions/question-view.tsx
  questions/feedback-extras.tsx # kết quả mô phỏng nói/viết
  session/practice-runner.tsx   # dùng chung cho Luyện tập & Learning Zone
  zone/zone-rings.tsx
  charts/skill-radar.tsx
  assessment/difficulty-meter.tsx
  landing/*.tsx                 # hero, stats, pillars, zone-teaser, exam-builder-demo, footer-cta
lib/
  bank/types.ts  bank/curriculum.ts  bank/index.ts  bank/exams.ts  bank/practice-sets.ts
  bank/questions/toan-9.ts anh-9.ts toan-6.ts anh-6.ts toan-12.ts anh-12.ts
  bank/check.ts  bank/simulate.ts
  engine/irt.ts engine/assessment.ts engine/learning-zone.ts engine/exam.ts
  engine/exam-builder.ts engine/gamification.ts
  store/demo-store.ts  store/use-hydrated.ts
  ui/confetti.ts
types/mathlive.d.ts
tests/ (cùng cấu trúc với lib/, components/)
```

---

### Task 1: Scaffold dự án, design tokens, test harness

**Files:**
- Create: toàn bộ scaffold Next.js, `app/globals.css`, `app/layout.tsx`, `components/providers.tsx`, `vitest.config.ts`, `tests/setup.ts`, `tests/smoke.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: alias `@/*` → gốc dự án; class Tailwind `bg-cream`, `text-ink`, `bg-coral`, `shadow-clay`, `font-display`…; `npm test` chạy Vitest.

- [ ] **Step 1: Scaffold Next.js vào thư mục tạm rồi chuyển lên gốc** (thư mục gốc đã có `docs/`, `.superpowers/`, nên create-next-app sẽ từ chối)

```bash
cd /Users/xuanhoa/project/landing_k12
npx create-next-app@16 scaffold-tmp --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes
rsync -a --exclude .git --exclude .gitignore scaffold-tmp/ ./
cat scaffold-tmp/.gitignore >> .gitignore
rm -rf scaffold-tmp
git init && git add -A && git commit -m "chore: scaffold Next.js app"
```

- [ ] **Step 2: Cài dependencies**

```bash
npm i motion@14 zustand@5 katex@0.16 mathlive recharts@3 canvas-confetti sonner
npm i -D vitest@5 @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/canvas-confetti @types/katex vite-tsconfig-paths
```

- [ ] **Step 3: Cấu hình Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
```

`tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

Thêm vào `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.

- [ ] **Step 4: Viết smoke test**

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('harness', () => {
  it('runs', () => expect(1 + 1).toBe(2));
});
```

Run: `npm test` → Expected: 1 passed.

- [ ] **Step 5: Design tokens**

`app/globals.css` (thay toàn bộ):
```css
@import "tailwindcss";

@theme {
  --color-cream: #fff4ec;
  --color-sky: #eef3ff;
  --color-coral: #ff8a65;
  --color-coral-dark: #e86a45;
  --color-lavender: #a8b5ff;
  --color-lavender-dark: #7c83db;
  --color-lavender-soft: #eef0ff;
  --color-mint: #c9f2dc;
  --color-mint-dark: #1f8a57;
  --color-peach: #ffe1d9;
  --color-peach-dark: #c0563a;
  --color-sun: #ffd166;
  --color-ink: #2b2d42;
  --color-muted: #6b6f8a;
  --font-display: var(--font-lexend);
  --font-sans: var(--font-be-vietnam);
  --shadow-clay: 0 10px 24px rgb(184 192 255 / 0.35), inset 0 -4px 0 #eef0ff;
  --shadow-clay-lg: 0 18px 40px rgb(184 192 255 / 0.45), inset 0 -6px 0 #eef0ff;
  --radius-clay: 24px;
}

html { scroll-behavior: smooth; }
body {
  background: linear-gradient(160deg, var(--color-cream), var(--color-sky)) fixed;
  color: var(--color-ink);
  font-family: var(--font-sans), system-ui, sans-serif;
  min-height: 100vh;
}
h1, h2, h3, h4 { font-family: var(--font-display), system-ui, sans-serif; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`components/providers.tsx`:
```tsx
'use client';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      {children}
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 18, fontFamily: 'var(--font-be-vietnam)' } }} />
    </MotionConfig>
  );
}
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Lexend, Be_Vietnam_Pro } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { Providers } from '@/components/providers';

const lexend = Lexend({ subsets: ['latin', 'vietnamese'], variable: '--font-lexend', weight: ['400', '600', '800'] });
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], variable: '--font-be-vietnam', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'thi.ai.vn — Học vừa sức, tiến bộ mỗi ngày',
  description: 'Nền tảng thi & ôn luyện trực tuyến K12 với AI đánh giá năng lực và Learning Zone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${lexend.variable} ${beVietnam.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

Thay `app/page.tsx` bằng placeholder tạm (Task 12 sẽ thay):
```tsx
export default function Home() {
  return <main className="p-10"><h1 className="text-4xl font-extrabold">thi.ai.vn</h1></main>;
}
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm test && npm run build` → Expected: tất cả pass.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: design tokens, providers, vitest harness"
```

---

### Task 2: Kiểu dữ liệu câu hỏi, chấm đáp án, mô phỏng chấm nói/viết

**Files:**
- Create: `lib/bank/types.ts`, `lib/bank/check.ts`, `lib/bank/simulate.ts`
- Test: `tests/lib/bank/check.test.ts`, `tests/lib/bank/simulate.test.ts`

**Interfaces:**
- Produces:
  - `type Subject = 'toan' | 'anh'`, `type Grade = 6 | 9 | 12`, `type Level = 'NB'|'TH'|'VD'|'VDC'`, `LEVELS`, `LEVEL_LABEL`, `SUBJECT_LABEL`, `GRADES`
  - `interface Skill`, `interface Chapter`, `type Question` (discriminated union theo `type`), `type AnswerValue`, `interface GraphPoint`, `interface SpeakAnswer`
  - `checkAnswer(q: Question, a: AnswerValue): CheckResult` với `CheckResult = { correct: boolean; fraction: number }`
  - `normalizeNumber(raw: string): number | null`
  - `countWords(text: string): number`, `simulateSpeakingScore(target: string, durationMs: number): SpeakingScore`, `simulateWritingRubric(text: string, minWords: number): WritingRubric`

- [ ] **Step 1: Viết types**

`lib/bank/types.ts`:
```ts
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

interface QuestionBase {
  id: string; subject: Subject; grade: Grade; skillId: string; level: Level;
  /** Độ khó Rasch, khoảng -3..3 */
  b: number;
  /** Đề bài; công thức trong $...$ */
  content: string;
  explanation: string;
  hints: string[];
  source: 'NXB';
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
```

- [ ] **Step 2: Viết test chấm đáp án (failing)**

`tests/lib/bank/check.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { checkAnswer, normalizeNumber } from '@/lib/bank/check';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, skillId: 's', level: 'TH', b: 0, content: '', explanation: '', hints: [], source: 'NXB' } as const;

describe('normalizeNumber', () => {
  it.each([
    ['2,5', 2.5], ['2.5', 2.5], [' 2.5 ', 2.5], ['5/2', 2.5], ['(5)/(2)', 2.5],
    ['\\frac{5}{2}', 2.5], ['-3', -3], ['- 3', -3], ['0', 0],
  ])('%s → %d', (raw, expected) => expect(normalizeNumber(raw)).toBeCloseTo(expected));
  it.each(['', 'abc', '1/0', '2..5', '}{'])('rejects %s', (raw) => expect(normalizeNumber(raw)).toBeNull());
});

describe('checkAnswer', () => {
  it('mcq', () => {
    const q: Question = { ...base, id: 'a', type: 'mcq', options: ['x', 'y'], answer: 1 };
    expect(checkAnswer(q, 1)).toEqual({ correct: true, fraction: 1 });
    expect(checkAnswer(q, 0)).toEqual({ correct: false, fraction: 0 });
    expect(checkAnswer(q, null)).toEqual({ correct: false, fraction: 0 });
  });
  it('multi ignores order', () => {
    const q: Question = { ...base, id: 'a', type: 'multi', options: ['a', 'b', 'c'], answer: [0, 2] };
    expect(checkAnswer(q, [2, 0]).correct).toBe(true);
    expect(checkAnswer(q, [0]).correct).toBe(false);
  });
  it('tf4 partial credit theo thang Bộ', () => {
    const q: Question = { ...base, id: 'a', type: 'tf4', statements: ['1', '2', '3', '4'], answer: [true, false, true, true] };
    expect(checkAnswer(q, [true, false, true, true])).toEqual({ correct: true, fraction: 1 });
    expect(checkAnswer(q, [true, false, true, false])).toEqual({ correct: false, fraction: 0.5 });
    expect(checkAnswer(q, [true, false, false, false])).toEqual({ correct: false, fraction: 0.25 });
    expect(checkAnswer(q, [true, true, false, false])).toEqual({ correct: false, fraction: 0.1 });
    expect(checkAnswer(q, [null, null, null, null])).toEqual({ correct: false, fraction: 0 });
  });
  it('short accepts equivalent formats', () => {
    const q: Question = { ...base, id: 'a', type: 'short', answer: '2,5' };
    for (const v of ['2.5', '5/2', '\\frac{5}{2}', ' 2,5 ']) expect(checkAnswer(q, v).correct).toBe(true);
    expect(checkAnswer(q, 'hello').correct).toBe(false);
  });
  it('order & match', () => {
    const o: Question = { ...base, id: 'o', type: 'order', items: ['a', 'b', 'c'], answer: [0, 1, 2] };
    expect(checkAnswer(o, [0, 1, 2]).correct).toBe(true);
    expect(checkAnswer(o, [1, 0, 2]).correct).toBe(false);
    const m: Question = { ...base, id: 'm', type: 'match', left: ['a', 'b'], right: ['x', 'y'], answer: [1, 0] };
    expect(checkAnswer(m, [1, 0]).correct).toBe(true);
    expect(checkAnswer(m, [1, -1]).correct).toBe(false);
  });
  it('fill is case/space-insensitive', () => {
    const q: Question = { ...base, id: 'f', type: 'fill', text: '___ and ___', bank: ['who', 'which'], answer: ['who', 'which'] };
    expect(checkAnswer(q, ['Who ', 'which']).correct).toBe(true);
    expect(checkAnswer(q, ['who', '']).correct).toBe(false);
  });
  it('graph tolerates 0.25', () => {
    const q: Question = { ...base, id: 'g', type: 'graph', lines: [], answer: { x: 1, y: 2 } };
    expect(checkAnswer(q, { x: 1.2, y: 2 }).correct).toBe(true);
    expect(checkAnswer(q, { x: 2, y: 2 }).correct).toBe(false);
  });
  it('speak needs ≥1s recording; write needs minWords', () => {
    const s: Question = { ...base, id: 's', type: 'speak', target: 'Hello there' };
    expect(checkAnswer(s, { durationMs: 1500 }).correct).toBe(true);
    expect(checkAnswer(s, { durationMs: 300 }).correct).toBe(false);
    const w: Question = { ...base, id: 'w', type: 'write', prompt: 'p', minWords: 3 };
    expect(checkAnswer(w, 'one two three').correct).toBe(true);
    expect(checkAnswer(w, 'one two').correct).toBe(false);
  });
});
```

Run: `npm test -- check` → Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/bank/simulate.ts`** (check.ts phụ thuộc `countWords`)

```ts
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
```

- [ ] **Step 4: Implement `lib/bank/check.ts`**

```ts
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
```

- [ ] **Step 5: Test mô phỏng**

`tests/lib/bank/simulate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { countWords, simulateSpeakingScore, simulateWritingRubric } from '@/lib/bank/simulate';

describe('simulate', () => {
  it('countWords', () => {
    expect(countWords('  hello   world ')).toBe(2);
    expect(countWords('')).toBe(0);
  });
  it('speaking score is deterministic and bounded', () => {
    const a = simulateSpeakingScore('I wish I could visit Hoi An', 3000);
    expect(a).toEqual(simulateSpeakingScore('I wish I could visit Hoi An', 3000));
    expect(a.overall).toBeGreaterThanOrEqual(60);
    expect(a.overall).toBeLessThanOrEqual(98);
    expect(a.words).toHaveLength(7);
  });
  it('short recording scores lower than full-length', () => {
    const t = 'one two three four five six seven eight';
    expect(simulateSpeakingScore(t, 400).overall).toBeLessThan(simulateSpeakingScore(t, 4000).overall);
  });
  it('writing rubric rewards length', () => {
    const short = simulateWritingRubric('Village is nice.', 40);
    const long = simulateWritingRubric(
      'Living in the countryside has many advantages. The air is fresh and clean. People are friendly and helpful. Life is peaceful and quiet. Children can play in green fields. Food is fresh because farmers grow it nearby. I really love my hometown.', 40);
    expect(long.total).toBeGreaterThan(short.total);
    expect(long.total).toBeLessThanOrEqual(10);
    expect(long.criteria).toHaveLength(4);
  });
});
```

Run: `npm test -- lib/bank` → Expected: tất cả PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(bank): question types, answer checking, simulated speaking/writing scoring"
```

---

### Task 3: Khung chương trình, ngân hàng câu hỏi mẫu, đề thi, bộ luyện tập

**Files:**
- Create: `lib/bank/curriculum.ts`, `lib/bank/questions/{toan-9,anh-9,toan-6,anh-6,toan-12,anh-12}.ts`, `lib/bank/index.ts`, `lib/bank/exams.ts`, `lib/bank/practice-sets.ts`
- Test: `tests/lib/bank/bank.test.ts`

**Interfaces:**
- Consumes: types từ Task 2, `LEVEL_B` sẽ định nghĩa ở Task 4 — để tránh phụ thuộc vòng, test bank tự khai báo bảng `LEVEL_B` cục bộ (giá trị giống hệt: NB −1.5, TH −0.5, VD 0.5, VDC 1.5).
- Produces (`lib/bank/index.ts`):
  - `BANK_TOTAL = 40000`, `ALL_QUESTIONS: Question[]`, `CHAPTERS: Chapter[]`, `SKILLS: Skill[]`
  - `getQuestion(id: string): Question | undefined`
  - `questionsFor(subject: Subject, grade: Grade): Question[]`
  - `skillsFor(subject: Subject, grade: Grade): Skill[]`
  - `chaptersFor(subject: Subject, grade: Grade): Chapter[]`
  - `skillName(id: string): string`
  - `chapterCount(chapterId: string): number` (tổng `bankCount` của các skill trong chương)
- Produces (`lib/bank/exams.ts`): `type ExamKind = '15p'|'45p'|'giua-ky'|'cuoi-ky'`, `EXAM_KIND_LABEL`, `interface ExamDef { id; title; kind; subject; grade; durationMin; questionIds: string[]; schedule: string }`, `EXAMS: ExamDef[]`, `examsFor(grade: Grade): ExamDef[]`, `getExam(id): ExamDef | undefined`
- Produces (`lib/bank/practice-sets.ts`): `interface PracticeSet { id; title; subtitle; subject; grade; chapterId: string | null; questionIds: string[] }`, `practiceSetsFor(subject, grade): PracticeSet[]`, `getPracticeSet(id): PracticeSet | undefined`

- [ ] **Step 1: Viết test validate bank (failing)**

`tests/lib/bank/bank.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  ALL_QUESTIONS, SKILLS, CHAPTERS, questionsFor, skillsFor, chaptersFor, getQuestion, skillName, chapterCount, BANK_TOTAL,
} from '@/lib/bank';
import { EXAMS, examsFor } from '@/lib/bank/exams';
import { practiceSetsFor, getPracticeSet } from '@/lib/bank/practice-sets';
import { GRADES, LEVELS, type Level, type Subject } from '@/lib/bank/types';

const LEVEL_B: Record<Level, number> = { NB: -1.5, TH: -0.5, VD: 0.5, VDC: 1.5 };
const SUBJECTS: Subject[] = ['toan', 'anh'];

describe('bank integrity', () => {
  it('ids unique', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every question references a skill of same subject/grade', () => {
    for (const q of ALL_QUESTIONS) {
      const s = SKILLS.find((k) => k.id === q.skillId);
      expect(s, q.id).toBeDefined();
      expect(s!.subject).toBe(q.subject);
      expect(s!.grade).toBe(q.grade);
    }
  });
  it('skills reference existing chapter/lesson and prerequisites', () => {
    for (const s of SKILLS) {
      const ch = CHAPTERS.find((c) => c.id === s.chapterId);
      expect(ch, s.id).toBeDefined();
      expect(ch!.lessons.some((l) => l.id === s.lessonId), s.id).toBe(true);
      for (const p of s.prerequisites) expect(SKILLS.some((k) => k.id === p), `${s.id}→${p}`).toBe(true);
    }
  });
  it('difficulty b consistent with level (±0.6)', () => {
    for (const q of ALL_QUESTIONS) expect(Math.abs(q.b - LEVEL_B[q.level]), q.id).toBeLessThanOrEqual(0.6);
  });
  it('answer shapes are valid', () => {
    for (const q of ALL_QUESTIONS) {
      switch (q.type) {
        case 'mcq': case 'listen':
          expect(q.answer, q.id).toBeGreaterThanOrEqual(0); expect(q.answer, q.id).toBeLessThan(q.options.length); break;
        case 'multi':
          expect(q.answer.length, q.id).toBeGreaterThan(0);
          q.answer.forEach((a) => expect(a, q.id).toBeLessThan(q.options.length)); break;
        case 'tf4':
          expect(q.statements, q.id).toHaveLength(4); expect(q.answer, q.id).toHaveLength(4); break;
        case 'order':
          expect(q.answer, q.id).toEqual(q.items.map((_, i) => i)); break;
        case 'match':
          expect([...q.answer].sort(), q.id).toEqual(q.right.map((_, i) => i)); expect(q.left.length).toBe(q.right.length); break;
        case 'fill':
          expect(q.text.split('___').length - 1, q.id).toBe(q.answer.length);
          q.answer.forEach((w) => expect(q.bank, q.id).toContain(w)); break;
        case 'short':
          expect(q.answer.trim().length, q.id).toBeGreaterThan(0); break;
        default: break;
      }
    }
  });
  it('grade 9 coverage: ≥60 câu mỗi môn, mỗi skill có đủ 4 mức độ', () => {
    for (const subject of SUBJECTS) {
      expect(questionsFor(subject, 9).length, subject).toBeGreaterThanOrEqual(60);
      for (const s of skillsFor(subject, 9)) {
        if (['e9-speaking', 'e9-writing', 'e9-listening'].includes(s.id)) continue;
        for (const level of LEVELS) {
          expect(questionsFor(subject, 9).some((q) => q.skillId === s.id && q.level === level), `${s.id} ${level}`).toBe(true);
        }
      }
    }
  });
  it('grade 9 type coverage', () => {
    const t = new Set(questionsFor('toan', 9).map((q) => q.type));
    for (const k of ['mcq', 'multi', 'tf4', 'short', 'order', 'graph']) expect(t.has(k as never), k).toBe(true);
    const e = new Set(questionsFor('anh', 9).map((q) => q.type));
    for (const k of ['mcq', 'tf4', 'listen', 'fill', 'match', 'order', 'speak', 'write']) expect(e.has(k as never), k).toBe(true);
  });
  it('grades 6 & 12 have ≥10 câu mỗi môn and helpers work for every grade', () => {
    for (const g of GRADES) for (const s of SUBJECTS) {
      expect(skillsFor(s, g).length).toBeGreaterThan(0);
      expect(chaptersFor(s, g).length).toBeGreaterThan(0);
      if (g !== 9) expect(questionsFor(s, g).length, `${s}-${g}`).toBeGreaterThanOrEqual(10);
    }
  });
  it('helpers', () => {
    expect(BANK_TOTAL).toBe(40000);
    expect(getQuestion(ALL_QUESTIONS[0].id)).toBe(ALL_QUESTIONS[0]);
    expect(skillName('khong-ton-tai')).toBe('khong-ton-tai');
    expect(chapterCount(CHAPTERS[0].id)).toBeGreaterThan(0);
  });
  it('exams reference real questions of same subject/grade and exclude speak', () => {
    expect(examsFor(9).length).toBeGreaterThanOrEqual(4);
    for (const e of EXAMS) {
      expect(e.questionIds.length, e.id).toBeGreaterThan(0);
      for (const id of e.questionIds) {
        const q = getQuestion(id)!;
        expect(q, id).toBeDefined();
        expect(q.subject).toBe(e.subject); expect(q.grade).toBe(e.grade);
        expect(q.type).not.toBe('speak');
      }
    }
  });
  it('practice sets', () => {
    const sets = practiceSetsFor('toan', 9);
    expect(sets.length).toBeGreaterThan(0);
    for (const s of sets) {
      expect(s.questionIds.length).toBeGreaterThan(0);
      expect(s.questionIds.length).toBeLessThanOrEqual(15);
      expect(getPracticeSet(s.id)).toBe(s);
    }
  });
});
```

Run: `npm test -- bank.test` → Expected: FAIL.

- [ ] **Step 2: Khung chương trình**

`lib/bank/curriculum.ts`:
```ts
import type { Chapter, Skill } from './types';

export const CHAPTERS: Chapter[] = [
  // ===== Toán 9 =====
  { id: 't9-c1', subject: 'toan', grade: 9, order: 1, name: 'Phương trình và hệ hai phương trình bậc nhất hai ẩn',
    lessons: [{ id: 't9-b1', name: 'Khái niệm phương trình và hệ phương trình bậc nhất hai ẩn' },
              { id: 't9-b2', name: 'Giải hệ hai phương trình bậc nhất hai ẩn' },
              { id: 't9-b3', name: 'Giải bài toán bằng cách lập hệ phương trình' }] },
  { id: 't9-c2', subject: 'toan', grade: 9, order: 2, name: 'Phương trình và bất phương trình bậc nhất một ẩn',
    lessons: [{ id: 't9-b6', name: 'Bất phương trình bậc nhất một ẩn' }] },
  { id: 't9-c3', subject: 'toan', grade: 9, order: 3, name: 'Căn bậc hai và căn bậc ba',
    lessons: [{ id: 't9-b7', name: 'Căn bậc hai và căn thức bậc hai' },
              { id: 't9-b9', name: 'Biến đổi đơn giản và rút gọn biểu thức chứa căn' }] },
  { id: 't9-c4', subject: 'toan', grade: 9, order: 4, name: 'Hệ thức lượng trong tam giác vuông',
    lessons: [{ id: 't9-b11', name: 'Tỉ số lượng giác của góc nhọn' }] },
  { id: 't9-c6', subject: 'toan', grade: 9, order: 6, name: 'Hàm số y = ax² (a ≠ 0). Phương trình bậc hai một ẩn',
    lessons: [{ id: 't9-b18', name: 'Hàm số y = ax² (a ≠ 0)' },
              { id: 't9-b19', name: 'Phương trình bậc hai một ẩn' },
              { id: 't9-b20', name: 'Định lí Viète và ứng dụng' }] },
  // ===== Tiếng Anh 9 =====
  { id: 'e9-c1', subject: 'anh', grade: 9, order: 1, name: 'Ngữ âm & Từ vựng',
    lessons: [{ id: 'e9-l1', name: 'Từ vựng theo chủ đề (Unit 1–6)' }] },
  { id: 'e9-c2', subject: 'anh', grade: 9, order: 2, name: 'Ngữ pháp',
    lessons: [{ id: 'e9-l2', name: 'Thì hiện tại hoàn thành & quá khứ đơn' },
              { id: 'e9-l3', name: 'Câu ước với wish' },
              { id: 'e9-l4', name: 'Câu bị động' },
              { id: 'e9-l5', name: 'Câu tường thuật' },
              { id: 'e9-l6', name: 'Mệnh đề quan hệ' },
              { id: 'e9-l7', name: 'Câu điều kiện loại 1 & 2' }] },
  { id: 'e9-c3', subject: 'anh', grade: 9, order: 3, name: 'Kỹ năng',
    lessons: [{ id: 'e9-l8', name: 'Nghe hiểu' }, { id: 'e9-l9', name: 'Nói' }, { id: 'e9-l10', name: 'Viết đoạn văn' }] },
  // ===== Lớp 6 =====
  { id: 't6-c1', subject: 'toan', grade: 6, order: 1, name: 'Số tự nhiên',
    lessons: [{ id: 't6-b1', name: 'Phép tính với số tự nhiên' }] },
  { id: 't6-c6', subject: 'toan', grade: 6, order: 6, name: 'Phân số',
    lessons: [{ id: 't6-b24', name: 'Phép cộng, trừ phân số' }] },
  { id: 'e6-c1', subject: 'anh', grade: 6, order: 1, name: 'Ngữ pháp & Từ vựng',
    lessons: [{ id: 'e6-l1', name: 'Thì hiện tại đơn' }, { id: 'e6-l2', name: 'Từ vựng: My house, My school' }] },
  // ===== Lớp 12 =====
  { id: 't12-c1', subject: 'toan', grade: 12, order: 1, name: 'Ứng dụng đạo hàm để khảo sát hàm số',
    lessons: [{ id: 't12-b1', name: 'Tính đơn điệu và cực trị của hàm số' }] },
  { id: 't12-c4', subject: 'toan', grade: 12, order: 4, name: 'Nguyên hàm và tích phân',
    lessons: [{ id: 't12-b11', name: 'Nguyên hàm' }] },
  { id: 'e12-c1', subject: 'anh', grade: 12, order: 1, name: 'Ngữ pháp & Từ vựng',
    lessons: [{ id: 'e12-l1', name: 'Mệnh đề & cấu trúc nâng cao' }, { id: 'e12-l2', name: 'Từ vựng học thuật' }] },
];

export const SKILLS: Skill[] = [
  // Toán 9
  { id: 't9-hpt-khai-niem', subject: 'toan', grade: 9, chapterId: 't9-c1', lessonId: 't9-b1', name: 'Nghiệm của phương trình bậc nhất hai ẩn', prerequisites: [], bankCount: 640 },
  { id: 't9-hpt-giai', subject: 'toan', grade: 9, chapterId: 't9-c1', lessonId: 't9-b2', name: 'Giải hệ phương trình bậc nhất hai ẩn', prerequisites: ['t9-hpt-khai-niem'], bankCount: 910 },
  { id: 't9-hpt-bai-toan', subject: 'toan', grade: 9, chapterId: 't9-c1', lessonId: 't9-b3', name: 'Giải bài toán bằng cách lập hệ phương trình', prerequisites: ['t9-hpt-giai'], bankCount: 720 },
  { id: 't9-bpt', subject: 'toan', grade: 9, chapterId: 't9-c2', lessonId: 't9-b6', name: 'Bất phương trình bậc nhất một ẩn', prerequisites: [], bankCount: 580 },
  { id: 't9-can-bac-hai', subject: 'toan', grade: 9, chapterId: 't9-c3', lessonId: 't9-b7', name: 'Căn bậc hai', prerequisites: [], bankCount: 830 },
  { id: 't9-bien-doi-can', subject: 'toan', grade: 9, chapterId: 't9-c3', lessonId: 't9-b9', name: 'Rút gọn biểu thức chứa căn', prerequisites: ['t9-can-bac-hai'], bankCount: 1040 },
  { id: 't9-ti-so-luong-giac', subject: 'toan', grade: 9, chapterId: 't9-c4', lessonId: 't9-b11', name: 'Tỉ số lượng giác của góc nhọn', prerequisites: [], bankCount: 690 },
  { id: 't9-ham-so-ax2', subject: 'toan', grade: 9, chapterId: 't9-c6', lessonId: 't9-b18', name: 'Hàm số y = ax²', prerequisites: [], bankCount: 610 },
  { id: 't9-pt-bac-hai', subject: 'toan', grade: 9, chapterId: 't9-c6', lessonId: 't9-b19', name: 'Phương trình bậc hai một ẩn', prerequisites: ['t9-bien-doi-can', 't9-ham-so-ax2'], bankCount: 1120 },
  { id: 't9-viete', subject: 'toan', grade: 9, chapterId: 't9-c6', lessonId: 't9-b20', name: 'Định lí Viète', prerequisites: ['t9-pt-bac-hai'], bankCount: 760 },
  // Tiếng Anh 9
  { id: 'e9-vocab', subject: 'anh', grade: 9, chapterId: 'e9-c1', lessonId: 'e9-l1', name: 'Từ vựng theo chủ đề', prerequisites: [], bankCount: 1350 },
  { id: 'e9-tenses', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l2', name: 'Present perfect & Past simple', prerequisites: [], bankCount: 980 },
  { id: 'e9-wish', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l3', name: 'Câu ước (wish)', prerequisites: ['e9-tenses'], bankCount: 540 },
  { id: 'e9-passive', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l4', name: 'Câu bị động', prerequisites: ['e9-tenses'], bankCount: 760 },
  { id: 'e9-reported', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l5', name: 'Câu tường thuật', prerequisites: ['e9-tenses'], bankCount: 690 },
  { id: 'e9-relative', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l6', name: 'Mệnh đề quan hệ', prerequisites: [], bankCount: 820 },
  { id: 'e9-conditional', subject: 'anh', grade: 9, chapterId: 'e9-c2', lessonId: 'e9-l7', name: 'Câu điều kiện', prerequisites: ['e9-tenses'], bankCount: 710 },
  { id: 'e9-listening', subject: 'anh', grade: 9, chapterId: 'e9-c3', lessonId: 'e9-l8', name: 'Nghe hiểu', prerequisites: [], bankCount: 620 },
  { id: 'e9-speaking', subject: 'anh', grade: 9, chapterId: 'e9-c3', lessonId: 'e9-l9', name: 'Nói', prerequisites: [], bankCount: 380 },
  { id: 'e9-writing', subject: 'anh', grade: 9, chapterId: 'e9-c3', lessonId: 'e9-l10', name: 'Viết đoạn văn', prerequisites: [], bankCount: 410 },
  // Lớp 6
  { id: 't6-so-tu-nhien', subject: 'toan', grade: 6, chapterId: 't6-c1', lessonId: 't6-b1', name: 'Phép tính với số tự nhiên', prerequisites: [], bankCount: 900 },
  { id: 't6-phan-so', subject: 'toan', grade: 6, chapterId: 't6-c6', lessonId: 't6-b24', name: 'Cộng, trừ phân số', prerequisites: ['t6-so-tu-nhien'], bankCount: 870 },
  { id: 'e6-present-simple', subject: 'anh', grade: 6, chapterId: 'e6-c1', lessonId: 'e6-l1', name: 'Present simple', prerequisites: [], bankCount: 760 },
  { id: 'e6-vocab', subject: 'anh', grade: 6, chapterId: 'e6-c1', lessonId: 'e6-l2', name: 'Từ vựng: nhà & trường', prerequisites: [], bankCount: 690 },
  // Lớp 12
  { id: 't12-don-dieu', subject: 'toan', grade: 12, chapterId: 't12-c1', lessonId: 't12-b1', name: 'Tính đơn điệu & cực trị', prerequisites: [], bankCount: 1260 },
  { id: 't12-nguyen-ham', subject: 'toan', grade: 12, chapterId: 't12-c4', lessonId: 't12-b11', name: 'Nguyên hàm', prerequisites: ['t12-don-dieu'], bankCount: 1180 },
  { id: 'e12-grammar', subject: 'anh', grade: 12, chapterId: 'e12-c1', lessonId: 'e12-l1', name: 'Cấu trúc nâng cao', prerequisites: [], bankCount: 1090 },
  { id: 'e12-vocab', subject: 'anh', grade: 12, chapterId: 'e12-c1', lessonId: 'e12-l2', name: 'Từ vựng học thuật', prerequisites: [], bankCount: 1150 },
];
```

- [ ] **Step 3: Soạn câu hỏi mẫu**

Quy ước mỗi file: `export const TOAN_9: Question[] = [...]` (tương tự `ANH_9`, `TOAN_6`, `ANH_6`, `TOAN_12`, `ANH_12`). Id dạng `<skill>-<level>-<n>` (vd `t9-pt-bac-hai-VD-1`). Giá trị `b`: NB ≈ −1.5, TH ≈ −0.5, VD ≈ 0.5, VDC ≈ 1.5, lệch không quá 0.6. Mỗi câu có `explanation` (lời giải từng bước, có thể dùng `$...$`) và 1–2 `hints`. Mọi câu phải đúng chuyên môn: **tự giải lại từng câu trước khi ghi đáp án**.

Chỉ tiêu (được test ở Step 1 khoá lại):
- **Toán 9:** ≥ 60 câu; mỗi skill có ≥ 1 câu ở mỗi mức NB/TH/VD/VDC (khuyến nghị 2 câu NB, 2 TH, 2 VD, 1 VDC). Dạng bắt buộc có: `mcq`, `multi`, `tf4`, `short`, `order`, `graph`.
- **Tiếng Anh 9:** ≥ 60 câu; các skill trừ listening/speaking/writing đều đủ 4 mức. `e9-listening` ≥ 4 câu `listen`; `e9-speaking` ≥ 3 câu `speak`; `e9-writing` ≥ 2 câu `write`. Dạng bắt buộc có: `mcq`, `tf4`, `listen`, `fill`, `match`, `order`, `speak`, `write`.
- **Lớp 6 và 12:** ≥ 10 câu mỗi môn, phân bố đủ các mức.

Câu mẫu bắt buộc phải có (copy nguyên văn, dùng làm chuẩn cho các câu còn lại):

`lib/bank/questions/toan-9.ts`:
```ts
import type { Question } from '../types';

const base = { subject: 'toan', grade: 9, source: 'NXB' } as const;

export const TOAN_9: Question[] = [
  { ...base, id: 't9-hpt-khai-niem-NB-1', skillId: 't9-hpt-khai-niem', level: 'NB', b: -1.6, type: 'mcq',
    content: 'Cặp số nào sau đây là nghiệm của phương trình $2x + y = 5$?',
    options: ['$(1;\\ 3)$', '$(2;\\ 2)$', '$(0;\\ 4)$', '$(3;\\ 0)$'], answer: 0,
    explanation: 'Thay $x = 1, y = 3$: $2 \\cdot 1 + 3 = 5$ ✓. Các cặp còn lại cho kết quả $6$, $4$, $6$.',
    hints: ['Thay từng cặp $(x; y)$ vào vế trái và so sánh với $5$.'] },
  { ...base, id: 't9-hpt-giai-TH-1', skillId: 't9-hpt-giai', level: 'TH', b: -0.4, type: 'short',
    content: 'Giải hệ phương trình $\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$. Giá trị của $x$ là bao nhiêu?',
    answer: '3',
    explanation: 'Cộng vế hai phương trình: $2x = 6 \\Rightarrow x = 3$, suy ra $y = 2$.',
    hints: ['Cộng vế theo vế để khử $y$.'] },
  { ...base, id: 't9-hpt-giai-VD-1', skillId: 't9-hpt-giai', level: 'VD', b: 0.4, type: 'graph',
    content: 'Kéo điểm đến giao điểm của hai đường thẳng $d_1: y = x + 1$ và $d_2: y = -x + 3$. Toạ độ giao điểm chính là nghiệm của hệ phương trình tạo bởi hai đường thẳng.',
    lines: [{ a: 1, b: 1, label: 'd₁' }, { a: -1, b: 3, label: 'd₂' }], answer: { x: 1, y: 2 },
    explanation: 'Giải $x + 1 = -x + 3 \\Rightarrow x = 1$, $y = 2$. Giao điểm là $(1; 2)$.',
    hints: ['Tìm điểm mà cả hai đường thẳng cùng đi qua.'] },
  { ...base, id: 't9-bpt-TH-1', skillId: 't9-bpt', level: 'TH', b: -0.5, type: 'order',
    content: 'Sắp xếp các bước giải bất phương trình $3x - 6 > 0$ theo đúng thứ tự:',
    items: ['Chuyển vế: $3x > 6$', 'Chia hai vế cho $3$ (số dương, giữ nguyên chiều): $x > 2$', 'Kết luận: nghiệm của bất phương trình là $x > 2$'],
    answer: [0, 1, 2],
    explanation: 'Chuyển hạng tử tự do sang vế phải, chia cho hệ số dương giữ nguyên chiều bất đẳng thức, rồi kết luận.',
    hints: ['Bước đầu tiên luôn là đưa hạng tử không chứa $x$ sang một vế.'] },
  { ...base, id: 't9-can-bac-hai-TH-1', skillId: 't9-can-bac-hai', level: 'TH', b: -0.5, type: 'multi',
    content: 'Chọn **tất cả** các khẳng định đúng:',
    options: ['$\\sqrt{16} = 4$', '$\\sqrt{(-3)^2} = -3$', '$\\sqrt{0{,}25} = 0{,}5$', '$\\sqrt{2} \\cdot \\sqrt{8} = 4$'],
    answer: [0, 2, 3],
    explanation: '$\\sqrt{(-3)^2} = |-3| = 3$ nên khẳng định thứ hai sai. $\\sqrt{2}\\cdot\\sqrt{8} = \\sqrt{16} = 4$.',
    hints: ['Nhớ: $\\sqrt{A^2} = |A|$.'] },
  { ...base, id: 't9-pt-bac-hai-VD-1', skillId: 't9-pt-bac-hai', level: 'VD', b: 0.5, type: 'tf4',
    content: 'Cho phương trình $x^2 - 5x + 6 = 0$. Xét tính đúng/sai của các khẳng định sau:',
    statements: ['Phương trình có hai nghiệm phân biệt.', 'Tổng hai nghiệm bằng $-5$.', 'Tích hai nghiệm bằng $6$.', '$x = 3$ là một nghiệm của phương trình.'],
    answer: [true, false, true, true],
    explanation: '$\\Delta = 25 - 24 = 1 > 0$ nên có hai nghiệm phân biệt $x = 2, x = 3$. Tổng $= 5$, tích $= 6$.',
    hints: ['Tính $\\Delta = b^2 - 4ac$.', 'Dùng Viète: $x_1 + x_2 = -\\frac{b}{a}$.'] },
  { ...base, id: 't9-viete-VDC-1', skillId: 't9-viete', level: 'VDC', b: 1.5, type: 'mcq',
    content: 'Tìm $m$ để phương trình $x^2 - 2x + m = 0$ có hai nghiệm $x_1, x_2$ thoả mãn $x_1^2 + x_2^2 = 10$.',
    options: ['$m = -3$', '$m = 3$', '$m = -7$', '$m = 7$'], answer: 0,
    explanation: '$x_1 + x_2 = 2$, $x_1x_2 = m$. $x_1^2 + x_2^2 = 4 - 2m = 10 \\Rightarrow m = -3$. Kiểm tra $\\Delta\' = 1 - m = 4 > 0$ ✓.',
    hints: ['$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.', 'Đừng quên điều kiện có nghiệm $\\Delta\' \\ge 0$.'] },
  // ... tiếp tục đến đủ chỉ tiêu
];
```

`lib/bank/questions/anh-9.ts`:
```ts
import type { Question } from '../types';

const base = { subject: 'anh', grade: 9, source: 'NXB' } as const;

export const ANH_9: Question[] = [
  { ...base, id: 'e9-tenses-NB-1', skillId: 'e9-tenses', level: 'NB', b: -1.5, type: 'mcq',
    content: 'I ___ to Ha Noi three times so far.',
    options: ['have been', 'went', 'am going', 'was'], answer: 0,
    explanation: '"so far" là dấu hiệu của thì hiện tại hoàn thành: have/has + V3.',
    hints: ['Chú ý cụm "so far".'] },
  { ...base, id: 'e9-listening-TH-1', skillId: 'e9-listening', level: 'TH', b: -0.5, type: 'listen',
    content: "Listen and choose: Where do the speaker's grandparents live?",
    audioText: 'My grandparents live in a peaceful village near the river.',
    options: ['In a village near the river', 'In a big city', 'Near the mountains', 'By the sea'], answer: 0,
    explanation: 'Câu nghe: "...live in a peaceful village near the river."',
    hints: ['Nghe kỹ cụm danh từ sau "live in".'] },
  { ...base, id: 'e9-relative-TH-1', skillId: 'e9-relative', level: 'TH', b: -0.4, type: 'fill',
    content: 'Kéo từ thích hợp vào chỗ trống:',
    text: 'The girl ___ sits next to me is my best friend. This is the book ___ I told you about.',
    bank: ['who', 'which', 'whose', 'where'], answer: ['who', 'which'],
    explanation: '"who" thay cho người làm chủ ngữ; "which" thay cho vật.',
    hints: ['Danh từ đứng trước là người hay vật?'] },
  { ...base, id: 'e9-vocab-NB-1', skillId: 'e9-vocab', level: 'NB', b: -1.4, type: 'match',
    content: 'Ghép mỗi tính từ với nghĩa phù hợp:',
    left: ['crowded', 'peaceful', 'modern', 'ancient'],
    right: ['very old', 'full of people', 'quiet and calm', 'new and up-to-date'],
    answer: [1, 2, 3, 0],
    explanation: 'crowded = full of people; peaceful = quiet and calm; modern = new and up-to-date; ancient = very old.',
    hints: ['"ancient" thường dùng cho di tích lịch sử.'] },
  { ...base, id: 'e9-passive-VD-1', skillId: 'e9-passive', level: 'VD', b: 0.5, type: 'tf4',
    content: 'Read: "The Temple of Literature was built in 1070. It is visited by thousands of tourists every year." Đúng hay sai?',
    statements: ['The temple was built in the 11th century.', '"was built" is a passive verb form.', 'Few tourists visit the temple.', '"is visited" is in the past simple passive.'],
    answer: [true, true, false, false],
    explanation: '1070 thuộc thế kỷ 11. "is visited" là bị động thì hiện tại đơn, không phải quá khứ đơn.',
    hints: ['Bị động = be + V3; thì được quyết định bởi động từ "be".'] },
  { ...base, id: 'e9-reported-TH-1', skillId: 'e9-reported', level: 'TH', b: -0.5, type: 'order',
    content: 'Sắp xếp để tạo câu tường thuật đúng của: "I am tired," she said.',
    items: ['She said', 'that', 'she', 'was', 'tired.'], answer: [0, 1, 2, 3, 4],
    explanation: 'Lùi thì: am → was; đổi ngôi: I → she.',
    hints: ['Động từ "am" lùi về thì nào?'] },
  { ...base, id: 'e9-speaking-VD-1', skillId: 'e9-speaking', level: 'VD', b: 0.5, type: 'speak',
    content: 'Đọc to câu sau:', target: 'I wish I could visit Hoi An again next summer.',
    explanation: 'Chú ý nối âm "visit Hoi An" và nhấn trọng âm "a-GAIN".', hints: ['Nghe mẫu trước khi ghi âm.'] },
  { ...base, id: 'e9-writing-VDC-1', skillId: 'e9-writing', level: 'VDC', b: 1.5, type: 'write',
    content: 'Viết đoạn văn ngắn:', prompt: 'Write 40–60 words about the advantages of living in the countryside.', minWords: 40,
    explanation: 'Gợi ý bố cục: câu chủ đề → 2–3 lợi ích kèm ví dụ → câu kết.', hints: ['Dùng từ nối: Firstly, Moreover, Finally.'] },
  // ... tiếp tục đến đủ chỉ tiêu
];
```

Soạn tiếp `toan-6.ts` (`TOAN_6`), `anh-6.ts` (`ANH_6`), `toan-12.ts` (`TOAN_12`), `anh-12.ts` (`ANH_12`) theo cùng khuôn mẫu.

- [ ] **Step 4: Bank index**

`lib/bank/index.ts`:
```ts
import { CHAPTERS, SKILLS } from './curriculum';
import type { Grade, Question, Subject } from './types';
import { TOAN_9 } from './questions/toan-9';
import { ANH_9 } from './questions/anh-9';
import { TOAN_6 } from './questions/toan-6';
import { ANH_6 } from './questions/anh-6';
import { TOAN_12 } from './questions/toan-12';
import { ANH_12 } from './questions/anh-12';

export { CHAPTERS, SKILLS };
export const BANK_TOTAL = 40000;
export const ALL_QUESTIONS: Question[] = [...TOAN_9, ...ANH_9, ...TOAN_6, ...ANH_6, ...TOAN_12, ...ANH_12];

const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
export const getQuestion = (id: string) => byId.get(id);
export const questionsFor = (subject: Subject, grade: Grade) =>
  ALL_QUESTIONS.filter((q) => q.subject === subject && q.grade === grade);
export const skillsFor = (subject: Subject, grade: Grade) =>
  SKILLS.filter((s) => s.subject === subject && s.grade === grade);
export const chaptersFor = (subject: Subject, grade: Grade) =>
  CHAPTERS.filter((c) => c.subject === subject && c.grade === grade).sort((a, b) => a.order - b.order);
export const skillName = (id: string) => SKILLS.find((s) => s.id === id)?.name ?? id;
export const chapterCount = (chapterId: string) =>
  SKILLS.filter((s) => s.chapterId === chapterId).reduce((sum, s) => sum + s.bankCount, 0);
```

- [ ] **Step 5: Đề thi & bộ luyện tập**

`lib/bank/exams.ts`:
```ts
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
```

`lib/bank/practice-sets.ts`:
```ts
import { chaptersFor, questionsFor, SKILLS } from '.';
import { LEVELS, SUBJECT_LABEL, type Grade, type Subject } from './types';

export interface PracticeSet {
  id: string; title: string; subtitle: string; subject: Subject; grade: Grade;
  chapterId: string | null; questionIds: string[];
}

function build(subject: Subject, grade: Grade): PracticeSet[] {
  const all = questionsFor(subject, grade).filter((q) => q.type !== 'write');
  const byLevel = (a: { level: string }, b: { level: string }) =>
    LEVELS.indexOf(a.level as never) - LEVELS.indexOf(b.level as never);
  const sets: PracticeSet[] = chaptersFor(subject, grade).map((ch) => {
    const skillIds = SKILLS.filter((s) => s.chapterId === ch.id).map((s) => s.id);
    const qs = all.filter((q) => skillIds.includes(q.skillId)).sort(byLevel).slice(0, 10);
    return { id: `${ch.id}-quick`, title: ch.name, subtitle: `Luyện nhanh · ${qs.length} câu`, subject, grade, chapterId: ch.id, questionIds: qs.map((q) => q.id) };
  });
  const mixed = all.filter((_, i) => i % 3 === 0).slice(0, 15);
  sets.push({ id: `${subject}-${grade}-tong-hop`, title: `Đề tổng hợp ${SUBJECT_LABEL[subject]} ${grade}`, subtitle: `Tổng hợp · ${mixed.length} câu`,
    subject, grade, chapterId: null, questionIds: mixed.map((q) => q.id) });
  return sets.filter((s) => s.questionIds.length > 0);
}

const cache = new Map<string, PracticeSet[]>();
export function practiceSetsFor(subject: Subject, grade: Grade): PracticeSet[] {
  const key = `${subject}-${grade}`;
  if (!cache.has(key)) cache.set(key, build(subject, grade));
  return cache.get(key)!;
}
export function getPracticeSet(id: string): PracticeSet | undefined {
  for (const subject of ['toan', 'anh'] as Subject[]) for (const grade of [6, 9, 12] as Grade[]) {
    const s = practiceSetsFor(subject, grade).find((p) => p.id === id);
    if (s) return s;
  }
  return undefined;
}
```

- [ ] **Step 6: Run tests**

Run: `npm test -- bank` → Expected: PASS. Nếu test coverage fail thì soạn thêm câu đến khi pass (không được nới lỏng test).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(bank): curriculum tree, sample question bank, exams, practice sets"
```

---

### Task 4: Engine — IRT, AI đánh giá năng lực, Learning Zone

**Files:**
- Create: `lib/engine/irt.ts`, `lib/engine/assessment.ts`, `lib/engine/learning-zone.ts`
- Test: `tests/lib/engine/irt.test.ts`, `tests/lib/engine/assessment.test.ts`, `tests/lib/engine/learning-zone.test.ts`, `tests/fixtures.ts`

**Interfaces:**
- Consumes: `Question`, `Skill`, `Level`, `LEVELS`, `Subject`, `Grade` (Task 2).
- Produces:
  - `irt.ts`: `prob(theta, b)`, `information(theta, b)`, `estimateTheta(responses: IrtResponse[], prior?) → { theta; se }`, `thetaToScore(theta) → 0..100`, `masteryLabel(score) → MasteryLabel`, `updateThetaStep(theta, b, correct, k?)`, `interface IrtResponse { b: number; correct: boolean }`, `type MasteryLabel`
  - `assessment.ts`: `ASSESSMENT_LENGTH = 12`, `interface AssessmentState`, `emptyAssessment()`, `nextAssessmentQuestion(pool, skills, state, length?) → Question | null`, `recordAssessmentAnswer(state, q, correct) → AssessmentState`, `currentTheta(state)`, `interface SkillResult`, `interface AssessmentSummary`, `summarizeAssessment(state, skills, meta: { subject; grade }, now?) → AssessmentSummary`, `aiComment(summary, studentName, nameOf: (skillId) => string) → string`
  - `learning-zone.ts`: `type Zone`, `LEVEL_B`, `TARGET_P = 0.78`, `LZ_K = 0.6`, `interface SkillProgress { theta; unlockedLevel }`, `type ZoneMap`, `type ZoneEvent`, `classify(p)`, `frontierLevel(theta)`, `seedZoneMap(skills, thetaBySkill?)`, `unlockNewSkills(map, skills)`, `skillZone(sp?) → { zone; p }`, `zoneExtent(map, skills) → 0..1`, `pickNextQuestion(pool, map, recent, rand?) → Question | null`, `applyAnswer(map, skills, q, correct) → { map; events }`

- [ ] **Step 1: Test fixtures**

`tests/fixtures.ts`:
```ts
import type { Level, Question, Skill } from '@/lib/bank/types';

export function makeQ(id: string, skillId: string, b: number, level: Level = 'TH'): Question {
  return { id, skillId, b, level, subject: 'toan', grade: 9, source: 'NXB', content: id, explanation: '', hints: [],
    type: 'mcq', options: ['a', 'b'], answer: 0 };
}
export function makeSkill(id: string, prerequisites: string[] = []): Skill {
  return { id, prerequisites, subject: 'toan', grade: 9, chapterId: 'c', lessonId: 'l', name: `Skill ${id}`, bankCount: 100 };
}
```

- [ ] **Step 2: Test IRT (failing)**

`tests/lib/engine/irt.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { prob, information, estimateTheta, thetaToScore, masteryLabel, updateThetaStep } from '@/lib/engine/irt';

describe('irt', () => {
  it('prob', () => {
    expect(prob(0, 0)).toBeCloseTo(0.5);
    expect(prob(1, 0)).toBeCloseTo(0.731, 3);
    expect(prob(-1, 0)).toBeCloseTo(0.269, 3);
  });
  it('information peaks at theta = b', () => {
    expect(information(0, 0)).toBeCloseTo(0.25);
    expect(information(2, 0)).toBeLessThan(information(0, 0));
  });
  it('estimateTheta with no responses returns prior', () => {
    const r = estimateTheta([]);
    expect(r.theta).toBeCloseTo(0, 1);
    expect(r.se).toBeCloseTo(1, 1);
  });
  it('estimateTheta moves with responses', () => {
    const right = Array.from({ length: 5 }, () => ({ b: 0, correct: true }));
    const wrong = Array.from({ length: 5 }, () => ({ b: 0, correct: false }));
    expect(estimateTheta(right).theta).toBeGreaterThan(0.5);
    expect(estimateTheta(wrong).theta).toBeLessThan(-0.5);
    expect(estimateTheta([...right, ...wrong]).theta).toBeCloseTo(0, 1);
    expect(estimateTheta(right).se).toBeLessThan(1);
  });
  it('estimateTheta respects prior mean', () => {
    expect(estimateTheta([], { mean: 1, sd: 0.8 }).theta).toBeCloseTo(1, 1);
  });
  it('thetaToScore clamps to 0..100', () => {
    expect(thetaToScore(-3)).toBe(0);
    expect(thetaToScore(0)).toBe(50);
    expect(thetaToScore(3)).toBe(100);
    expect(thetaToScore(10)).toBe(100);
    expect(thetaToScore(-10)).toBe(0);
  });
  it('masteryLabel', () => {
    expect(masteryLabel(39)).toBe('Cần cố gắng');
    expect(masteryLabel(40)).toBe('Trung bình');
    expect(masteryLabel(60)).toBe('Khá');
    expect(masteryLabel(80)).toBe('Giỏi');
  });
  it('updateThetaStep', () => {
    expect(updateThetaStep(0, 0, true)).toBeCloseTo(0.2);
    expect(updateThetaStep(0, 0, false)).toBeCloseTo(-0.2);
  });
});
```

Run: `npm test -- irt` → Expected: FAIL.

- [ ] **Step 3: Implement `lib/engine/irt.ts`**

```ts
export interface IrtResponse { b: number; correct: boolean }
export type MasteryLabel = 'Cần cố gắng' | 'Trung bình' | 'Khá' | 'Giỏi';

/** Rasch (1PL): xác suất trả lời đúng */
export function prob(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)));
}

/** Fisher information của câu tại theta */
export function information(theta: number, b: number): number {
  const p = prob(theta, b);
  return p * (1 - p);
}

const GRID = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);

/** Ước lượng EAP trên lưới với prior chuẩn */
export function estimateTheta(
  responses: IrtResponse[],
  prior: { mean: number; sd: number } = { mean: 0, sd: 1 },
): { theta: number; se: number } {
  const logs = GRID.map((t) => {
    let l = -((t - prior.mean) ** 2) / (2 * prior.sd ** 2);
    for (const r of responses) {
      const p = prob(t, r.b);
      l += Math.log(r.correct ? p : 1 - p);
    }
    return l;
  });
  const max = Math.max(...logs);
  const w = logs.map((l) => Math.exp(l - max));
  const sum = w.reduce((a, b) => a + b, 0);
  const theta = w.reduce((acc, wi, i) => acc + wi * GRID[i], 0) / sum;
  const variance = w.reduce((acc, wi, i) => acc + wi * (GRID[i] - theta) ** 2, 0) / sum;
  return { theta, se: Math.sqrt(variance) };
}

export function thetaToScore(theta: number): number {
  return Math.round(Math.min(100, Math.max(0, ((theta + 3) / 6) * 100)));
}

export function masteryLabel(score: number): MasteryLabel {
  if (score < 40) return 'Cần cố gắng';
  if (score < 60) return 'Trung bình';
  if (score < 80) return 'Khá';
  return 'Giỏi';
}

/** Cập nhật nhanh kiểu Elo dùng cho Learning Zone */
export function updateThetaStep(theta: number, b: number, correct: boolean, k = 0.4): number {
  return theta + k * ((correct ? 1 : 0) - prob(theta, b));
}
```

Run: `npm test -- irt` → Expected: PASS.

- [ ] **Step 4: Test assessment (failing)**

`tests/lib/engine/assessment.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  emptyAssessment, nextAssessmentQuestion, recordAssessmentAnswer, summarizeAssessment, aiComment, currentTheta,
} from '@/lib/engine/assessment';
import { makeQ, makeSkill } from '../../fixtures';

const skills = [makeSkill('A'), makeSkill('B')];
const pool = [
  makeQ('a1', 'A', -1.5, 'NB'), makeQ('a2', 'A', -0.1, 'TH'), makeQ('a3', 'A', 0.6, 'VD'), makeQ('a4', 'A', 1.5, 'VDC'),
  makeQ('b1', 'B', -1.5, 'NB'), makeQ('b2', 'B', 0.1, 'TH'), makeQ('b3', 'B', 0.5, 'VD'), makeQ('b4', 'B', 1.6, 'VDC'),
];

describe('assessment', () => {
  it('first question is most informative at theta 0', () => {
    const q = nextAssessmentQuestion(pool, skills, emptyAssessment())!;
    expect(['a2', 'b2']).toContain(q.id);
  });
  it('alternates skills for coverage', () => {
    const q1 = nextAssessmentQuestion(pool, skills, emptyAssessment())!;
    const s1 = recordAssessmentAnswer(emptyAssessment(), q1, true);
    const q2 = nextAssessmentQuestion(pool, skills, s1)!;
    expect(q2.skillId).not.toBe(q1.skillId);
  });
  it('gets harder after correct answers', () => {
    let s = emptyAssessment();
    const first = nextAssessmentQuestion(pool, skills, s)!;
    s = recordAssessmentAnswer(s, first, true);
    const second = nextAssessmentQuestion(pool, skills, s)!;
    s = recordAssessmentAnswer(s, second, true);
    const third = nextAssessmentQuestion(pool, skills, s)!;
    expect(third.b).toBeGreaterThan(first.b);
    expect(currentTheta(s)).toBeGreaterThan(0);
  });
  it('stops at length or when pool exhausted', () => {
    let s = emptyAssessment();
    for (let i = 0; i < 3; i++) s = recordAssessmentAnswer(s, nextAssessmentQuestion(pool, skills, s, 3)!, true);
    expect(nextAssessmentQuestion(pool, skills, s, 3)).toBeNull();
    let all = emptyAssessment();
    for (const q of pool) all = recordAssessmentAnswer(all, q, true);
    expect(nextAssessmentQuestion(pool, skills, all, 99)).toBeNull();
  });
  it('excludes speak/write questions', () => {
    const speak = { ...makeQ('sp', 'A', 0), type: 'speak', target: 'hi' } as never;
    const q = nextAssessmentQuestion([speak], skills, emptyAssessment());
    expect(q).toBeNull();
  });
  it('summarize ranks strong vs weak skills without overlap', () => {
    let s = emptyAssessment();
    for (const q of pool) s = recordAssessmentAnswer(s, q, q.skillId === 'A');
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 }, new Date('2026-10-16T08:00:00'));
    const a = sum.skills.find((x) => x.skillId === 'A')!;
    const b = sum.skills.find((x) => x.skillId === 'B')!;
    expect(a.theta).toBeGreaterThan(b.theta);
    expect(sum.strengths).toEqual(['A']);
    expect(sum.weaknesses).toEqual(['B']);
    expect(sum.score).toBeGreaterThanOrEqual(0);
    expect(sum.completedAt).toBe(new Date('2026-10-16T08:00:00').toISOString());
  });
  it('aiComment mentions label and skill names', () => {
    let s = emptyAssessment();
    for (const q of pool) s = recordAssessmentAnswer(s, q, q.skillId === 'A');
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 });
    const text = aiComment(sum, 'Minh', (id) => `Skill ${id}`);
    expect(text).toContain('Minh');
    expect(text).toContain(sum.label);
    expect(text).toContain('Skill A');
    expect(text).toContain('Skill B');
  });
  it('aiComment handles empty assessment', () => {
    const sum = summarizeAssessment(emptyAssessment(), skills, { subject: 'toan', grade: 9 });
    expect(() => aiComment(sum, 'Minh', (id) => id)).not.toThrow();
    expect(sum.strengths).toEqual([]);
  });
});
```

Run: `npm test -- assessment` → Expected: FAIL.

- [ ] **Step 5: Implement `lib/engine/assessment.ts`**

```ts
import type { Grade, Question, QuestionType, Skill, Subject } from '@/lib/bank/types';
import { SUBJECT_LABEL } from '@/lib/bank/types';
import { estimateTheta, information, masteryLabel, thetaToScore, type MasteryLabel } from './irt';

export const ASSESSMENT_LENGTH = 12;
const ASSESSABLE = new Set<QuestionType>(['mcq', 'multi', 'tf4', 'short', 'fill', 'listen', 'match', 'order', 'graph']);

export interface AssessmentResponse { questionId: string; skillId: string; b: number; correct: boolean }
export interface AssessmentState { asked: string[]; responses: AssessmentResponse[] }
export const emptyAssessment = (): AssessmentState => ({ asked: [], responses: [] });
export const currentTheta = (s: AssessmentState) => estimateTheta(s.responses).theta;

export function nextAssessmentQuestion(
  pool: Question[], skills: Skill[], state: AssessmentState, length = ASSESSMENT_LENGTH,
): Question | null {
  if (state.asked.length >= length) return null;
  const skillIds = new Set(skills.map((s) => s.id));
  const candidates = pool.filter((q) => ASSESSABLE.has(q.type) && skillIds.has(q.skillId) && !state.asked.includes(q.id));
  if (candidates.length === 0) return null;
  const theta = currentTheta(state);
  const count = new Map<string, number>();
  for (const r of state.responses) count.set(r.skillId, (count.get(r.skillId) ?? 0) + 1);
  const minCount = Math.min(...candidates.map((q) => count.get(q.skillId) ?? 0));
  const coverage = candidates.filter((q) => (count.get(q.skillId) ?? 0) === minCount);
  return coverage.reduce((best, q) => (information(theta, q.b) > information(theta, best.b) ? q : best));
}

export function recordAssessmentAnswer(state: AssessmentState, q: Question, correct: boolean): AssessmentState {
  return {
    asked: [...state.asked, q.id],
    responses: [...state.responses, { questionId: q.id, skillId: q.skillId, b: q.b, correct }],
  };
}

export interface SkillResult { skillId: string; theta: number; score: number; answered: number }
export interface AssessmentSummary {
  subject: Subject; grade: Grade; theta: number; score: number; label: MasteryLabel;
  skills: SkillResult[]; strengths: string[]; weaknesses: string[]; completedAt: string;
}

export function summarizeAssessment(
  state: AssessmentState, skills: Skill[], meta: { subject: Subject; grade: Grade }, now: Date = new Date(),
): AssessmentSummary {
  const theta = currentTheta(state);
  const results: SkillResult[] = skills.map((s) => {
    const rs = state.responses.filter((r) => r.skillId === s.id);
    const t = estimateTheta(rs, { mean: theta, sd: 0.8 }).theta;
    return { skillId: s.id, theta: t, score: thetaToScore(t), answered: rs.length };
  });
  const assessed = results.filter((r) => r.answered > 0).sort((a, b) => b.theta - a.theta);
  const nStrong = Math.min(2, Math.floor(assessed.length / 2));
  const nWeak = Math.min(2, assessed.length - nStrong);
  const score = thetaToScore(theta);
  return {
    ...meta, theta, score, label: masteryLabel(score), skills: results,
    strengths: assessed.slice(0, nStrong).map((r) => r.skillId),
    weaknesses: assessed.slice(assessed.length - nWeak).reverse().map((r) => r.skillId),
    completedAt: now.toISOString(),
  };
}

export function aiComment(summary: AssessmentSummary, studentName: string, nameOf: (id: string) => string): string {
  const subject = SUBJECT_LABEL[summary.subject];
  const parts = [`${studentName} ơi, năng lực ${subject} hiện tại của em ở mức ${summary.label} (${summary.score}/100).`];
  if (summary.strengths.length) parts.push(`Em làm tốt nhất ở phần ${summary.strengths.map(nameOf).join(' và ')}.`);
  if (summary.weaknesses.length) {
    parts.push(`Phần cần tập trung là ${summary.weaknesses.map(nameOf).join(' và ')}.`);
    parts.push(`Bé Cú đã đưa ${nameOf(summary.weaknesses[0])} vào Learning Zone để em luyện vừa sức — mỗi ngày 15 phút, vùng của em sẽ mở rộng dần nhé!`);
  } else {
    parts.push('Hãy làm thêm vài câu để Bé Cú hiểu em rõ hơn nhé!');
  }
  return parts.join(' ');
}
```

Run: `npm test -- assessment` → Expected: PASS.

- [ ] **Step 6: Test Learning Zone (failing)**

`tests/lib/engine/learning-zone.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  classify, frontierLevel, seedZoneMap, skillZone, zoneExtent, pickNextQuestion, applyAnswer, LEVEL_B, type ZoneMap,
} from '@/lib/engine/learning-zone';
import { prob } from '@/lib/engine/irt';
import { makeQ, makeSkill } from '../../fixtures';

const A = makeSkill('A');
const B = makeSkill('B', ['A']);
const skills = [A, B];
const pool = [
  makeQ('a-nb-1', 'A', -1.5, 'NB'), makeQ('a-nb-2', 'A', -1.3, 'NB'), makeQ('a-th-1', 'A', -0.5, 'TH'),
  makeQ('a-vd-1', 'A', 0.5, 'VD'), makeQ('a-vdc-1', 'A', 1.5, 'VDC'), makeQ('b-nb-1', 'B', -1.5, 'NB'),
];

describe('learning zone', () => {
  it('classify thresholds', () => {
    expect(classify(0.9)).toBe('mastered');
    expect(classify(0.85)).toBe('mastered');
    expect(classify(0.7)).toBe('learning');
    expect(classify(0.5)).toBe('learning');
    expect(classify(0.49)).toBe('challenge');
  });
  it('frontierLevel is the first level not yet mastered', () => {
    expect(frontierLevel(0)).toBe('NB');
    expect(frontierLevel(0.4)).toBe('TH');
    expect(frontierLevel(5)).toBe('VDC');
  });
  it('seed: only root skills unlocked by default', () => {
    const map = seedZoneMap(skills);
    expect(Object.keys(map)).toEqual(['A']);
    expect(map.A).toEqual({ theta: 0, unlockedLevel: 'NB' });
  });
  it('seed with assessment thetas unlocks dependents when prereq reaches VD', () => {
    const map = seedZoneMap(skills, { A: 1.2 });
    expect(map.A.unlockedLevel).toBe('VD');
    expect(map.B).toBeDefined();
    expect(map.B.unlockedLevel).toBe('NB');
  });
  it('skillZone', () => {
    expect(skillZone(undefined).zone).toBe('challenge');
    expect(skillZone({ theta: 0, unlockedLevel: 'TH' }).zone).toBe('learning');
    expect(skillZone({ theta: 4, unlockedLevel: 'VDC' }).zone).toBe('mastered');
  });
  it('zoneExtent grows with progress', () => {
    const small: ZoneMap = { A: { theta: 0, unlockedLevel: 'NB' } };
    const big: ZoneMap = { A: { theta: 1, unlockedLevel: 'VD' }, B: { theta: 0, unlockedLevel: 'NB' } };
    expect(zoneExtent(big, skills)).toBeGreaterThan(zoneExtent(small, skills));
    expect(zoneExtent({}, skills)).toBe(0);
  });
  it('pickNext only from unlocked skills/levels, aiming p≈0.78', () => {
    const map: ZoneMap = { A: { theta: 0, unlockedLevel: 'TH' } };
    const q = pickNextQuestion(pool, map, [], () => 0)!;
    expect(q.skillId).toBe('A');
    expect(['NB', 'TH']).toContain(q.level);
    const p = prob(0, q.b);
    expect(p).toBeGreaterThanOrEqual(0.5);
    expect(p).toBeLessThan(0.92);
  });
  it('pickNext avoids recent, falls back when exhausted, returns null when nothing unlocked', () => {
    const map: ZoneMap = { A: { theta: 0, unlockedLevel: 'NB' } };
    const q = pickNextQuestion(pool, map, ['a-nb-1'], () => 0)!;
    expect(q.id).toBe('a-nb-2');
    const fallback = pickNextQuestion(pool, map, ['x', 'y', 'z', 'a-nb-1', 'a-nb-2'], () => 0);
    expect(fallback).not.toBeNull();
    expect(pickNextQuestion(pool, {}, [], () => 0)).toBeNull();
    expect(pickNextQuestion([], map, [], () => 0)).toBeNull();
  });
  it('correct answers expand the zone (level unlock) within 6 answers', () => {
    let map: ZoneMap = { A: { theta: -0.5, unlockedLevel: 'NB' } };
    const events = [];
    for (let i = 0; i < 6; i++) {
      const r = applyAnswer(map, skills, pool[0], true);
      map = r.map; events.push(...r.events);
    }
    expect(events).toContainEqual({ type: 'level', skillId: 'A', level: 'TH' });
    expect(map.A.unlockedLevel).toBe('TH');
  });
  it('wrong answers lower theta but never re-lock levels', () => {
    const r = applyAnswer({ A: { theta: 0, unlockedLevel: 'TH' } }, skills, pool[2], false);
    expect(r.map.A.theta).toBeLessThan(0);
    expect(r.map.A.unlockedLevel).toBe('TH');
    expect(r.events).toEqual([]);
  });
  it('reaching VD unlocks dependent skill', () => {
    const start: ZoneMap = { A: { theta: LEVEL_B.TH + 1.7, unlockedLevel: 'TH' } };
    const r = applyAnswer(start, skills, pool[2], true);
    expect(r.map.A.unlockedLevel).toBe('VD');
    expect(r.events).toContainEqual({ type: 'skill', skillId: 'B' });
    expect(r.map.B.unlockedLevel).toBe('NB');
  });
  it('applyAnswer on unknown skill is a no-op', () => {
    const map: ZoneMap = {};
    expect(applyAnswer(map, skills, pool[0], true)).toEqual({ map, events: [] });
  });
});
```

Run: `npm test -- learning-zone` → Expected: FAIL.

- [ ] **Step 7: Implement `lib/engine/learning-zone.ts`**

```ts
import { LEVELS, type Level, type Question, type Skill } from '@/lib/bank/types';
import { prob, updateThetaStep } from './irt';

export type Zone = 'mastered' | 'learning' | 'challenge';
export const LEVEL_B: Record<Level, number> = { NB: -1.5, TH: -0.5, VD: 0.5, VDC: 1.5 };
export const TARGET_P = 0.78;
export const MASTERY_P = 0.85;
/** Bước cập nhật lớn hơn assessment để vùng mở rộng thấy rõ trong 1 phiên demo */
export const LZ_K = 0.6;

export interface SkillProgress { theta: number; unlockedLevel: Level }
export type ZoneMap = Record<string, SkillProgress>;
export type ZoneEvent = { type: 'level'; skillId: string; level: Level } | { type: 'skill'; skillId: string };

const idx = (l: Level) => LEVELS.indexOf(l);

export function classify(p: number): Zone {
  if (p >= MASTERY_P) return 'mastered';
  if (p >= 0.5) return 'learning';
  return 'challenge';
}

export function frontierLevel(theta: number): Level {
  return LEVELS.find((l) => prob(theta, LEVEL_B[l]) < MASTERY_P) ?? 'VDC';
}

const prereqsMet = (s: Skill, map: ZoneMap) =>
  s.prerequisites.every((p) => map[p] && idx(map[p].unlockedLevel) >= idx('VD'));

export function unlockNewSkills(map: ZoneMap, skills: Skill[]): { map: ZoneMap; events: ZoneEvent[] } {
  const next = { ...map };
  const events: ZoneEvent[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of skills) {
      if (next[s.id] || s.prerequisites.length === 0 || !prereqsMet(s, next)) continue;
      const theta = s.prerequisites.reduce((sum, p) => sum + next[p].theta, 0) / s.prerequisites.length - 0.5;
      next[s.id] = { theta, unlockedLevel: 'NB' };
      events.push({ type: 'skill', skillId: s.id });
      changed = true;
    }
  }
  return { map: next, events };
}

export function seedZoneMap(skills: Skill[], thetaBySkill: Record<string, number> = {}): ZoneMap {
  const map: ZoneMap = {};
  for (const s of skills) {
    if (s.id in thetaBySkill || s.prerequisites.length === 0) {
      const theta = thetaBySkill[s.id] ?? 0;
      map[s.id] = { theta, unlockedLevel: frontierLevel(theta) };
    }
  }
  return unlockNewSkills(map, skills).map;
}

export function skillZone(sp: SkillProgress | undefined): { zone: Zone; p: number } {
  if (!sp) return { zone: 'challenge', p: 0 };
  const p = prob(sp.theta, LEVEL_B[sp.unlockedLevel]);
  return { zone: sp.unlockedLevel === 'VDC' && p >= MASTERY_P ? 'mastered' : 'learning', p };
}

export function zoneExtent(map: ZoneMap, skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, s) => sum + (map[s.id] ? (idx(map[s.id].unlockedLevel) + 1) / 4 : 0), 0);
  return total / skills.length;
}

export function pickNextQuestion(
  pool: Question[], map: ZoneMap, recent: string[], rand: () => number = Math.random,
): Question | null {
  const unlocked = pool.filter((q) => map[q.skillId] && idx(q.level) <= idx(map[q.skillId].unlockedLevel));
  if (unlocked.length === 0) return null;
  let candidates = unlocked.filter((q) => !recent.includes(q.id));
  if (candidates.length === 0) candidates = unlocked.filter((q) => !recent.slice(-3).includes(q.id));
  if (candidates.length === 0) return null;
  let best: Question | null = null;
  let bestScore = Infinity;
  for (const q of candidates) {
    const p = prob(map[q.skillId].theta, q.b);
    const inZone = p >= 0.5 && p < 0.92;
    const score = Math.abs(p - TARGET_P) + (inZone ? 0 : 1) + rand() * 0.05;
    if (score < bestScore) { bestScore = score; best = q; }
  }
  return best;
}

export function applyAnswer(
  map: ZoneMap, skills: Skill[], q: Question, correct: boolean,
): { map: ZoneMap; events: ZoneEvent[] } {
  const sp = map[q.skillId];
  if (!sp) return { map, events: [] };
  const theta = updateThetaStep(sp.theta, q.b, correct, LZ_K);
  let unlockedLevel = sp.unlockedLevel;
  const events: ZoneEvent[] = [];
  if (unlockedLevel !== 'VDC' && prob(theta, LEVEL_B[unlockedLevel]) >= MASTERY_P) {
    unlockedLevel = LEVELS[idx(unlockedLevel) + 1];
    events.push({ type: 'level', skillId: q.skillId, level: unlockedLevel });
  }
  const r = unlockNewSkills({ ...map, [q.skillId]: { theta, unlockedLevel } }, skills);
  return { map: r.map, events: [...events, ...r.events] };
}
```

Run: `npm test -- engine` → Expected: tất cả PASS. Lưu ý test "reaching VD": theta = 1.2, p(1.2, −0.5) = 0.845; sau 1 câu đúng b = −0.5 thì theta tăng thêm ≈ 0.093 → p ≥ 0.85 → mở VD → B mở. Nếu fail do làm tròn thì tăng theta khởi đầu trong test lên `LEVEL_B.TH + 1.72`, không đổi hằng số engine.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(engine): IRT, adaptive assessment, learning zone with expansion"
```

---

### Task 5: Engine — Phòng thi, tạo đề, gamification

**Files:**
- Create: `lib/engine/exam.ts`, `lib/engine/exam-builder.ts`, `lib/engine/gamification.ts`
- Test: `tests/lib/engine/exam.test.ts`, `tests/lib/engine/exam-builder.test.ts`, `tests/lib/engine/gamification.test.ts`

**Interfaces:**
- Consumes: `checkAnswer` (Task 2), `ExamDef` (Task 3), types.
- Produces:
  - `exam.ts`: `interface ExamAttempt { examId; startedAt; durationSec; answers: Record<string, AnswerValue>; flagged: string[]; violations: number; submittedAt?: number }`, `startAttempt(exam: ExamDef, now: number)`, `remainingSec(a, now)`, `isExpired(a, now)`, `setAnswer(a, qid, v)`, `toggleFlag(a, qid)`, `addViolation(a)`, `isAnswered(v)`, `navStatus(a, qids) → Record<string, 'answered'|'unanswered'|'flagged'>`, `interface ExamResult`, `gradeAttempt(questions, a, now) → ExamResult`, `formatClock(sec)`
  - `exam-builder.ts`: `type Matrix = Record<Level, number>`, `shuffle(arr, rand)`, `buildExam(pool, matrix, rand?) → { questions; shortfall: Record<Level, number> }`
  - `gamification.ts`: `LEVEL_XP`, `xpFor(level, correct, comboBefore)`, `toDateKey(d: Date)`, `dayDiff(a, b)`, `interface Streak { count; lastDate }`, `updateStreak(s, today)`, `BADGES`, `type BadgeId`

- [ ] **Step 1: Test exam (failing)**

`tests/lib/engine/exam.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  startAttempt, remainingSec, isExpired, setAnswer, toggleFlag, addViolation, isAnswered, navStatus, gradeAttempt, formatClock,
} from '@/lib/engine/exam';
import type { ExamDef } from '@/lib/bank/exams';
import type { Question } from '@/lib/bank/types';

const exam: ExamDef = { id: 'e', title: 'E', kind: '15p', subject: 'toan', grade: 9, durationMin: 15, questionIds: ['q1', 'q2', 'q3'], schedule: '' };
const base = { subject: 'toan', grade: 9, skillId: 's', b: 0, content: '', explanation: '', hints: [], source: 'NXB' } as const;
const qs: Question[] = [
  { ...base, id: 'q1', level: 'NB', type: 'mcq', options: ['a', 'b'], answer: 0 },
  { ...base, id: 'q2', level: 'TH', type: 'tf4', statements: ['1', '2', '3', '4'], answer: [true, true, true, true] },
  { ...base, id: 'q3', level: 'VD', type: 'short', answer: '2' },
];
const T0 = 1_000_000;

describe('exam', () => {
  it('timer is based on startedAt (survives reload)', () => {
    const a = startAttempt(exam, T0);
    expect(a.durationSec).toBe(900);
    expect(remainingSec(a, T0)).toBe(900);
    expect(remainingSec(a, T0 + 60_500)).toBe(840);
    const reloaded = JSON.parse(JSON.stringify(a));
    expect(remainingSec(reloaded, T0 + 60_500)).toBe(840);
  });
  it('expires and never goes negative', () => {
    const a = startAttempt(exam, T0);
    expect(isExpired(a, T0 + 899_000)).toBe(false);
    expect(isExpired(a, T0 + 900_000)).toBe(true);
    expect(remainingSec(a, T0 + 5_000_000)).toBe(0);
  });
  it('answers, flags, violations are immutable updates', () => {
    const a = startAttempt(exam, T0);
    const b = toggleFlag(setAnswer(a, 'q1', 0), 'q3');
    expect(a.answers).toEqual({});
    expect(b.answers.q1).toBe(0);
    expect(b.flagged).toEqual(['q3']);
    expect(toggleFlag(b, 'q3').flagged).toEqual([]);
    expect(addViolation(addViolation(b)).violations).toBe(2);
  });
  it('isAnswered', () => {
    expect(isAnswered(undefined as never)).toBe(false);
    expect(isAnswered(null)).toBe(false);
    expect(isAnswered('')).toBe(false);
    expect(isAnswered([])).toBe(false);
    expect(isAnswered([null, null, null, null])).toBe(false);
    expect(isAnswered([true, null, null, null])).toBe(true);
    expect(isAnswered(0)).toBe(true);
    expect(isAnswered({ x: 0, y: 0 })).toBe(true);
  });
  it('navStatus: flagged wins over answered', () => {
    let a = startAttempt(exam, T0);
    a = setAnswer(a, 'q1', 0);
    a = toggleFlag(setAnswer(a, 'q2', [true, null, null, null]), 'q2');
    expect(navStatus(a, exam.questionIds)).toEqual({ q1: 'answered', q2: 'flagged', q3: 'unanswered' });
  });
  it('grades with tf4 partial credit and level breakdown', () => {
    let a = startAttempt(exam, T0);
    a = setAnswer(a, 'q1', 0);
    a = setAnswer(a, 'q2', [true, true, true, false]);
    a = addViolation(a);
    const r = gradeAttempt(qs, a, T0 + 120_000);
    expect(r.correct).toBe(1);
    expect(r.total).toBe(3);
    expect(r.score10).toBeCloseTo(5);
    expect(r.byLevel.NB).toEqual({ correct: 1, total: 1 });
    expect(r.byLevel.VD).toEqual({ correct: 0, total: 1 });
    expect(r.violations).toBe(1);
    expect(r.durationUsedSec).toBe(120);
  });
  it('durationUsed capped at duration when submitted late', () => {
    const r = gradeAttempt(qs, startAttempt(exam, T0), T0 + 10_000_000);
    expect(r.durationUsedSec).toBe(900);
    expect(r.score10).toBe(0);
  });
  it('formatClock', () => {
    expect(formatClock(2700)).toBe('45:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(5400)).toBe('1:30:00');
    expect(formatClock(0)).toBe('00:00');
  });
});
```

Run: `npm test -- exam.test` → Expected: FAIL.

- [ ] **Step 2: Implement `lib/engine/exam.ts`**

```ts
import type { ExamDef } from '@/lib/bank/exams';
import { checkAnswer } from '@/lib/bank/check';
import { LEVELS, type AnswerValue, type Level, type Question } from '@/lib/bank/types';

export interface ExamAttempt {
  examId: string; startedAt: number; durationSec: number;
  answers: Record<string, AnswerValue>; flagged: string[]; violations: number; submittedAt?: number;
}
export type NavState = 'answered' | 'unanswered' | 'flagged';

export const startAttempt = (exam: ExamDef, now: number): ExamAttempt =>
  ({ examId: exam.id, startedAt: now, durationSec: exam.durationMin * 60, answers: {}, flagged: [], violations: 0 });

export const remainingSec = (a: ExamAttempt, now: number) =>
  Math.max(0, Math.ceil((a.startedAt + a.durationSec * 1000 - now) / 1000));
export const isExpired = (a: ExamAttempt, now: number) => remainingSec(a, now) === 0;

export const setAnswer = (a: ExamAttempt, qid: string, v: AnswerValue): ExamAttempt =>
  ({ ...a, answers: { ...a.answers, [qid]: v } });
export const toggleFlag = (a: ExamAttempt, qid: string): ExamAttempt =>
  ({ ...a, flagged: a.flagged.includes(qid) ? a.flagged.filter((x) => x !== qid) : [...a.flagged, qid] });
export const addViolation = (a: ExamAttempt): ExamAttempt => ({ ...a, violations: a.violations + 1 });

export function isAnswered(v: AnswerValue | undefined): boolean {
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v)) return v.length > 0 && v.some((x) => x !== null && x !== '' && x !== -1);
  return true;
}

export function navStatus(a: ExamAttempt, qids: string[]): Record<string, NavState> {
  return Object.fromEntries(qids.map((id) => [
    id, a.flagged.includes(id) ? 'flagged' : isAnswered(a.answers[id]) ? 'answered' : 'unanswered',
  ]));
}

export interface ExamResult {
  examId: string; score10: number; correct: number; total: number;
  byLevel: Record<Level, { correct: number; total: number }>;
  perQuestion: { questionId: string; fraction: number; correct: boolean }[];
  violations: number; durationUsedSec: number; submittedAt: number;
}

export function gradeAttempt(questions: Question[], a: ExamAttempt, now: number): ExamResult {
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, { correct: 0, total: 0 }])) as ExamResult['byLevel'];
  const perQuestion = questions.map((q) => {
    const r = checkAnswer(q, a.answers[q.id] ?? null);
    byLevel[q.level].total += 1;
    if (r.correct) byLevel[q.level].correct += 1;
    return { questionId: q.id, fraction: r.fraction, correct: r.correct };
  });
  const sum = perQuestion.reduce((s, p) => s + p.fraction, 0);
  return {
    examId: a.examId,
    score10: questions.length ? Math.round((sum / questions.length) * 1000) / 100 : 0,
    correct: perQuestion.filter((p) => p.correct).length,
    total: questions.length, byLevel, perQuestion, violations: a.violations,
    durationUsedSec: Math.min(a.durationSec, Math.round((now - a.startedAt) / 1000)),
    submittedAt: now,
  };
}

export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
```

Kiểm tra lại test grade: q1 đúng (1), q2 đúng 3/4 ý (0.5), q3 không làm (0) → tổng 1.5/3 → 5.0 ✓.

- [ ] **Step 3: Test & implement exam-builder**

`tests/lib/engine/exam-builder.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildExam, shuffle } from '@/lib/engine/exam-builder';
import { makeQ } from '../../fixtures';

const pool = [
  makeQ('n1', 's', -1.5, 'NB'), makeQ('n2', 's', -1.5, 'NB'), makeQ('n3', 's', -1.5, 'NB'),
  makeQ('t1', 's', -0.5, 'TH'), makeQ('t2', 's', -0.5, 'TH'), makeQ('v1', 's', 0.5, 'VD'),
];

describe('exam builder', () => {
  it('shuffle keeps elements', () => {
    expect(shuffle([1, 2, 3, 4], () => 0.3).sort()).toEqual([1, 2, 3, 4]);
  });
  it('picks per level, no duplicates', () => {
    const r = buildExam(pool, { NB: 2, TH: 1, VD: 1, VDC: 0 }, () => 0.5);
    expect(r.questions).toHaveLength(4);
    expect(new Set(r.questions.map((q) => q.id)).size).toBe(4);
    expect(r.questions.filter((q) => q.level === 'NB')).toHaveLength(2);
    expect(r.shortfall).toEqual({ NB: 0, TH: 0, VD: 0, VDC: 0 });
  });
  it('reports shortfall when bank lacks questions; orders by level', () => {
    const r = buildExam(pool, { NB: 1, TH: 5, VD: 1, VDC: 2 }, () => 0.5);
    expect(r.shortfall).toEqual({ NB: 0, TH: 3, VD: 0, VDC: 2 });
    expect(r.questions.map((q) => q.level)).toEqual(['NB', 'TH', 'TH', 'VD']);
  });
});
```

`lib/engine/exam-builder.ts`:
```ts
import { LEVELS, type Level, type Question } from '@/lib/bank/types';

export type Matrix = Record<Level, number>;

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildExam(pool: Question[], matrix: Matrix, rand: () => number = Math.random) {
  const questions: Question[] = [];
  const shortfall = { NB: 0, TH: 0, VD: 0, VDC: 0 } as Record<Level, number>;
  for (const level of LEVELS) {
    const want = Math.max(0, matrix[level]);
    const taken = shuffle(pool.filter((q) => q.level === level), rand).slice(0, want);
    questions.push(...taken);
    shortfall[level] = want - taken.length;
  }
  return { questions, shortfall };
}
```

- [ ] **Step 4: Test & implement gamification**

`tests/lib/engine/gamification.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { xpFor, updateStreak, toDateKey, dayDiff, BADGES } from '@/lib/engine/gamification';

describe('gamification', () => {
  it('xpFor', () => {
    expect(xpFor('NB', false, 3)).toBe(0);
    expect(xpFor('NB', true, 0)).toBe(5);
    expect(xpFor('VDC', true, 2)).toBe(24);
    expect(xpFor('TH', true, 99)).toBe(20);
  });
  it('toDateKey uses local date', () => {
    expect(toDateKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
  });
  it('dayDiff', () => {
    expect(dayDiff('2026-10-15', '2026-10-16')).toBe(1);
    expect(dayDiff('2026-09-30', '2026-10-01')).toBe(1);
  });
  it('updateStreak', () => {
    const s = { count: 6, lastDate: '2026-10-15' };
    expect(updateStreak(s, '2026-10-15')).toBe(s);
    expect(updateStreak(s, '2026-10-16')).toEqual({ count: 7, lastDate: '2026-10-16' });
    expect(updateStreak(s, '2026-10-18')).toEqual({ count: 1, lastDate: '2026-10-18' });
  });
  it('badges defined', () => {
    expect(Object.keys(BADGES)).toEqual(['first-assessment', 'combo-5', 'zone-expand', 'first-exam']);
  });
});
```

`lib/engine/gamification.ts`:
```ts
import type { Level } from '@/lib/bank/types';

export const LEVEL_XP: Record<Level, number> = { NB: 5, TH: 10, VD: 15, VDC: 20 };

/** comboBefore = số câu đúng liên tiếp TRƯỚC câu này */
export function xpFor(level: Level, correct: boolean, comboBefore: number): number {
  return correct ? LEVEL_XP[level] + Math.min(comboBefore, 5) * 2 : 0;
}

export function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayDiff(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

export interface Streak { count: number; lastDate: string }
export function updateStreak(s: Streak, today: string): Streak {
  if (s.lastDate === today) return s;
  return dayDiff(s.lastDate, today) === 1 ? { count: s.count + 1, lastDate: today } : { count: 1, lastDate: today };
}

export const BADGES = {
  'first-assessment': { name: 'Lần đầu đánh giá', icon: '🎯' },
  'combo-5': { name: 'Combo 5', icon: '🔥' },
  'zone-expand': { name: 'Mở rộng vùng', icon: '🌱' },
  'first-exam': { name: 'Hoàn thành bài thi', icon: '📝' },
} as const;
export type BadgeId = keyof typeof BADGES;
```

- [ ] **Step 5: Run & commit**

Run: `npm test` → Expected: tất cả PASS.

```bash
git add -A && git commit -m "feat(engine): exam attempt/grading, exam builder, gamification"
```

---

### Task 6: Demo store (Zustand + persist)

**Files:**
- Create: `lib/store/demo-store.ts`, `lib/store/use-hydrated.ts`
- Test: `tests/lib/store/demo-store.test.ts`

**Interfaces:**
- Consumes: engine Task 4–5, bank Task 3.
- Produces:
  - `zoneKey(subject, grade) → string`
  - `interface HistoryItem { date; subject; answered; correct; xp }`
  - `interface DemoData { version; profile: { name; grade }; xp; streak: Streak; combo; zones: Record<string, ZoneMap>; assessments: Record<string, AssessmentSummary>; history: HistoryItem[]; badges: BadgeId[]; exam: ExamAttempt | null; examResults: Record<string, ExamResult> }`
  - `createSeed(now?: Date) → DemoData`, `sanitizePersisted(p: unknown, now?) → DemoData`, `STORE_VERSION = 1`
  - Hook `useDemo` với actions:
    - `setGrade(g: Grade)`
    - `recordAnswer(subject, q, correct) → { xp: number; combo: number; newBadges: BadgeId[] }`
    - `saveAssessment(summary) → BadgeId[]` (lưu kết quả + seed zone map theo theta từng skill)
    - `ensureZone(subject, grade) → ZoneMap` (seed mặc định nếu chưa có)
    - `setZone(subject, grade, map)`
    - `awardBadge(id) → boolean` (true nếu mới)
    - `setExam(a: ExamAttempt | null)`
    - `finishExam(result) → BadgeId[]`
    - `resetDemo()`
  - `useHydrated() → boolean`

- [ ] **Step 1: Test (failing)**

`tests/lib/store/demo-store.test.ts`:
```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useDemo, createSeed, sanitizePersisted, zoneKey, STORE_VERSION } from '@/lib/store/demo-store';
import { questionsFor, skillsFor } from '@/lib/bank';
import { emptyAssessment, recordAssessmentAnswer, summarizeAssessment } from '@/lib/engine/assessment';
import { toDateKey } from '@/lib/engine/gamification';

const NOW = new Date(2026, 9, 16, 9, 0);

beforeEach(() => {
  localStorage.clear();
  useDemo.getState().resetDemo();
});

describe('seed', () => {
  it('has a believable demo profile', () => {
    const s = createSeed(NOW);
    expect(s.profile).toEqual({ name: 'Minh', grade: 9 });
    expect(s.streak).toEqual({ count: 6, lastDate: '2026-10-15' });
    expect(s.xp).toBe(1240);
    expect(s.history).toHaveLength(6);
    expect(s.zones).toEqual({});
    expect(s.version).toBe(STORE_VERSION);
  });
});

describe('sanitizePersisted', () => {
  it.each([null, 'garbage', 42, {}, { version: 0, profile: { name: 'x', grade: 9 } }, { version: STORE_VERSION, profile: { name: 'x', grade: 7 } }])(
    'falls back to seed for %j', (p) => {
      expect(sanitizePersisted(p, NOW)).toEqual(createSeed(NOW));
    });
  it('keeps valid data', () => {
    const valid = { ...createSeed(NOW), xp: 99 };
    expect(sanitizePersisted(valid, NOW).xp).toBe(99);
  });
});

describe('actions', () => {
  it('recordAnswer adds xp, combo, streak, today history', () => {
    const q = questionsFor('toan', 9)[0];
    const r1 = useDemo.getState().recordAnswer('toan', q, true);
    expect(r1.xp).toBeGreaterThan(0);
    expect(r1.combo).toBe(1);
    const st = useDemo.getState();
    expect(st.streak.lastDate).toBe(toDateKey(new Date()));
    const today = st.history.find((h) => h.date === toDateKey(new Date()) && h.subject === 'toan')!;
    expect(today.answered).toBe(1);
    expect(today.correct).toBe(1);
    const r2 = useDemo.getState().recordAnswer('toan', q, false);
    expect(r2).toMatchObject({ xp: 0, combo: 0 });
  });
  it('awards combo-5 badge exactly once', () => {
    const q = questionsFor('toan', 9)[0];
    const badges = [];
    for (let i = 0; i < 7; i++) badges.push(...useDemo.getState().recordAnswer('toan', q, true).newBadges);
    expect(badges).toEqual(['combo-5']);
  });
  it('saveAssessment seeds zone map from skill thetas', () => {
    const skills = skillsFor('toan', 9);
    let s = emptyAssessment();
    for (const q of questionsFor('toan', 9).slice(0, 6)) s = recordAssessmentAnswer(s, q, true);
    const sum = summarizeAssessment(s, skills, { subject: 'toan', grade: 9 });
    const badges = useDemo.getState().saveAssessment(sum);
    expect(badges).toEqual(['first-assessment']);
    const st = useDemo.getState();
    expect(st.assessments[zoneKey('toan', 9)]).toEqual(sum);
    expect(Object.keys(st.zones[zoneKey('toan', 9)]).length).toBeGreaterThan(0);
    expect(useDemo.getState().saveAssessment(sum)).toEqual([]);
  });
  it('ensureZone seeds per subject-grade without touching others', () => {
    const m6 = useDemo.getState().ensureZone('anh', 6);
    expect(Object.keys(m6).length).toBeGreaterThan(0);
    expect(useDemo.getState().zones[zoneKey('toan', 9)]).toBeUndefined();
    expect(useDemo.getState().ensureZone('anh', 6)).toBe(useDemo.getState().zones[zoneKey('anh', 6)]);
  });
  it('setGrade switches grade only', () => {
    useDemo.getState().setGrade(12);
    expect(useDemo.getState().profile.grade).toBe(12);
  });
  it('exam attempt persists and finishing stores result', () => {
    useDemo.getState().setExam({ examId: 'x', startedAt: 1, durationSec: 60, answers: { a: 1 }, flagged: [], violations: 2 });
    expect(JSON.parse(localStorage.getItem('thi-ai-demo')!).state.exam.violations).toBe(2);
    const badges = useDemo.getState().finishExam({ examId: 'x', score10: 8, correct: 1, total: 1, byLevel: { NB: { correct: 1, total: 1 }, TH: { correct: 0, total: 0 }, VD: { correct: 0, total: 0 }, VDC: { correct: 0, total: 0 } }, perQuestion: [], violations: 2, durationUsedSec: 10, submittedAt: 2 });
    expect(badges).toEqual(['first-exam']);
    expect(useDemo.getState().exam).toBeNull();
    expect(useDemo.getState().examResults.x.score10).toBe(8);
  });
  it('resetDemo restores seed', () => {
    useDemo.getState().setGrade(6);
    useDemo.getState().resetDemo();
    expect(useDemo.getState().profile.grade).toBe(9);
  });
});
```

Run: `npm test -- demo-store` → Expected: FAIL.

- [ ] **Step 2: Implement store**

`lib/store/demo-store.ts`:
```ts
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GRADES, type Grade, type Question, type Subject } from '@/lib/bank/types';
import { skillsFor } from '@/lib/bank';
import type { AssessmentSummary } from '@/lib/engine/assessment';
import { seedZoneMap, type ZoneMap } from '@/lib/engine/learning-zone';
import type { ExamAttempt, ExamResult } from '@/lib/engine/exam';
import { toDateKey, updateStreak, xpFor, type BadgeId, type Streak } from '@/lib/engine/gamification';

export const STORE_VERSION = 1;
export const zoneKey = (subject: Subject, grade: Grade) => `${subject}-${grade}`;

export interface HistoryItem { date: string; subject: Subject; answered: number; correct: number; xp: number }
export interface DemoData {
  version: number;
  profile: { name: string; grade: Grade };
  xp: number; streak: Streak; combo: number;
  zones: Record<string, ZoneMap>;
  assessments: Record<string, AssessmentSummary>;
  history: HistoryItem[];
  badges: BadgeId[];
  exam: ExamAttempt | null;
  examResults: Record<string, ExamResult>;
}
interface Actions {
  setGrade: (g: Grade) => void;
  recordAnswer: (subject: Subject, q: Question, correct: boolean) => { xp: number; combo: number; newBadges: BadgeId[] };
  saveAssessment: (s: AssessmentSummary) => BadgeId[];
  ensureZone: (subject: Subject, grade: Grade) => ZoneMap;
  setZone: (subject: Subject, grade: Grade, map: ZoneMap) => void;
  awardBadge: (id: BadgeId) => boolean;
  setExam: (a: ExamAttempt | null) => void;
  finishExam: (r: ExamResult) => BadgeId[];
  resetDemo: () => void;
}
export type DemoState = DemoData & Actions;

export function createSeed(now: Date = new Date()): DemoData {
  const day = (offset: number) => toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));
  const history: HistoryItem[] = [6, 5, 4, 3, 2, 1].map((o, i) => ({
    date: day(o), subject: i % 2 ? 'anh' : 'toan', answered: 10 + i, correct: 7 + (i % 3), xp: 90 + i * 12,
  }));
  return {
    version: STORE_VERSION, profile: { name: 'Minh', grade: 9 }, xp: 1240,
    streak: { count: 6, lastDate: day(1) }, combo: 0, zones: {}, assessments: {}, history,
    badges: [], exam: null, examResults: {},
  };
}

export function sanitizePersisted(p: unknown, now: Date = new Date()): DemoData {
  const d = p as Partial<DemoData> | null;
  const ok = !!d && typeof d === 'object' && d.version === STORE_VERSION
    && typeof d.profile?.name === 'string' && GRADES.includes(d.profile?.grade as Grade)
    && typeof d.xp === 'number' && !!d.streak && Array.isArray(d.history) && Array.isArray(d.badges)
    && typeof d.zones === 'object' && typeof d.assessments === 'object' && typeof d.examResults === 'object';
  return ok ? { ...createSeed(now), ...(d as DemoData) } : createSeed(now);
}

const dataOnly = (s: DemoState): DemoData => ({
  version: s.version, profile: s.profile, xp: s.xp, streak: s.streak, combo: s.combo, zones: s.zones,
  assessments: s.assessments, history: s.history, badges: s.badges, exam: s.exam, examResults: s.examResults,
});

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      setGrade: (grade) => set((s) => ({ profile: { ...s.profile, grade } })),
      recordAnswer: (subject, q, correct) => {
        const s = get();
        const gained = xpFor(q.level, correct, s.combo);
        const combo = correct ? s.combo + 1 : 0;
        const today = toDateKey(new Date());
        const history = [...s.history];
        const i = history.findIndex((h) => h.date === today && h.subject === subject);
        const prev = i >= 0 ? history[i] : { date: today, subject, answered: 0, correct: 0, xp: 0 };
        const item = { ...prev, answered: prev.answered + 1, correct: prev.correct + (correct ? 1 : 0), xp: prev.xp + gained };
        if (i >= 0) history[i] = item; else history.push(item);
        set({ xp: s.xp + gained, combo, streak: updateStreak(s.streak, today), history });
        const newBadges: BadgeId[] = [];
        if (combo >= 5 && get().awardBadge('combo-5')) newBadges.push('combo-5');
        return { xp: gained, combo, newBadges };
      },
      saveAssessment: (summary) => {
        const key = zoneKey(summary.subject, summary.grade);
        const thetas = Object.fromEntries(summary.skills.filter((r) => r.answered > 0).map((r) => [r.skillId, r.theta]));
        const map = seedZoneMap(skillsFor(summary.subject, summary.grade), thetas);
        set((s) => ({ assessments: { ...s.assessments, [key]: summary }, zones: { ...s.zones, [key]: map } }));
        return get().awardBadge('first-assessment') ? ['first-assessment'] : [];
      },
      ensureZone: (subject, grade) => {
        const key = zoneKey(subject, grade);
        const existing = get().zones[key];
        if (existing) return existing;
        const map = seedZoneMap(skillsFor(subject, grade));
        set((s) => ({ zones: { ...s.zones, [key]: map } }));
        return map;
      },
      setZone: (subject, grade, map) => set((s) => ({ zones: { ...s.zones, [zoneKey(subject, grade)]: map } })),
      awardBadge: (id) => {
        if (get().badges.includes(id)) return false;
        set((s) => ({ badges: [...s.badges, id] }));
        return true;
      },
      setExam: (exam) => set({ exam }),
      finishExam: (r) => {
        set((s) => ({ exam: null, examResults: { ...s.examResults, [r.examId]: r } }));
        return get().awardBadge('first-exam') ? ['first-exam'] : [];
      },
      resetDemo: () => set(createSeed()),
    }),
    {
      name: 'thi-ai-demo',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => dataOnly(s),
      migrate: (p) => sanitizePersisted(p),
      merge: (persisted, current) => ({ ...current, ...sanitizePersisted(persisted) }),
      skipHydration: true,
    },
  ),
);
```

`lib/store/use-hydrated.ts`:
```ts
'use client';
import { useEffect, useState } from 'react';
import { useDemo } from './demo-store';

/** Rehydrate store từ localStorage sau khi mount để tránh hydration mismatch. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useDemo.persist.hasHydrated());
  useEffect(() => {
    const unsub = useDemo.persist.onFinishHydration(() => setHydrated(true));
    if (!useDemo.persist.hasHydrated()) void useDemo.persist.rehydrate();
    else setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
```

- [ ] **Step 3: Run & commit**

Run: `npm test` → Expected: PASS.

```bash
git add -A && git commit -m "feat(store): persisted demo store with seed, sanitize, actions"
```

---

### Task 7: UI primitives & Bé Cú

**Files:**
- Create: `components/ui/{clay-button,clay-card,count-up,tilt-card,progress-bar,level-pill,nxb-badge,typewriter}.tsx`, `components/owl/owl.tsx`, `components/owl/owl-bubble.tsx`, `lib/ui/confetti.ts`
- Create (dev preview): `app/dev/owl/page.tsx`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Produces:
  - `<ClayButton variant="primary|secondary|ghost|mint" size="md|lg" {...buttonProps}>`
  - `<ClayCard className? as?>`
  - `<CountUp value={number} duration?={1.2} format?={(n) => string} />`
  - `<TiltCard className?>` (nghiêng 3D theo chuột)
  - `<ProgressBar value={0..1} color?="coral|lavender|mint" />`
  - `<LevelPill level={Level} />`, `<NxbBadge />`
  - `<Typewriter text speed?={18} onDone? />`
  - `type OwlState = 'idle'|'thinking'|'correct'|'wrong'|'celebrate'|'cheer'`, `<Owl state size? lookAt?={{x,y}} />`, `<OwlBubble>`
  - `fireConfetti(opts?: { origin?: { x: number; y: number } })`

- [ ] **Step 1: Test (failing)**

`tests/components/ui.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClayButton } from '@/components/ui/clay-button';
import { LevelPill } from '@/components/ui/level-pill';
import { Owl } from '@/components/owl/owl';

describe('ui primitives', () => {
  it('ClayButton renders and is clickable', () => {
    render(<ClayButton>Bắt đầu</ClayButton>);
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeInTheDocument();
  });
  it('LevelPill shows Vietnamese label', () => {
    render(<LevelPill level="VDC" />);
    expect(screen.getByText('Vận dụng cao')).toBeInTheDocument();
  });
  it.each(['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'cheer'] as const)('Owl renders state %s', (state) => {
    render(<Owl state={state} />);
    expect(screen.getByRole('img', { name: /Bé Cú/ })).toHaveAttribute('data-state', state);
  });
});
```

Run: `npm test -- ui.test` → Expected: FAIL.

- [ ] **Step 2: Primitives**

`components/ui/clay-button.tsx`:
```tsx
'use client';
import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-coral text-white shadow-[0_6px_0_var(--color-coral-dark)]',
  secondary: 'bg-lavender text-white shadow-[0_6px_0_var(--color-lavender-dark)]',
  mint: 'bg-mint-dark text-white shadow-[0_6px_0_#16653f]',
  ghost: 'bg-white text-ink shadow-[0_6px_0_#e3e6ff]',
} as const;
const SIZES = { md: 'px-5 py-3 text-base', lg: 'px-7 py-4 text-lg' } as const;

type Props = HTMLMotionProps<'button'> & { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES };

export const ClayButton = forwardRef<HTMLButtonElement, Props>(function ClayButton(
  { variant = 'primary', size = 'md', className = '', disabled, ...rest }, ref,
) {
  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 4, boxShadow: '0 2px 0 rgba(0,0,0,0.12)' }}
      className={`rounded-2xl font-display font-extrabold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
});
```

`components/ui/clay-card.tsx`:
```tsx
import type { HTMLAttributes } from 'react';
export function ClayCard({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-clay)] bg-white p-5 shadow-clay ${className}`} {...rest} />;
}
```

`components/ui/count-up.tsx`:
```tsx
'use client';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const vi = (n: number) => Math.round(n).toLocaleString('vi-VN');

export function CountUp({ value, duration = 1.2, format = vi }: { value: number; duration?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setDisplay(value); return; }
    const c = animate(0, value, { duration, ease: [0.2, 0.9, 0.3, 1], onUpdate: setDisplay });
    return () => c.stop();
  }, [inView, value, duration, reduce]);
  return <span ref={ref}>{format(display)}</span>;
}
```

`components/ui/tilt-card.tsx`:
```tsx
'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { ReactNode } from 'react';

export function TiltCard({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      onClick={onClick}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-[var(--radius-clay)] bg-white p-5 shadow-clay ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

`components/ui/progress-bar.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
const COLORS = {
  coral: 'linear-gradient(90deg,#ffb199,#ff8a65)',
  lavender: 'linear-gradient(90deg,#8ec5ff,#b39dff)',
  mint: 'linear-gradient(90deg,#9be7c0,#3ccf8e)',
};
export function ProgressBar({ value, color = 'lavender', className = '' }: { value: number; color?: keyof typeof COLORS; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-3 overflow-hidden rounded-full bg-lavender-soft ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="h-full rounded-full" style={{ background: COLORS[color] }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
    </div>
  );
}
```

`components/ui/level-pill.tsx`:
```tsx
import { LEVEL_LABEL, type Level } from '@/lib/bank/types';
const STYLE: Record<Level, string> = {
  NB: 'bg-mint text-mint-dark', TH: 'bg-lavender-soft text-lavender-dark', VD: 'bg-[#fff1d6] text-[#b7791f]', VDC: 'bg-peach text-peach-dark',
};
export function LevelPill({ level }: { level: Level }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[level]}`}>{LEVEL_LABEL[level]}</span>;
}
```

`components/ui/nxb-badge.tsx`:
```tsx
export function NxbBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-mint-dark ${className}`}>
      ✓ NXB phê duyệt
    </span>
  );
}
```

`components/ui/typewriter.tsx`:
```tsx
'use client';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

export function Typewriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) { setN(text.length); onDone?.(); return; }
    setN(0);
    const id = setInterval(() => setN((v) => {
      if (v >= text.length) { clearInterval(id); onDone?.(); return v; }
      return v + 1;
    }), speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span>{text.slice(0, n)}{n < text.length && <span className="animate-pulse">▍</span>}</span>;
}
```

`lib/ui/confetti.ts`:
```ts
import confetti from 'canvas-confetti';
export function fireConfetti(opts: { origin?: { x: number; y: number } } = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  void confetti({ particleCount: 110, spread: 75, startVelocity: 38, origin: opts.origin ?? { x: 0.5, y: 0.6 },
    colors: ['#ff8a65', '#a8b5ff', '#c9f2dc', '#ffd166', '#ffb3a7'], scalar: 1.1 });
}
```

- [ ] **Step 3: Bé Cú**

`components/owl/owl.tsx`:
```tsx
'use client';
import { motion, useReducedMotion, type Variants } from 'motion/react';

export type OwlState = 'idle' | 'thinking' | 'correct' | 'wrong' | 'celebrate' | 'cheer';

const body: Variants = {
  idle: { y: [0, -4, 0], rotate: 0, scaleY: 1, transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  thinking: { y: 0, rotate: [-3, 3, -3], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  correct: { y: [0, -26, 0, -8, 0], scaleY: [1, 0.92, 1.05, 0.98, 1], rotate: 0, transition: { duration: 0.8 } },
  wrong: { y: 0, rotate: -10, transition: { type: 'spring', stiffness: 220, damping: 10 } },
  celebrate: { y: [0, -32, 0], rotate: [0, 360], transition: { duration: 0.9, ease: 'easeOut' } },
  cheer: { y: [0, -8, 0], rotate: 0, transition: { duration: 0.6, repeat: Infinity } },
};
const wing = (side: 1 | -1): Variants => ({
  idle: { rotate: 0 },
  thinking: { rotate: 0 },
  correct: { rotate: [0, side * -35, 0], transition: { duration: 0.5 } },
  wrong: { rotate: side * 8 },
  celebrate: { rotate: [0, side * -40, 0, side * -40, 0], transition: { duration: 0.9 } },
  cheer: { rotate: [0, side * -35, 0], transition: { duration: 0.35, repeat: Infinity } },
});
const antenna: Variants = {
  idle: { scale: 1, fill: '#ff8a65' },
  thinking: { scale: [1, 1.35, 1], fill: ['#ff8a65', '#ffd166', '#ff8a65'], transition: { duration: 0.9, repeat: Infinity } },
  correct: { scale: 1.2, fill: '#3ccf8e' },
  wrong: { scale: 1, fill: '#ffb3a7' },
  celebrate: { scale: [1, 1.5, 1], fill: '#ffd166', transition: { duration: 0.5, repeat: 2 } },
  cheer: { scale: 1.1, fill: '#ffd166' },
};

export function Owl({ state = 'idle', size = 140, lookAt }: { state?: OwlState; size?: number; lookAt?: { x: number; y: number } }) {
  const reduce = useReducedMotion();
  const happy = state === 'correct' || state === 'celebrate' || state === 'cheer';
  const px = (lookAt?.x ?? (state === 'wrong' ? -0.6 : 0)) * 3;
  const py = (lookAt?.y ?? (state === 'wrong' ? 0.5 : 0)) * 3;
  return (
    <motion.svg
      role="img" aria-label={`Bé Cú (${state})`} data-state={state}
      width={size} height={size * 0.95} viewBox="0 0 150 142"
      variants={body} animate={reduce ? undefined : state} initial={false}
      style={{ originX: 0.5, originY: 1, overflow: 'visible' }}
    >
      <ellipse cx="75" cy="134" rx="40" ry="6" fill="#c9cdf5" opacity="0.6" />
      <line x1="75" y1="12" x2="75" y2="28" stroke="#7c83db" strokeWidth="4" strokeLinecap="round" />
      <motion.circle cx="75" cy="10" r="7" variants={antenna} animate={state} style={{ originX: 0.5, originY: 0.5 }} />
      <motion.ellipse cx="28" cy="84" rx="12" ry="24" fill="#8f9cf0" variants={wing(-1)} animate={reduce ? undefined : state} style={{ originX: 0.8, originY: 0.2 }} />
      <motion.ellipse cx="122" cy="84" rx="12" ry="24" fill="#8f9cf0" variants={wing(1)} animate={reduce ? undefined : state} style={{ originX: 0.2, originY: 0.2 }} />
      <rect x="28" y="28" width="94" height="100" rx="42" fill="#a8b5ff" />
      <rect x="28" y="28" width="94" height="100" rx="42" fill="url(#owlShine)" />
      <defs>
        <radialGradient id="owlShine" cx="0.35" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="38" y="42" width="74" height="50" rx="24" fill="#fff" />
      {happy ? (
        <g stroke="#2b2d42" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M51 68 Q60 58 69 68" />
          <path d="M81 68 Q90 58 99 68" />
        </g>
      ) : (
        <g>
          <motion.g
            animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
            style={{ originY: '66px' }}
          >
            <ellipse cx="60" cy="66" rx="9" ry="11" fill="#2b2d42" />
            <ellipse cx="90" cy="66" rx="9" ry="11" fill="#2b2d42" />
          </motion.g>
          <circle cx={63 + px} cy={62 + py} r="3" fill="#fff" />
          <circle cx={93 + px} cy={62 + py} r="3" fill="#fff" />
        </g>
      )}
      <path d="M70 80 L75 86 L80 80 Z" fill="#ff8a65" />
      {state === 'wrong' && <path d="M104 46 q4 8 0 12 q-4 -4 0 -12" fill="#8ec5ff" />}
      <ellipse cx="75" cy="110" rx="22" ry="12" fill="#c6cfff" />
      <circle cx="46" cy="86" r="5" fill="#ffb3a7" opacity="0.6" />
      <circle cx="104" cy="86" r="5" fill="#ffb3a7" opacity="0.6" />
    </motion.svg>
  );
}
```

`components/owl/owl-bubble.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
export function OwlBubble({ text, side = 'right' }: { text: string | null; side?: 'left' | 'right' }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div key={text}
          initial={{ opacity: 0, scale: 0.8, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          className={`relative max-w-xs rounded-2xl bg-white px-4 py-2.5 text-sm font-medium shadow-clay ${side === 'right' ? 'origin-bottom-left' : 'origin-bottom-right'}`}>
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Dev preview page**

`app/dev/owl/page.tsx` (chỉ để kiểm tra trực quan, giữ lại trong repo):
```tsx
'use client';
import { useState } from 'react';
import { Owl, type OwlState } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { fireConfetti } from '@/lib/ui/confetti';

const STATES: OwlState[] = ['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'cheer'];
export default function OwlDev() {
  const [s, setS] = useState<OwlState>('idle');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <Owl state={s} size={220} />
      <div className="flex flex-wrap gap-3">
        {STATES.map((x) => (
          <ClayButton key={x} variant={x === s ? 'primary' : 'ghost'} onClick={() => { setS(x); if (x === 'celebrate') fireConfetti(); }}>{x}</ClayButton>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm test && npm run typecheck`. Sau đó `npm run dev`, mở `http://localhost:3000/dev/owl`, bấm qua cả 6 trạng thái: mỗi trạng thái phải có chuyển động khác biệt rõ, không giật, mắt chớp ở trạng thái idle.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): clay primitives, Bé Cú owl with 6 states, confetti"
```

---

### Task 8: App shell, page transition, hydration guard

**Files:**
- Create: `components/layout/app-shell.tsx`, `app/(app)/layout.tsx`, `app/(app)/template.tsx`
- Test: `tests/components/app-shell.test.tsx`

**Interfaces:**
- Consumes: `useDemo`, `useHydrated`, `Owl`, primitives.
- Produces: mọi route trong `(app)` có nav trên cùng (Trang chủ · Luyện tập · Đánh giá AI · Learning Zone · Phòng thi), chip 🔥 streak và ⭐ XP, bộ chọn lớp, nút Reset demo. Route `/phong-thi/[examId]` ẩn nav (chế độ tập trung).

- [ ] **Step 1: Test (failing)**

`tests/components/app-shell.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let pathname = '/dashboard';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { AppShell } from '@/components/layout/app-shell';
import { useDemo } from '@/lib/store/demo-store';

beforeEach(() => { pathname = '/dashboard'; useDemo.getState().resetDemo(); });

describe('AppShell', () => {
  it('shows nav, streak and xp', async () => {
    render(<AppShell><p>nội dung</p></AppShell>);
    expect(await screen.findByText('nội dung')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learning Zone' })).toHaveAttribute('href', '/learning-zone');
    expect(screen.getByText('6')).toBeInTheDocument();
  });
  it('grade switch updates store', async () => {
    render(<AppShell><p>x</p></AppShell>);
    await userEvent.selectOptions(await screen.findByLabelText('Chọn lớp'), '12');
    expect(useDemo.getState().profile.grade).toBe(12);
  });
  it('hides nav in exam focus mode', async () => {
    pathname = '/phong-thi/toan9-45p-hpt';
    render(<AppShell><p>exam</p></AppShell>);
    expect(await screen.findByText('exam')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Learning Zone' })).toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

`components/layout/app-shell.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useDemo } from '@/lib/store/demo-store';
import { useHydrated } from '@/lib/store/use-hydrated';
import { Owl } from '@/components/owl/owl';
import { GRADES, type Grade } from '@/lib/bank/types';

const NAV = [
  { href: '/dashboard', label: 'Trang chủ' },
  { href: '/luyen-tap', label: 'Luyện tập' },
  { href: '/danh-gia', label: 'Đánh giá AI' },
  { href: '/learning-zone', label: 'Learning Zone' },
  { href: '/phong-thi', label: 'Phòng thi' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { streak, xp, profile, setGrade, resetDemo } = useDemo();
  const focus = /^\/phong-thi\/.+/.test(pathname);

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center"><Owl state="thinking" size={90} /></div>;
  }
  if (focus) return <div className="min-h-screen">{children}</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <Owl size={36} /> thi<span className="text-coral">.ai</span>.vn
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link key={n.href} href={n.href} className="relative rounded-xl px-3.5 py-2 text-sm font-semibold">
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-white shadow-clay" />}
                  <span className={`relative ${active ? 'text-coral' : 'text-muted hover:text-ink'}`}>{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-clay" title="Chuỗi ngày học">🔥 <span>{streak.count}</span></span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-clay" title="Điểm kinh nghiệm">⭐ {xp.toLocaleString('vi-VN')}</span>
            <label className="sr-only" htmlFor="grade">Chọn lớp</label>
            <select id="grade" value={profile.grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}
              className="rounded-xl bg-white px-2 py-1.5 shadow-clay outline-none">
              {GRADES.map((g) => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
            <button type="button" title="Reset demo" aria-label="Reset demo"
              onClick={() => { if (confirm('Xoá toàn bộ tiến độ demo và bắt đầu lại?')) resetDemo(); }}
              className="rounded-xl bg-white px-3 py-1.5 shadow-clay hover:text-coral">↺</button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral font-display text-white">{profile.name[0]}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
```

`app/(app)/layout.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

`app/(app)/template.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify & commit**

Run: `npm test -- app-shell && npm run typecheck` → PASS.

```bash
git add -A && git commit -m "feat(layout): app shell with nav, streak/xp chips, grade switch, reset"
```

---

### Task 9: Các dạng câu hỏi + QuestionView

**Files:**
- Create: `components/questions/{types.ts,math-text.tsx,math-field.tsx,mcq.tsx,multi.tsx,tf4.tsx,short.tsx,order.tsx,match.tsx,fill.tsx,graph.tsx,speak.tsx,write.tsx,question-view.tsx,feedback-extras.tsx}`, `types/mathlive.d.ts`
- Create (dev preview): `app/dev/questions/page.tsx`
- Test: `tests/components/questions.test.tsx`

**Interfaces:**
- Consumes: types, `checkAnswer`, `simulateSpeakingScore`, `simulateWritingRubric`, `skillName`.
- Produces:
  - `interface QuestionProps<Q> { question: Q; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled: boolean; reveal: boolean }`
  - `<QuestionView question value onChange disabled reveal index? showMeta? />`, hiển thị header (số câu, LevelPill, tên skill, NxbBadge), nội dung và component theo dạng
  - `<MathText text />` (render `$...$` bằng KaTeX, hỗ trợ `**đậm**` và xuống dòng)
  - `<SpeakFeedback question durationMs />`, `<WritingFeedback question text />`
  - `deterministicShuffle(n: number, seed: string): number[]` (export từ `order.tsx`, cũng dùng cho match/fill)

- [ ] **Step 1: Test (failing)**

`tests/components/questions.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionView } from '@/components/questions/question-view';
import { deterministicShuffle } from '@/components/questions/order';
import type { Question } from '@/lib/bank/types';

const base = { subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: -0.5, explanation: '', hints: [], source: 'NXB' } as const;

describe('QuestionView', () => {
  it('mcq selects option', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'm', type: 'mcq', content: 'Chọn', options: ['$x=1$', 'B'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: /B/ }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
  it('tf4 toggles a statement', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 't', type: 'tf4', content: 'Xét', statements: ['s1', 's2', 's3', 's4'], answer: [true, true, true, true] };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Sai' })[1]);
    expect(onChange).toHaveBeenCalledWith([null, false, null, null]);
  });
  it('fill: clicking a chip fills the first empty blank', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'f', type: 'fill', content: 'Điền', text: 'A ___ B ___', bank: ['who', 'which'], answer: ['who', 'which'] };
    render(<QuestionView question={q} value={['', '']} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'which' }));
    expect(onChange).toHaveBeenCalledWith(['which', '']);
  });
  it('match: select left then right pairs them', async () => {
    const onChange = vi.fn();
    const q: Question = { ...base, id: 'mt', type: 'match', content: 'Ghép', left: ['L1', 'L2'], right: ['R1', 'R2'], answer: [1, 0] };
    render(<QuestionView question={q} value={null} onChange={onChange} disabled={false} reveal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'L1' }));
    await userEvent.click(screen.getByRole('button', { name: 'R2' }));
    expect(onChange).toHaveBeenLastCalledWith([1, -1]);
  });
  it('reveal marks correct option', () => {
    const q: Question = { ...base, id: 'm2', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={1} onChange={() => {}} disabled reveal />);
    expect(screen.getByRole('button', { name: /A/ })).toHaveAttribute('data-result', 'correct');
    expect(screen.getByRole('button', { name: /B/ })).toHaveAttribute('data-result', 'wrong');
  });
  it('shows level and NXB badge', () => {
    const q: Question = { ...base, id: 'm3', type: 'mcq', content: 'Chọn', options: ['A', 'B'], answer: 0 };
    render(<QuestionView question={q} value={null} onChange={() => {}} disabled={false} reveal={false} index={3} />);
    expect(screen.getByText('Thông hiểu')).toBeInTheDocument();
    expect(screen.getByText(/NXB phê duyệt/)).toBeInTheDocument();
    expect(screen.getByText('Câu 3')).toBeInTheDocument();
  });
});

describe('deterministicShuffle', () => {
  it('is a stable non-identity permutation for n ≥ 2', () => {
    const a = deterministicShuffle(4, 'q1');
    expect([...a].sort()).toEqual([0, 1, 2, 3]);
    expect(a).toEqual(deterministicShuffle(4, 'q1'));
    expect(a).not.toEqual([0, 1, 2, 3]);
    expect(deterministicShuffle(2, 'x')).toEqual([1, 0]);
  });
});
```

Run: `npm test -- questions` → Expected: FAIL.

- [ ] **Step 2: Shared types, MathText, MathField**

`components/questions/types.ts`:
```ts
import type { AnswerValue, Question } from '@/lib/bank/types';
export interface QuestionProps<Q extends Question = Question> {
  question: Q; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled: boolean; reveal: boolean;
}
export const resultClass = (r: 'correct' | 'wrong' | 'missed' | null) =>
  r === 'correct' ? 'bg-mint ring-2 ring-mint-dark' : r === 'wrong' ? 'bg-peach ring-2 ring-peach-dark' : r === 'missed' ? 'ring-2 ring-dashed ring-mint-dark' : '';
```

`components/questions/math-text.tsx`:
```tsx
import katex from 'katex';
import { Fragment } from 'react';

function renderInline(text: string) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
      const html = katex.renderToString(p.slice(1, -1), { throwOnError: false });
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <span className={className}>
      {lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{renderInline(l)}</Fragment>)}
    </span>
  );
}
```

`types/mathlive.d.ts`:
```ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { 'math-virtual-keyboard-policy'?: string };
    }
  }
}
export {};
```

`components/questions/math-field.tsx`:
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

type MathFieldEl = HTMLElement & { getValue: (fmt: string) => string; value: string };

/** MathLive khi đã tải, fallback input thường trước đó / trong test */
export function MathField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const ref = useRef<MathFieldEl>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    import('mathlive').then(() => alive && setReady(true)).catch(() => {});
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    const handler = () => onChange(el.getValue('ascii-math'));
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [ready, onChange]);
  if (!ready) {
    return (
      <input aria-label="Nhập đáp án" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-64 rounded-2xl border-2 border-lavender-soft bg-white px-4 py-3 text-lg outline-none focus:border-lavender" />
    );
  }
  return (
    <math-field ref={ref} aria-label="Nhập đáp án" math-virtual-keyboard-policy="auto"
      {...(disabled ? { 'read-only': '' } : {})}
      style={{ minWidth: 256, fontSize: 22, padding: '10px 16px', borderRadius: 16, border: '2px solid #eef0ff', background: '#fff' }} />
  );
}
```

- [ ] **Step 3: Components dạng lựa chọn**

`components/questions/mcq.tsx` (dùng cho cả `mcq` và `listen`):
```tsx
'use client';
import { motion } from 'motion/react';
import type { ListenQuestion, McqQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import { resultClass, type QuestionProps } from './types';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function McqView({ question: q, value, onChange, disabled, reveal }: QuestionProps<McqQuestion | ListenQuestion>) {
  return (
    <div className="space-y-4">
      {q.type === 'listen' && (
        <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => speak(q.audioText)}
          className="flex items-center gap-3 rounded-2xl bg-peach px-5 py-3 font-semibold text-peach-dark shadow-clay">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white">▶</span> Nghe đoạn audio
        </motion.button>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const selected = value === i;
          const result = reveal ? (i === q.answer ? 'correct' : selected ? 'wrong' : null) : null;
          return (
            <motion.button key={i} type="button" disabled={disabled} data-result={result ?? undefined}
              whileHover={disabled ? undefined : { y: -2 }} whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => onChange(i)}
              className={`flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-clay transition-colors ${selected && !reveal ? 'ring-2 ring-lavender' : ''} ${resultClass(result)}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${selected ? 'bg-lavender text-white' : 'bg-lavender-soft text-lavender-dark'}`}>{LETTERS[i]}</span>
              <MathText text={opt} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

`components/questions/multi.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import type { MultiQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import { resultClass, type QuestionProps } from './types';

export function MultiView({ question: q, value, onChange, disabled, reveal }: QuestionProps<MultiQuestion>) {
  const sel = Array.isArray(value) ? (value as number[]) : [];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Có thể chọn nhiều đáp án</p>
      {q.options.map((opt, i) => {
        const on = sel.includes(i);
        const should = q.answer.includes(i);
        const result = reveal ? (should && on ? 'correct' : on ? 'wrong' : should ? 'missed' : null) : null;
        return (
          <motion.button key={i} type="button" disabled={disabled} data-result={result ?? undefined} whileTap={{ scale: 0.98 }}
            onClick={() => onChange(on ? sel.filter((x) => x !== i) : [...sel, i])}
            className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-clay ${on && !reveal ? 'ring-2 ring-lavender' : ''} ${resultClass(result)}`}>
            <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }}
              className={`grid h-7 w-7 place-items-center rounded-lg border-2 ${on ? 'border-lavender bg-lavender text-white' : 'border-lavender-soft'}`}>{on ? '✓' : ''}</motion.span>
            <MathText text={opt} />
          </motion.button>
        );
      })}
    </div>
  );
}
```

`components/questions/tf4.tsx`:
```tsx
'use client';
import type { Tf4Question } from '@/lib/bank/types';
import { MathText } from './math-text';
import type { QuestionProps } from './types';

const LABELS = ['a', 'b', 'c', 'd'];

export function Tf4View({ question: q, value, onChange, disabled, reveal }: QuestionProps<Tf4Question>) {
  const cur = (Array.isArray(value) ? value : [null, null, null, null]) as (boolean | null)[];
  const set = (i: number, v: boolean) => onChange(cur.map((x, j) => (j === i ? v : x)));
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-clay">
      {q.statements.map((s, i) => {
        const ok = reveal ? cur[i] === q.answer[i] : null;
        return (
          <div key={i} className={`flex items-center gap-4 border-b border-lavender-soft px-5 py-4 last:border-0 ${ok === true ? 'bg-mint/50' : ok === false ? 'bg-peach/60' : ''}`}>
            <span className="font-display font-bold text-lavender-dark">{LABELS[i]})</span>
            <MathText text={s} className="flex-1" />
            {[true, false].map((v) => (
              <button key={String(v)} type="button" disabled={disabled} onClick={() => set(i, v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${cur[i] === v ? (v ? 'bg-mint-dark text-white' : 'bg-coral text-white') : 'bg-lavender-soft text-muted'}`}>
                {v ? 'Đúng' : 'Sai'}
              </button>
            ))}
            {reveal && <span className="w-16 text-right text-xs font-semibold text-muted">→ {q.answer[i] ? 'Đúng' : 'Sai'}</span>}
          </div>
        );
      })}
    </div>
  );
}
```

`components/questions/short.tsx`:
```tsx
'use client';
import type { ShortQuestion } from '@/lib/bank/types';
import { MathField } from './math-field';
import type { QuestionProps } from './types';

export function ShortView({ question: q, value, onChange, disabled, reveal }: QuestionProps<ShortQuestion>) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="font-semibold">Đáp án:</span>
      <MathField value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} />
      {q.unit && <span className="text-muted">{q.unit}</span>}
      {reveal && <span className="rounded-xl bg-mint px-3 py-1.5 font-semibold text-mint-dark">Đáp án đúng: {q.answer}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Components kéo thả / ghép**

`components/questions/order.tsx`:
```tsx
'use client';
import { Reorder } from 'motion/react';
import { useEffect } from 'react';
import type { OrderQuestion } from '@/lib/bank/types';
import { MathText } from './math-text';
import type { QuestionProps } from './types';

export function deterministicShuffle(n: number, seed: string): number[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n >= 2 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

export function OrderView({ question: q, value, onChange, disabled, reveal }: QuestionProps<OrderQuestion>) {
  const order = Array.isArray(value) && value.length === q.items.length ? (value as number[]) : null;
  useEffect(() => { if (!order) onChange(deterministicShuffle(q.items.length, q.id)); }, [order, q.id, q.items.length, onChange]);
  if (!order) return null;
  return (
    <Reorder.Group axis="y" values={order} onReorder={(v) => !disabled && onChange(v)} className="space-y-3">
      {order.map((itemIdx, pos) => {
        const ok = reveal ? itemIdx === q.answer[pos] : null;
        return (
          <Reorder.Item key={itemIdx} value={itemIdx} dragListener={!disabled}
            whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgb(184 192 255 / 0.6)' }}
            className={`flex cursor-grab items-center gap-4 rounded-2xl bg-white p-4 shadow-clay active:cursor-grabbing ${ok === true ? 'bg-mint' : ok === false ? 'bg-peach' : ''}`}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-lavender-soft font-display font-bold text-lavender-dark">{pos + 1}</span>
            <MathText text={q.items[itemIdx]} className="flex-1" />
            <span className="text-muted">⋮⋮</span>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}
```

`components/questions/match.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { MatchQuestion } from '@/lib/bank/types';
import { deterministicShuffle } from './order';
import type { QuestionProps } from './types';

const PAIR_COLORS = ['#a8b5ff', '#ff8a65', '#3ccf8e', '#ffd166', '#f472b6', '#22d3ee'];

export function MatchView({ question: q, value, onChange, disabled, reveal }: QuestionProps<MatchQuestion>) {
  const pairs = Array.isArray(value) && value.length === q.left.length ? (value as number[]) : q.left.map(() => -1);
  const [active, setActive] = useState<number | null>(null);
  const rightOrder = deterministicShuffle(q.right.length, q.id);
  const pairIndexOfRight = (r: number) => pairs.indexOf(r);

  const pickRight = (r: number) => {
    if (active === null) return;
    const next = pairs.map((p) => (p === r ? -1 : p));
    next[active] = r;
    onChange(next);
    setActive(null);
  };

  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-3">
      <div className="space-y-3">
        {q.left.map((l, i) => {
          const paired = pairs[i] !== -1;
          const ok = reveal ? pairs[i] === q.answer[i] : null;
          return (
            <motion.button key={l} type="button" disabled={disabled} whileTap={{ scale: 0.97 }} onClick={() => setActive(i)}
              style={paired && !reveal ? { boxShadow: `inset 6px 0 0 ${PAIR_COLORS[i % PAIR_COLORS.length]}` } : undefined}
              className={`w-full rounded-2xl bg-white p-4 text-left font-semibold shadow-clay ${active === i ? 'ring-2 ring-coral' : ''} ${ok === true ? 'bg-mint' : ok === false ? 'bg-peach' : ''}`}>
              {l}
            </motion.button>
          );
        })}
      </div>
      <div className="space-y-3">
        {rightOrder.map((r) => {
          const li = pairIndexOfRight(r);
          return (
            <motion.button key={q.right[r]} type="button" disabled={disabled || active === null} whileTap={{ scale: 0.97 }} onClick={() => pickRight(r)}
              style={li !== -1 && !reveal ? { boxShadow: `inset -6px 0 0 ${PAIR_COLORS[li % PAIR_COLORS.length]}` } : undefined}
              className={`w-full rounded-2xl bg-white p-4 text-left shadow-clay ${active !== null ? 'hover:ring-2 hover:ring-lavender' : ''}`}>
              {q.right[r]}
            </motion.button>
          );
        })}
      </div>
      {reveal && (
        <p className="col-span-2 text-sm text-muted">
          Đáp án: {q.left.map((l, i) => `${l} → ${q.right[q.answer[i]]}`).join(' · ')}
        </p>
      )}
    </div>
  );
}
```

Lưu ý: test match bấm `R2` mà không phụ thuộc thứ tự hiển thị, vì nút được tìm theo tên.

`components/questions/fill.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import type { FillQuestion } from '@/lib/bank/types';
import type { QuestionProps } from './types';

export function FillView({ question: q, value, onChange, disabled, reveal }: QuestionProps<FillQuestion>) {
  const segments = q.text.split('___');
  const blanks = Array.isArray(value) && value.length === q.answer.length ? (value as string[]) : q.answer.map(() => '');
  const place = (word: string, target?: number) => {
    const i = target ?? blanks.findIndex((b) => !b);
    if (i < 0) return;
    onChange(blanks.map((b, j) => (j === i ? word : b === word ? '' : b)));
  };
  const clear = (i: number) => onChange(blanks.map((b, j) => (j === i ? '' : b)));

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-white p-5 text-lg leading-[2.6] shadow-clay">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blanks.length && (
              <motion.button type="button" data-blank={i} disabled={disabled} onClick={() => clear(i)} layout
                className={`mx-1 inline-flex min-w-24 justify-center rounded-xl border-2 border-dashed px-3 py-0.5 align-middle font-semibold
                  ${blanks[i] ? 'border-solid border-lavender bg-lavender-soft text-lavender-dark' : 'border-lavender text-transparent'}
                  ${reveal ? (blanks[i].toLowerCase() === q.answer[i].toLowerCase() ? '!border-mint-dark !bg-mint !text-mint-dark' : '!border-peach-dark !bg-peach !text-peach-dark') : ''}`}>
                {blanks[i] || '____'}
              </motion.button>
            )}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-3">
        {q.bank.map((w) => {
          const used = blanks.includes(w);
          return (
            <motion.button key={w} type="button" disabled={disabled || used} drag={!disabled && !used} dragSnapToOrigin
              whileDrag={{ scale: 1.1, zIndex: 10 }}
              onDragEnd={(_, info) => {
                const el = document.elementFromPoint(info.point.x - window.scrollX, info.point.y - window.scrollY)?.closest('[data-blank]');
                if (el) place(w, Number(el.getAttribute('data-blank')));
              }}
              onClick={() => place(w)}
              className={`rounded-xl px-4 py-2 font-semibold shadow-clay ${used ? 'bg-lavender-soft text-muted opacity-50' : 'bg-white text-ink'}`}>
              {w}
            </motion.button>
          );
        })}
      </div>
      {reveal && <p className="text-sm text-muted">Đáp án: {q.answer.join(', ')}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Đồ thị, Nói, Viết**

`components/questions/graph.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useRef } from 'react';
import type { GraphPoint, GraphQuestion } from '@/lib/bank/types';
import type { QuestionProps } from './types';

const R = 5;          // trục từ -5 đến 5
const SIZE = 360;
const U = SIZE / (2 * R);
const toPx = (x: number, y: number) => ({ cx: SIZE / 2 + x * U, cy: SIZE / 2 - y * U });

export function GraphView({ question: q, value, onChange, disabled, reveal }: QuestionProps<GraphQuestion>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const p = (value as GraphPoint | null) ?? { x: 0, y: 0 };
  const setFromEvent = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = Math.round(((clientX - r.left) / r.width) * 2 * R - R);
    const y = Math.round(R - ((clientY - r.top) / r.height) * 2 * R);
    onChange({ x: Math.max(-R, Math.min(R, x)), y: Math.max(-R, Math.min(R, y)) });
  };
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);
  const { cx, cy } = toPx(p.x, p.y);
  const ans = toPx(q.answer.x, q.answer.y);
  return (
    <div className="flex items-start gap-6">
      <svg ref={svgRef} width={SIZE} height={SIZE} className="touch-none rounded-2xl bg-white shadow-clay"
        onPointerDown={(e) => { if (disabled) return; (e.target as Element).setPointerCapture?.(e.pointerId); setFromEvent(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (!disabled && e.buttons === 1) setFromEvent(e.clientX, e.clientY); }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toPx(t, 0).cx} y1={0} x2={toPx(t, 0).cx} y2={SIZE} stroke="#eef0ff" />
            <line x1={0} y1={toPx(0, t).cy} x2={SIZE} y2={toPx(0, t).cy} stroke="#eef0ff" />
          </g>
        ))}
        <line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke="#8b95e0" strokeWidth={1.5} />
        <line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke="#8b95e0" strokeWidth={1.5} />
        {q.lines.map((l, i) => {
          const a = toPx(-R, l.a * -R + l.b); const b = toPx(R, l.a * R + l.b);
          const color = i === 0 ? '#ff8a65' : '#7c83db';
          return (
            <g key={l.label}>
              <motion.line x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke={color} strokeWidth={3} strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: i * 0.3 }} />
              <text x={toPx(3.2, l.a * 3.2 + l.b).cx + 6} y={toPx(3.2, l.a * 3.2 + l.b).cy - 6} fill={color} fontWeight={700}>{l.label}</text>
            </g>
          );
        })}
        {reveal && <circle cx={ans.cx} cy={ans.cy} r={12} fill="none" stroke="#1f8a57" strokeWidth={3} strokeDasharray="4 3" />}
        <motion.circle r={9} fill="#ff8a65" stroke="#fff" strokeWidth={3} animate={{ cx, cy }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }} style={{ cursor: disabled ? 'default' : 'grab' }} />
      </svg>
      <div className="rounded-2xl bg-white p-4 shadow-clay">
        <p className="text-sm text-muted">Điểm đang chọn</p>
        <p className="font-display text-2xl font-extrabold">({p.x}; {p.y})</p>
        <p className="mt-2 text-xs text-muted">Bấm hoặc kéo trên lưới để di chuyển điểm</p>
      </div>
    </div>
  );
}
```

`components/questions/speak.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import type { SpeakAnswer, SpeakQuestion } from '@/lib/bank/types';
import { speak } from './mcq';
import type { QuestionProps } from './types';

export function SpeakView({ question: q, value, onChange, disabled }: QuestionProps<SpeakQuestion>) {
  const [recording, setRecording] = useState(false);
  const start = useRef(0);
  const rec = useRef<MediaRecorder | null>(null);
  const done = (value as SpeakAnswer | null)?.durationMs;

  const begin = async () => {
    start.current = Date.now();
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      rec.current = new MediaRecorder(stream);
      rec.current.start();
    } catch { rec.current = null; /* không có mic: vẫn mô phỏng theo thời gian bấm giữ */ }
  };
  const end = () => {
    if (!recording) return;
    setRecording(false);
    rec.current?.stop();
    rec.current?.stream.getTracks().forEach((t) => t.stop());
    onChange({ durationMs: Date.now() - start.current });
  };

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-white p-5 font-display text-2xl font-semibold shadow-clay">“{q.target}”</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => speak(q.target)} className="rounded-2xl bg-lavender-soft px-4 py-3 font-semibold text-lavender-dark">🔊 Nghe mẫu</button>
        <motion.button type="button" disabled={disabled}
          onPointerDown={begin} onPointerUp={end} onPointerLeave={end}
          animate={recording ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ repeat: recording ? Infinity : 0, duration: 0.8 }}
          className={`flex items-center gap-3 rounded-2xl px-6 py-3 font-bold text-white shadow-[0_6px_0_var(--color-coral-dark)] ${recording ? 'bg-peach-dark' : 'bg-coral'}`}>
          🎙️ {recording ? 'Đang ghi… thả ra để dừng' : 'Nhấn giữ để nói'}
        </motion.button>
        {recording && (
          <div className="flex h-10 items-end gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.span key={i} className="w-1.5 rounded-full bg-coral" animate={{ height: [6, 30, 10, 24, 6] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.06 }} />
            ))}
          </div>
        )}
        {done !== undefined && !recording && <span className="text-sm text-muted">Đã ghi {(done / 1000).toFixed(1)} giây</span>}
      </div>
    </div>
  );
}
```

`components/questions/write.tsx`:
```tsx
'use client';
import type { WriteQuestion } from '@/lib/bank/types';
import { countWords } from '@/lib/bank/simulate';
import type { QuestionProps } from './types';

export function WriteView({ question: q, value, onChange, disabled }: QuestionProps<WriteQuestion>) {
  const text = typeof value === 'string' ? value : '';
  const n = countWords(text);
  return (
    <div className="space-y-3">
      <p className="font-semibold">{q.prompt}</p>
      <textarea aria-label="Bài viết" value={text} disabled={disabled} onChange={(e) => onChange(e.target.value)} rows={7}
        className="w-full rounded-2xl border-2 border-lavender-soft bg-white p-4 text-base leading-relaxed outline-none focus:border-lavender" />
      <p className={`text-right text-sm font-semibold ${n >= q.minWords ? 'text-mint-dark' : 'text-muted'}`}>{n} / {q.minWords} từ</p>
    </div>
  );
}
```

`components/questions/feedback-extras.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import type { SpeakQuestion, WriteQuestion } from '@/lib/bank/types';
import { simulateSpeakingScore, simulateWritingRubric } from '@/lib/bank/simulate';
import { ProgressBar } from '@/components/ui/progress-bar';

export function SpeakFeedback({ question, durationMs }: { question: SpeakQuestion; durationMs: number }) {
  const s = simulateSpeakingScore(question.target, durationMs);
  return (
    <div className="space-y-2">
      <p className="font-semibold">AI chấm phát âm: <span className="font-display text-2xl text-coral">{s.overall}</span>/100</p>
      <div className="flex flex-wrap gap-1.5">
        {s.words.map((w, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-lg px-2 py-1 text-sm font-semibold ${w.ok ? 'bg-mint text-mint-dark' : 'bg-peach text-peach-dark'}`}>{w.word}</motion.span>
        ))}
      </div>
    </div>
  );
}

export function WritingFeedback({ question, text }: { question: WriteQuestion; text: string }) {
  const r = simulateWritingRubric(text, question.minWords);
  return (
    <div className="space-y-3">
      <p className="font-semibold">AI chấm bài viết: <span className="font-display text-2xl text-coral">{r.total}</span>/10</p>
      {r.criteria.map((c) => (
        <div key={c.name}>
          <div className="flex justify-between text-sm"><span className="font-semibold">{c.name}</span><span>{c.score}/{c.max}</span></div>
          <ProgressBar value={c.score / c.max} color="mint" className="my-1" />
          <p className="text-xs text-muted">{c.comment}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: QuestionView**

`components/questions/question-view.tsx`:
```tsx
'use client';
import type { AnswerValue, Question } from '@/lib/bank/types';
import { skillName } from '@/lib/bank';
import { LevelPill } from '@/components/ui/level-pill';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { MathText } from './math-text';
import { McqView } from './mcq';
import { MultiView } from './multi';
import { Tf4View } from './tf4';
import { ShortView } from './short';
import { OrderView } from './order';
import { MatchView } from './match';
import { FillView } from './fill';
import { GraphView } from './graph';
import { SpeakView } from './speak';
import { WriteView } from './write';

interface Props {
  question: Question; value: AnswerValue; onChange: (v: AnswerValue) => void;
  disabled: boolean; reveal: boolean; index?: number; showMeta?: boolean;
}

export function QuestionView({ question: q, index, showMeta = true, ...p }: Props) {
  const body = (() => {
    switch (q.type) {
      case 'mcq': case 'listen': return <McqView question={q} {...p} />;
      case 'multi': return <MultiView question={q} {...p} />;
      case 'tf4': return <Tf4View question={q} {...p} />;
      case 'short': return <ShortView question={q} {...p} />;
      case 'order': return <OrderView question={q} {...p} />;
      case 'match': return <MatchView question={q} {...p} />;
      case 'fill': return <FillView question={q} {...p} />;
      case 'graph': return <GraphView question={q} {...p} />;
      case 'speak': return <SpeakView question={q} {...p} />;
      case 'write': return <WriteView question={q} {...p} />;
    }
  })();
  return (
    <div className="space-y-5">
      {showMeta && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {index !== undefined && <span className="font-display font-extrabold text-coral">Câu {index}</span>}
          <LevelPill level={q.level} />
          <span className="text-muted">{skillName(q.skillId)}</span>
          <NxbBadge className="ml-auto" />
        </div>
      )}
      <h2 className="text-xl font-semibold leading-relaxed"><MathText text={q.content} /></h2>
      {body}
    </div>
  );
}
```

- [ ] **Step 7: Dev preview page**

`app/dev/questions/page.tsx`: hiển thị **mỗi dạng một câu thật** lấy từ bank (`ALL_QUESTIONS.find((q) => q.type === t)` với mỗi `t` trong 11 dạng), có nút "Kiểm tra" chuyển `reveal`:
```tsx
'use client';
import { useState } from 'react';
import { ALL_QUESTIONS } from '@/lib/bank';
import type { AnswerValue, QuestionType } from '@/lib/bank/types';
import { QuestionView } from '@/components/questions/question-view';
import { ClayCard } from '@/components/ui/clay-card';
import { ClayButton } from '@/components/ui/clay-button';
import { checkAnswer } from '@/lib/bank/check';

const TYPES: QuestionType[] = ['mcq', 'multi', 'tf4', 'short', 'order', 'match', 'fill', 'graph', 'listen', 'speak', 'write'];

export default function QuestionsDev() {
  const [vals, setVals] = useState<Record<string, AnswerValue>>({});
  const [rev, setRev] = useState<Record<string, boolean>>({});
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-10">
      {TYPES.map((t) => {
        const q = ALL_QUESTIONS.find((x) => x.type === t);
        if (!q) return <p key={t}>Thiếu dạng {t}</p>;
        return (
          <ClayCard key={t} className="space-y-4">
            <p className="font-mono text-xs text-muted">{t}</p>
            <QuestionView question={q} value={vals[q.id] ?? null} onChange={(v) => setVals((s) => ({ ...s, [q.id]: v }))} disabled={!!rev[q.id]} reveal={!!rev[q.id]} />
            <ClayButton onClick={() => setRev((s) => ({ ...s, [q.id]: !s[q.id] }))}>Kiểm tra</ClayButton>
            {rev[q.id] && <p>{JSON.stringify(checkAnswer(q, vals[q.id] ?? null))}</p>}
          </ClayCard>
        );
      })}
    </main>
  );
}
```

- [ ] **Step 8: Verify & commit**

Run: `npm test && npm run typecheck`. Sau đó `npm run dev`, mở `/dev/questions` và thử **tay** đủ 11 dạng: kéo thả order, kéo chip vào chỗ trống, ghép cặp, kéo điểm đồ thị, nhập `5/2` ở MathLive, ghi âm (hoặc nhấn giữ khi không có mic), nghe TTS. Bấm "Kiểm tra" và xác nhận kết quả đúng/sai hợp lý.

```bash
git add -A && git commit -m "feat(questions): 11 interactive question types with shared QuestionView"
```

---

### Task 10: PracticeRunner + trang Luyện tập (Ngân hàng đề)

**Files:**
- Create: `components/session/practice-runner.tsx`, `app/(app)/luyen-tap/page.tsx`, `app/(app)/luyen-tap/[id]/page.tsx`
- Test: `tests/components/practice-runner.test.tsx`

**Interfaces:**
- Consumes: `QuestionView`, `checkAnswer`, `Owl`, `OwlBubble`, `fireConfetti`, `useDemo().recordAnswer`, `practiceSetsFor`, `getPracticeSet`, `chaptersFor`, `skillsFor`, `chapterCount`, `BANK_TOTAL`.
- Produces:
  - `interface RunnerOutcome { xp: number; combo: number; newBadges: BadgeId[]; message?: string }`
  - `<PracticeRunner next={() => Question | null} onAnswered={(q, result: CheckResult) => RunnerOutcome} maxQuestions={number} title={string} onExit={() => void} aside?={ReactNode} />`
  - Hiển thị: thanh tiến độ, Bé Cú + bong bóng, chip combo, "+XP" bay lên, nút Gợi ý (mở lần lượt `hints`), nút Kiểm tra / Tiếp tục, panel phản hồi (đúng: mint, sai: peach) với "🤖 AI giải thích" (Typewriter nội dung `explanation`), màn kết thúc (confetti, số câu đúng, XP, nút Luyện tiếp / Thoát).
  - Kết thúc khi đủ `maxQuestions` **hoặc** `next()` trả `null` (Review Focus #3).

- [ ] **Step 1: Test (failing)**

`tests/components/practice-runner.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeRunner } from '@/components/session/practice-runner';
import type { Question } from '@/lib/bank/types';

vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));

const mk = (id: string): Question => ({ id, subject: 'toan', grade: 9, skillId: 't9-bpt', level: 'TH', b: 0, source: 'NXB',
  content: `Đề ${id}`, explanation: `Giải ${id}`, hints: ['Gợi ý 1'], type: 'mcq', options: ['Đúng', 'Sai'], answer: 0 });

describe('PracticeRunner', () => {
  it('answers, shows feedback, advances and finishes at maxQuestions', async () => {
    const qs = [mk('a'), mk('b'), mk('c')];
    let i = 0;
    const onAnswered = vi.fn(() => ({ xp: 10, combo: 1, newBadges: [] }));
    render(<PracticeRunner title="T" maxQuestions={2} next={() => qs[i++] ?? null} onAnswered={onAnswered} onExit={() => {}} />);
    expect(screen.getByText('Đề a')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(onAnswered).toHaveBeenCalledWith(qs[0], { correct: true, fraction: 1 });
    expect(await screen.findByText(/Chính xác/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(screen.getByText('Đề b')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Sai/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByText(/Hoàn thành phiên/)).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });
  it('finishes gracefully when next() runs out', async () => {
    render(<PracticeRunner title="T" maxQuestions={10} next={() => null} onAnswered={() => ({ xp: 0, combo: 0, newBadges: [] })} onExit={() => {}} />);
    expect(await screen.findByText(/Hoàn thành phiên/)).toBeInTheDocument();
  });
  it('Kiểm tra disabled until answered; hints reveal', async () => {
    render(<PracticeRunner title="T" maxQuestions={1} next={() => mk('a')} onAnswered={() => ({ xp: 0, combo: 0, newBadges: [] })} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Gợi ý/ }));
    expect(screen.getByText('Gợi ý 1')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement PracticeRunner**

`components/session/practice-runner.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AnswerValue, Question, SpeakAnswer } from '@/lib/bank/types';
import { checkAnswer, type CheckResult } from '@/lib/bank/check';
import type { BadgeId } from '@/lib/engine/gamification';
import { BADGES } from '@/lib/engine/gamification';
import { isAnswered } from '@/lib/engine/exam';
import { QuestionView } from '@/components/questions/question-view';
import { SpeakFeedback, WritingFeedback } from '@/components/questions/feedback-extras';
import { MathText } from '@/components/questions/math-text';
import { Owl, type OwlState } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Typewriter } from '@/components/ui/typewriter';
import { fireConfetti } from '@/lib/ui/confetti';
import { toast } from 'sonner';

export interface RunnerOutcome { xp: number; combo: number; newBadges: BadgeId[]; message?: string }
interface Props {
  title: string; maxQuestions: number; next: () => Question | null;
  onAnswered: (q: Question, r: CheckResult) => RunnerOutcome; onExit: () => void; aside?: ReactNode;
}

const PRAISE = ['Chính xác! 🎉', 'Tuyệt vời!', 'Giỏi quá!', 'Chuẩn luôn!'];
const ENCOURAGE = ['Gần đúng rồi, xem lời giải nhé!', 'Không sao, sai là để học!', 'Thử nghĩ theo gợi ý nhé!'];

export function PracticeRunner({ title, maxQuestions, next, onAnswered, onExit, aside }: Props) {
  const [q, setQ] = useState<Question | null>(null);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState<AnswerValue>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [outcome, setOutcome] = useState<RunnerOutcome | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [stats, setStats] = useState({ correct: 0, xp: 0 });
  const [owl, setOwl] = useState<OwlState>('idle');
  const started = useRef(false);

  const advance = useCallback(() => {
    if (count >= maxQuestions) { setDone(true); return; }
    const n = next();
    if (!n) { setDone(true); return; }
    setQ(n); setValue(null); setResult(null); setOutcome(null); setHintsShown(0); setOwl('idle');
  }, [count, maxQuestions, next]);

  useEffect(() => { if (!started.current) { started.current = true; advance(); } }, [advance]);
  useEffect(() => {
    if (done) { setOwl('celebrate'); fireConfetti(); }
  }, [done]);

  const check = () => {
    if (!q) return;
    const r = checkAnswer(q, value);
    const o = onAnswered(q, r);
    setResult(r); setOutcome(o); setCount((c) => c + 1);
    setStats((s) => ({ correct: s.correct + (r.correct ? 1 : 0), xp: s.xp + o.xp }));
    setOwl(r.correct ? (o.combo >= 3 ? 'celebrate' : 'correct') : 'wrong');
    if (r.correct && o.combo >= 3) fireConfetti({ origin: { x: 0.2, y: 0.4 } });
    o.newBadges.forEach((b) => toast(`${BADGES[b].icon} Huy hiệu mới: ${BADGES[b].name}`));
  };

  if (done) {
    return (
      <ClayCard className="mx-auto max-w-xl space-y-5 p-10 text-center">
        <div className="flex justify-center"><Owl state={owl} size={160} /></div>
        <h2 className="text-3xl font-extrabold">Hoàn thành phiên! 🎉</h2>
        <div className="flex justify-center gap-8 text-lg">
          <div><p className="font-display text-4xl font-extrabold text-mint-dark">{stats.correct}/{count}</p><p className="text-muted">câu đúng</p></div>
          <div><p className="font-display text-4xl font-extrabold text-coral">+{stats.xp}</p><p className="text-muted">XP</p></div>
        </div>
        <ClayButton onClick={onExit} size="lg">Hoàn tất</ClayButton>
      </ClayCard>
    );
  }
  if (!q) return null;

  const owlText = result ? (result.correct ? PRAISE[count % PRAISE.length] : ENCOURAGE[count % ENCOURAGE.length]) : hintsShown ? 'Đọc gợi ý thử xem!' : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onExit} aria-label="Thoát" className="text-2xl text-muted hover:text-ink">✕</button>
          <ProgressBar value={count / maxQuestions} color="coral" className="flex-1" />
          <span className="text-sm font-bold text-muted">{title}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <ClayCard className="p-8">
              <QuestionView question={q} index={count + (result ? 0 : 1)} value={value} onChange={setValue} disabled={!!result} reveal={!!result} />
              {hintsShown > 0 && !result && (
                <div className="mt-5 space-y-2">
                  {q.hints.slice(0, hintsShown).map((h) => (
                    <motion.p key={h} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#fff8e1] px-4 py-2 text-sm">💡 <MathText text={h} /></motion.p>
                  ))}
                </div>
              )}
            </ClayCard>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className={`rounded-[var(--radius-clay)] p-6 ${result.correct ? 'bg-mint' : 'bg-peach'}`}>
              <p className={`font-display text-xl font-extrabold ${result.correct ? 'text-mint-dark' : 'text-peach-dark'}`}>
                {result.correct ? 'Chính xác!' : result.fraction > 0 ? `Đúng một phần (${Math.round(result.fraction * 100)}%)` : 'Chưa đúng'}
                {outcome && outcome.xp > 0 && <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ml-3 text-coral">+{outcome.xp} XP</motion.span>}
              </p>
              {q.type === 'speak' && <div className="mt-3"><SpeakFeedback question={q} durationMs={(value as SpeakAnswer | null)?.durationMs ?? 0} /></div>}
              {q.type === 'write' && <div className="mt-3"><WritingFeedback question={q} text={String(value ?? '')} /></div>}
              <p className="mt-3 text-sm font-semibold">🤖 AI giải thích</p>
              <p className="mt-1 leading-relaxed"><Typewriter text={q.explanation} speed={12} /></p>
              {outcome?.message && <p className="mt-3 font-semibold text-mint-dark">{outcome.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <ClayButton variant="ghost" disabled={!!result || hintsShown >= q.hints.length} onClick={() => setHintsShown((h) => h + 1)}>
            💡 Gợi ý {q.hints.length ? `(${hintsShown}/${q.hints.length})` : ''}
          </ClayButton>
          {result
            ? <ClayButton size="lg" variant={result.correct ? 'mint' : 'primary'} onClick={advance}>Tiếp tục</ClayButton>
            : <ClayButton size="lg" disabled={!isAnswered(value)} onClick={check}>Kiểm tra</ClayButton>}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <OwlBubble text={owlText} />
          <Owl state={owl} size={150} />
          {outcome && outcome.combo >= 2 && (
            <motion.span key={outcome.combo} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="rounded-full bg-coral px-4 py-1.5 font-display font-extrabold text-white">
              🔥 Combo x{outcome.combo}
            </motion.span>
          )}
        </div>
        {aside}
      </aside>
    </div>
  );
}
```

Lưu ý: test dùng `getByRole('button', { name: /Đúng/ })` cho phương án "Đúng" — chuỗi praise "Chính xác!" không trùng. Nếu trùng do nút "Đúng" của tf4 thì không ảnh hưởng vì câu test là mcq.

- [ ] **Step 3: Trang `/luyen-tap`**

`app/(app)/luyen-tap/page.tsx`:
```tsx
'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useDemo } from '@/lib/store/demo-store';
import { BANK_TOTAL, chapterCount, chaptersFor, skillsFor } from '@/lib/bank';
import { practiceSetsFor } from '@/lib/bank/practice-sets';
import { SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { ClayCard } from '@/components/ui/clay-card';
import { TiltCard } from '@/components/ui/tilt-card';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { CountUp } from '@/components/ui/count-up';

export default function LuyenTapPage() {
  const router = useRouter();
  const grade = useDemo((s) => s.profile.grade);
  const [subject, setSubject] = useState<Subject>('toan');
  const chapters = chaptersFor(subject, grade);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const sets = practiceSetsFor(subject, grade).filter((s) => !openChapter || s.chapterId === openChapter || s.chapterId === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Ngân hàng đề</h1>
          <p className="mt-1 text-muted"><b className="text-ink"><CountUp value={BANK_TOTAL} /></b> câu hỏi · Chuẩn chương trình GDPT 2018 · <NxbBadge /></p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-clay">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => { setSubject(s); setOpenChapter(null); }} className="relative rounded-xl px-5 py-2 font-semibold">
              {subject === s && <motion.span layoutId="subject-pill" className={`absolute inset-0 rounded-xl ${s === 'toan' ? 'bg-lavender' : 'bg-coral'}`} />}
              <span className={`relative ${subject === s ? 'text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ClayCard className="h-fit space-y-1 p-3">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted">Lớp {grade} › Chương › Bài › Kiến thức</p>
          {chapters.map((ch) => {
            const open = openChapter === ch.id;
            return (
              <div key={ch.id}>
                <button type="button" onClick={() => setOpenChapter(open ? null : ch.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold ${open ? 'bg-lavender-soft' : 'hover:bg-cream'}`}>
                  <motion.span animate={{ rotate: open ? 90 : 0 }}>›</motion.span>
                  <span className="flex-1">{ch.name}</span>
                  <span className="text-xs text-muted">{chapterCount(ch.id).toLocaleString('vi-VN')}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7">
                      {ch.lessons.map((l) => (
                        <div key={l.id} className="py-1">
                          <p className="text-sm font-medium">{l.name}</p>
                          {skillsFor(subject, grade).filter((s) => s.lessonId === l.id).map((s) => (
                            <p key={s.id} className="flex justify-between py-0.5 pl-3 text-xs text-muted"><span>• {s.name}</span><span>{s.bankCount} câu</span></p>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </ClayCard>

        <div className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sets.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TiltCard onClick={() => router.push(`/luyen-tap/${s.id}`)} className="flex h-full flex-col gap-3">
                <span className={`w-fit rounded-xl px-3 py-1 text-xs font-bold ${s.chapterId ? 'bg-lavender-soft text-lavender-dark' : 'bg-peach text-peach-dark'}`}>{s.subtitle}</span>
                <h3 className="flex-1 text-lg font-bold leading-snug">{s.title}</h3>
                <div className="flex items-center justify-between text-sm"><NxbBadge /><span className="font-bold text-coral">Luyện ngay →</span></div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Trang `/luyen-tap/[id]`**

`app/(app)/luyen-tap/[id]/page.tsx`:
```tsx
'use client';
import { use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPracticeSet } from '@/lib/bank/practice-sets';
import { getQuestion } from '@/lib/bank';
import { useDemo } from '@/lib/store/demo-store';
import { PracticeRunner } from '@/components/session/practice-runner';
import { ClayCard } from '@/components/ui/clay-card';
import type { Question } from '@/lib/bank/types';

export default function PracticeSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const set = getPracticeSet(id);
  const recordAnswer = useDemo((s) => s.recordAnswer);
  const idx = useRef(0);
  if (!set) return <ClayCard className="p-10 text-center">Không tìm thấy bộ đề.</ClayCard>;
  const questions = set.questionIds.map(getQuestion).filter(Boolean) as Question[];
  return (
    <PracticeRunner
      title={set.title}
      maxQuestions={questions.length}
      next={() => questions[idx.current++] ?? null}
      onAnswered={(q, r) => recordAnswer(set.subject, q, r.correct)}
      onExit={() => router.push('/luyen-tap')}
    />
  );
}
```

- [ ] **Step 5: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay: `/luyen-tap`, đổi môn (pill trượt), mở cây chương, bấm một bộ → làm 10 câu → màn kết thúc có confetti; XP trên header tăng.

```bash
git add -A && git commit -m "feat(practice): practice runner with owl feedback, bank browser, practice sets"
```

---

### Task 11: AI đánh giá năng lực (`/danh-gia`)

**Files:**
- Create: `components/assessment/difficulty-meter.tsx`, `components/charts/skill-radar.tsx`, `app/(app)/danh-gia/page.tsx`
- Test: `tests/components/assessment-page.test.tsx`

**Interfaces:**
- Consumes: `nextAssessmentQuestion`, `recordAssessmentAnswer`, `currentTheta`, `summarizeAssessment`, `aiComment`, `ASSESSMENT_LENGTH`, `useDemo().saveAssessment`, `assessments[zoneKey]`, `skillsFor`, `questionsFor`, `skillName`, `checkAnswer`.
- Produces: `<DifficultyMeter theta={number} />`, `<SkillRadar data={{ name: string; score: number }[]} color? />`. Trang gồm 4 pha: `intro` → `running` (không hiện đúng/sai, chỉ có thanh độ khó dịch chuyển, Bé Cú "thinking") → `analyzing` (~2.4s, checklist 3 bước) → `report`.

- [ ] **Step 1: Test (failing)**

`tests/components/assessment-page.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));
vi.mock('@/components/charts/skill-radar', () => ({ SkillRadar: () => <div>radar</div> }));

import DanhGiaPage from '@/app/(app)/danh-gia/page';
import { useDemo, zoneKey } from '@/lib/store/demo-store';

beforeEach(() => useDemo.getState().resetDemo());

describe('Assessment page', () => {
  it('runs 12 adaptive questions then shows report and saves it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DanhGiaPage />);
    await user.click(screen.getByRole('button', { name: /Bắt đầu đánh giá Toán/ }));
    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`${i + 1}/12`)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));
    }
    expect(screen.getByText(/AI đang phân tích/)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(await screen.findByText(/Báo cáo năng lực/)).toBeInTheDocument();
    expect(useDemo.getState().assessments[zoneKey('toan', 9)]).toBeDefined();
    vi.useRealTimers();
  });
});
```

Ghi chú: nút "Bỏ qua câu này" ghi nhận là trả lời sai (học sinh không biết làm). Đây cũng là tính năng thật của bài đánh giá, không chỉ để test.

- [ ] **Step 2: DifficultyMeter & SkillRadar**

`components/assessment/difficulty-meter.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { LEVELS, LEVEL_LABEL } from '@/lib/bank/types';

export function DifficultyMeter({ theta }: { theta: number }) {
  const pct = Math.max(0, Math.min(1, (theta + 3) / 6)) * 100;
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Độ khó đang điều chỉnh theo em</p>
      <div className="relative h-4 rounded-full" style={{ background: 'linear-gradient(90deg,#c9f2dc,#eef0ff,#fff1d6,#ffe1d9)' }}>
        <motion.div className="absolute -top-2 h-8 w-8 -translate-x-1/2 rounded-full border-4 border-white bg-coral shadow-clay"
          animate={{ left: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} />
      </div>
      <div className="flex justify-between text-xs text-muted">{LEVELS.map((l) => <span key={l}>{LEVEL_LABEL[l]}</span>)}</div>
    </div>
  );
}
```

`components/charts/skill-radar.tsx`:
```tsx
'use client';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

export function SkillRadar({ data, color = '#a8b5ff' }: { data: { name: string; score: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e3e6ff" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6f8a' }} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.45} isAnimationActive animationDuration={1200} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Trang `/danh-gia`**

`app/(app)/danh-gia/page.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { questionsFor, skillName, skillsFor } from '@/lib/bank';
import { checkAnswer } from '@/lib/bank/check';
import { SUBJECT_LABEL, type AnswerValue, type Question, type Subject } from '@/lib/bank/types';
import {
  ASSESSMENT_LENGTH, aiComment, currentTheta, emptyAssessment, nextAssessmentQuestion, recordAssessmentAnswer,
  summarizeAssessment, type AssessmentState, type AssessmentSummary,
} from '@/lib/engine/assessment';
import { BADGES } from '@/lib/engine/gamification';
import { isAnswered } from '@/lib/engine/exam';
import { QuestionView } from '@/components/questions/question-view';
import { DifficultyMeter } from '@/components/assessment/difficulty-meter';
import { SkillRadar } from '@/components/charts/skill-radar';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Typewriter } from '@/components/ui/typewriter';
import { fireConfetti } from '@/lib/ui/confetti';

type Phase = 'intro' | 'running' | 'analyzing' | 'report';
const STEPS = ['Ước lượng năng lực theo từng kiến thức…', 'Đối chiếu khung chương trình GDPT 2018…', 'Xây dựng Learning Zone cho em…'];

export default function DanhGiaPage() {
  const router = useRouter();
  const { profile, assessments, saveAssessment } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<AssessmentState>(emptyAssessment());
  const [q, setQ] = useState<Question | null>(null);
  const [value, setValue] = useState<AnswerValue>(null);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [step, setStep] = useState(0);
  const pool = useMemo(() => questionsFor(subject, grade), [subject, grade]);
  const skills = useMemo(() => skillsFor(subject, grade), [subject, grade]);
  const existing = assessments[zoneKey(subject, grade)];

  const start = () => {
    const s = emptyAssessment();
    setState(s); setQ(nextAssessmentQuestion(pool, skills, s)); setValue(null); setPhase('running');
  };
  const answer = (correct: boolean) => {
    if (!q) return;
    const s = recordAssessmentAnswer(state, q, correct);
    setState(s); setValue(null);
    const n = nextAssessmentQuestion(pool, skills, s);
    if (n) { setQ(n); return; }
    const sum = summarizeAssessment(s, skills, { subject, grade });
    setSummary(sum); setPhase('analyzing');
    saveAssessment(sum).forEach((b) => toast(`${BADGES[b].icon} Huy hiệu mới: ${BADGES[b].name}`));
  };

  useEffect(() => {
    if (phase !== 'analyzing') return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1600);
    const t3 = setTimeout(() => { setPhase('report'); fireConfetti(); }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  if (phase === 'intro') {
    return (
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <span className="rounded-full bg-lavender-soft px-3 py-1 text-sm font-bold text-lavender-dark">🤖 AI đánh giá năng lực</span>
          <h1 className="text-4xl font-extrabold leading-tight">Chỉ {ASSESSMENT_LENGTH} câu, AI hiểu em đang ở đâu</h1>
          <p className="text-lg text-muted">Câu hỏi tự điều chỉnh độ khó theo từng câu trả lời. Kết quả là bản đồ năng lực theo từng kiến thức và Learning Zone dành riêng cho em.</p>
          <div className="flex rounded-2xl bg-white p-1 shadow-clay w-fit">
            {(['toan', 'anh'] as Subject[]).map((s) => (
              <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-5 py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <ClayButton size="lg" onClick={start} disabled={pool.length === 0}>Bắt đầu đánh giá {SUBJECT_LABEL[subject]}</ClayButton>
            {existing && <ClayButton size="lg" variant="ghost" onClick={() => { setSummary(existing); setPhase('report'); }}>Xem báo cáo gần nhất</ClayButton>}
          </div>
        </div>
        <div className="flex justify-center"><Owl state="cheer" size={260} /></div>
      </div>
    );
  }

  if (phase === 'running' && q) {
    const n = state.asked.length + 1;
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <ProgressBar value={state.asked.length / ASSESSMENT_LENGTH} className="flex-1" />
            <span className="font-display font-bold">{n}/{ASSESSMENT_LENGTH}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <ClayCard className="p-8"><QuestionView question={q} value={value} onChange={setValue} disabled={false} reveal={false} index={n} /></ClayCard>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between">
            <ClayButton variant="ghost" onClick={() => answer(false)}>Bỏ qua câu này</ClayButton>
            <ClayButton size="lg" disabled={!isAnswered(value)} onClick={() => answer(checkAnswer(q, value).correct)}>Trả lời</ClayButton>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="flex justify-center"><Owl state="thinking" size={140} /></div>
          <ClayCard><DifficultyMeter theta={currentTheta(state)} /></ClayCard>
          <p className="text-center text-sm text-muted">Bài đánh giá không hiện đúng/sai từng câu để kết quả khách quan nhất.</p>
        </aside>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <ClayCard className="mx-auto max-w-lg space-y-6 p-10 text-center">
        <div className="flex justify-center"><Owl state="thinking" size={150} /></div>
        <h2 className="text-2xl font-extrabold">AI đang phân tích bài làm…</h2>
        <ul className="space-y-3 text-left">
          {STEPS.map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0.3 }} animate={{ opacity: i <= step ? 1 : 0.3 }} className="flex items-center gap-3">
              <motion.span animate={{ scale: i < step ? 1 : [1, 1.2, 1] }} transition={{ repeat: i === step ? Infinity : 0, duration: 0.8 }}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm ${i < step ? 'bg-mint-dark text-white' : 'bg-lavender-soft'}`}>{i < step ? '✓' : '•'}</motion.span>
              {s}
            </motion.li>
          ))}
        </ul>
      </ClayCard>
    );
  }

  if (phase === 'report' && summary) {
    const radar = summary.skills.map((r) => ({ name: skillName(r.skillId), score: r.score }));
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold">Báo cáo năng lực · {SUBJECT_LABEL[summary.subject]} {summary.grade}</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <ClayCard className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-muted">Năng lực tổng thể</p>
            <p className="font-display text-6xl font-extrabold text-coral"><CountUp value={summary.score} /></p>
            <span className="rounded-full bg-lavender-soft px-4 py-1 font-bold text-lavender-dark">{summary.label}</span>
          </ClayCard>
          <ClayCard className="lg:col-span-2"><SkillRadar data={radar} /></ClayCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ClayCard className="space-y-3">
            <p className="font-bold">💪 Điểm mạnh</p>
            <div className="flex flex-wrap gap-2">{summary.strengths.map((s) => <span key={s} className="rounded-xl bg-mint px-3 py-1.5 font-semibold text-mint-dark">{skillName(s)}</span>)}</div>
            <p className="pt-2 font-bold">🎯 Cần tập trung</p>
            <div className="flex flex-wrap gap-2">{summary.weaknesses.map((s) => <span key={s} className="rounded-xl bg-peach px-3 py-1.5 font-semibold text-peach-dark">{skillName(s)}</span>)}</div>
          </ClayCard>
          <ClayCard className="flex gap-4">
            <Owl state="cheer" size={90} />
            <div>
              <p className="font-bold">🤖 Nhận xét của AI</p>
              <p className="mt-2 leading-relaxed"><Typewriter text={aiComment(summary, profile.name, skillName)} /></p>
            </div>
          </ClayCard>
        </div>
        <div className="flex gap-3">
          <ClayButton size="lg" onClick={() => router.push('/learning-zone')}>Vào Learning Zone →</ClayButton>
          <ClayButton size="lg" variant="ghost" onClick={() => setPhase('intro')}>Làm lại</ClayButton>
        </div>
      </div>
    );
  }
  return null;
}
```

- [ ] **Step 4: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay: trả lời đúng liên tục thì marker độ khó dịch sang phải; trả lời sai thì dịch trái; màn phân tích chạy khoảng 2.4 giây; báo cáo có radar vẽ dần và nhận xét gõ chữ.

```bash
git add -A && git commit -m "feat(assessment): adaptive AI assessment flow with analysis and report"
```

---

### Task 12: Learning Zone (`/learning-zone`) + ZoneRings

**Files:**
- Create: `components/zone/zone-rings.tsx`, `app/(app)/learning-zone/page.tsx`
- Test: `tests/components/zone-rings.test.tsx`

**Interfaces:**
- Consumes: `skillZone`, `zoneExtent`, `pickNextQuestion`, `applyAnswer`, `ZoneMap`, `ZoneEvent`, `useDemo().{ensureZone, setZone, recordAnswer, awardBadge, zones, assessments}`, `PracticeRunner`, `skillsFor`, `questionsFor`, `skillName`.
- Produces: `<ZoneRings skills map size? showLabels? highlight?={string} />`: 3 vòng (Đã thành thạo · Learning Zone · Quá sức), kiến thức là các chấm; bán kính vòng xanh = f(`zoneExtent`) và chuyển động spring khi map thay đổi; `data-extent` trên vòng xanh để test.

- [ ] **Step 1: Test (failing)**

`tests/components/zone-rings.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoneRings } from '@/components/zone/zone-rings';
import { makeSkill } from '../fixtures';

const skills = [makeSkill('A'), makeSkill('B', ['A'])];

describe('ZoneRings', () => {
  it('renders one dot per skill with zone label', () => {
    render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'TH' } }} showLabels />);
    expect(screen.getByTestId('dot-A')).toHaveAttribute('data-zone', 'learning');
    expect(screen.getByTestId('dot-B')).toHaveAttribute('data-zone', 'challenge');
    expect(screen.getByText('Skill A')).toBeInTheDocument();
  });
  it('learning ring grows with extent', () => {
    const { rerender } = render(<ZoneRings skills={skills} map={{ A: { theta: 0, unlockedLevel: 'NB' } }} />);
    const small = Number(screen.getByTestId('ring-learning').getAttribute('data-extent'));
    rerender(<ZoneRings skills={skills} map={{ A: { theta: 1, unlockedLevel: 'VD' }, B: { theta: 0, unlockedLevel: 'TH' } }} />);
    const big = Number(screen.getByTestId('ring-learning').getAttribute('data-extent'));
    expect(big).toBeGreaterThan(small);
  });
});
```

- [ ] **Step 2: Implement ZoneRings**

`components/zone/zone-rings.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import type { Skill } from '@/lib/bank/types';
import { skillZone, zoneExtent, type ZoneMap } from '@/lib/engine/learning-zone';

const ZONE_COLOR = { mastered: '#8b95e0', learning: '#22c55e', challenge: '#ff8a65' } as const;

export function ZoneRings({ skills, map, size = 380, showLabels = false, highlight }: {
  skills: Skill[]; map: ZoneMap; size?: number; showLabels?: boolean; highlight?: string;
}) {
  const c = size / 2;
  const outer = c - 10;
  const extent = zoneExtent(map, skills);
  const masteredCount = skills.filter((s) => skillZone(map[s.id]).zone === 'mastered').length;
  const rLearn = outer * (0.42 + 0.45 * extent);
  const rMaster = outer * (0.16 + 0.22 * (skills.length ? masteredCount / skills.length : 0));
  const spring = { type: 'spring', stiffness: 60, damping: 14 } as const;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Sơ đồ Learning Zone">
      <circle cx={c} cy={c} r={outer} fill="#ffe1d9" />
      <text x={c} y={24} textAnchor="middle" fontSize={11} fill="#c0563a" fontWeight={600}>QUÁ SỨC</text>
      <motion.circle data-testid="ring-learning" data-extent={extent.toFixed(3)} cx={c} cy={c} fill="#c9f2dc"
        initial={false} animate={{ r: rLearn }} transition={spring} />
      <motion.circle cx={c} cy={c} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 6"
        initial={false} animate={{ r: rLearn, rotate: 360 }} transition={{ r: spring, rotate: { duration: 60, repeat: Infinity, ease: 'linear' } }}
        style={{ originX: '50%', originY: '50%' }} />
      <motion.circle cx={c} cy={c} fill="#dfe6ff" initial={false} animate={{ r: rMaster }} transition={spring} />
      <text x={c} y={c + rLearn - 14} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1f8a57">LEARNING ZONE</text>
      {skills.map((s, i) => {
        const { zone, p } = skillZone(map[s.id]);
        const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
        const r = zone === 'mastered' ? rMaster * 0.6
          : zone === 'learning' ? rMaster + (rLearn - rMaster) * (1 - Math.min(1, p) * 0.7)
          : rLearn + (outer - rLearn) * 0.55;
        const x = c + Math.cos(angle) * r;
        const y = c + Math.sin(angle) * r;
        const hl = highlight === s.id;
        return (
          <g key={s.id}>
            <motion.circle data-testid={`dot-${s.id}`} data-zone={zone} initial={false}
              animate={{ cx: x, cy: y, r: hl ? 10 : 7, fill: ZONE_COLOR[zone] }} transition={spring}
              stroke="#fff" strokeWidth={2.5} />
            {hl && <motion.circle cx={x} cy={y} fill="none" stroke={ZONE_COLOR[zone]} strokeWidth={2}
              animate={{ r: [10, 20], opacity: [0.8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />}
            {showLabels && (
              <motion.text initial={false} animate={{ x: x + (Math.cos(angle) >= 0 ? 12 : -12), y: y + 4 }} transition={spring}
                textAnchor={Math.cos(angle) >= 0 ? 'start' : 'end'} fontSize={11} fill="#2b2d42" fontWeight={500}>{s.name}</motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 3: Trang `/learning-zone`**

`app/(app)/learning-zone/page.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { questionsFor, skillName, skillsFor } from '@/lib/bank';
import { LEVELS, LEVEL_LABEL, SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { applyAnswer, pickNextQuestion, skillZone, type ZoneEvent } from '@/lib/engine/learning-zone';
import { BADGES } from '@/lib/engine/gamification';
import { prob } from '@/lib/engine/irt';
import { LEVEL_B } from '@/lib/engine/learning-zone';
import { ZoneRings } from '@/components/zone/zone-rings';
import { PracticeRunner } from '@/components/session/practice-runner';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { fireConfetti } from '@/lib/ui/confetti';

const SESSION = 10;

function eventText(e: ZoneEvent) {
  return e.type === 'level'
    ? `🌱 Vùng của em vừa mở rộng: ${skillName(e.skillId)} · ${LEVEL_LABEL[e.level]}`
    : `🔓 Mở khoá kiến thức mới: ${skillName(e.skillId)}`;
}

export default function LearningZonePage() {
  const router = useRouter();
  const { profile, zones, assessments, ensureZone, setZone, recordAnswer, awardBadge } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const [running, setRunning] = useState(false);
  const [highlight, setHighlight] = useState<string>();
  const recent = useRef<string[]>([]);
  const key = zoneKey(subject, grade);
  const map = zones[key];
  const skills = useMemo(() => skillsFor(subject, grade), [subject, grade]);
  const pool = useMemo(() => questionsFor(subject, grade).filter((q) => q.type !== 'write'), [subject, grade]);
  const hasAssessment = !!assessments[key];

  if (!map) {
    return (
      <ClayCard className="mx-auto max-w-xl space-y-5 p-10 text-center">
        <div className="flex justify-center"><Owl state="cheer" size={150} /></div>
        <h1 className="text-2xl font-extrabold">Learning Zone {SUBJECT_LABEL[subject]} {grade}</h1>
        <p className="text-muted">Làm bài đánh giá năng lực 12 câu để AI xác định vùng vừa sức của em.</p>
        <div className="flex justify-center gap-3">
          <ClayButton size="lg" onClick={() => router.push('/danh-gia')}>Làm bài đánh giá</ClayButton>
          <ClayButton size="lg" variant="ghost" onClick={() => ensureZone(subject, grade)}>Bắt đầu ở mức cơ bản</ClayButton>
        </div>
        <div className="flex justify-center gap-2">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-4 py-1.5 text-sm font-semibold ${subject === s ? 'bg-lavender text-white' : 'bg-white text-muted'}`}>{SUBJECT_LABEL[s]}</button>
          ))}
        </div>
      </ClayCard>
    );
  }

  const inZone = skills.filter((s) => map[s.id]);
  const locked = skills.filter((s) => !map[s.id]);

  const aside = (
    <ClayCard className="space-y-2 p-3">
      <p className="text-center text-xs font-bold uppercase tracking-wider text-muted">Vùng của em</p>
      <ZoneRings skills={skills} map={useDemo.getState().zones[key] ?? map} size={260} highlight={highlight} />
    </ClayCard>
  );

  if (running) {
    return (
      <PracticeRunner
        title={`Learning Zone · ${SUBJECT_LABEL[subject]}`}
        maxQuestions={SESSION}
        aside={aside}
        next={() => {
          const current = useDemo.getState().zones[key] ?? map;
          const q = pickNextQuestion(pool, current, recent.current);
          if (q) { recent.current = [...recent.current, q.id].slice(-15); setHighlight(q.skillId); }
          return q;
        }}
        onAnswered={(q, r) => {
          const current = useDemo.getState().zones[key] ?? map;
          const { map: nextMap, events } = applyAnswer(current, skills, q, r.correct);
          setZone(subject, grade, nextMap);
          const base = recordAnswer(subject, q, r.correct);
          const newBadges = [...base.newBadges];
          if (events.length) {
            events.forEach((e) => toast.success(eventText(e)));
            fireConfetti({ origin: { x: 0.85, y: 0.5 } });
            if (awardBadge('zone-expand')) newBadges.push('zone-expand');
          }
          return { ...base, newBadges, message: events.length ? eventText(events[0]) : undefined };
        }}
        onExit={() => { setRunning(false); setHighlight(undefined); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Learning Zone</h1>
          <p className="mt-1 max-w-2xl text-muted">Câu hỏi luôn <b className="text-ink">vừa sức</b>: em làm đúng khoảng 70–85%. Khi đã vững, vùng xanh sẽ <b className="text-ink">mở rộng dần</b> sang mức độ và kiến thức mới.</p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-clay">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-xl px-5 py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'text-muted'}`}>{SUBJECT_LABEL[s]} {grade}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <ClayCard className="flex flex-col items-center gap-4 p-8">
          <ZoneRings skills={skills} map={map} size={520} showLabels />
          <div className="flex gap-5 text-sm">
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#8b95e0]" /> Đã thành thạo</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#22c55e]" /> Đang trong vùng</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-coral" /> Chưa tới</span>
          </div>
        </ClayCard>

        <div className="space-y-4">
          <ClayCard className="flex items-center gap-4">
            <Owl state="cheer" size={80} />
            <div className="flex-1">
              <p className="font-bold">Phiên luyện {SESSION} câu vừa sức</p>
              <p className="text-sm text-muted">{hasAssessment ? 'Dựa trên bài đánh giá AI gần nhất' : 'Đang ở mức cơ bản, làm bài đánh giá để chính xác hơn'}</p>
            </div>
            <ClayButton onClick={() => { recent.current = []; setRunning(true); }}>Luyện ngay</ClayButton>
          </ClayCard>
          <ClayCard className="space-y-3">
            <p className="font-bold">Kiến thức trong vùng</p>
            {inZone.map((s, i) => {
              const sp = map[s.id];
              const { zone } = skillZone(sp);
              const pFrontier = prob(sp.theta, LEVEL_B[sp.unlockedLevel]);
              return (
                <motion.div key={s.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-muted">{zone === 'mastered' ? '✓ Thành thạo' : `~${Math.round(pFrontier * 100)}% đúng ở mức ${LEVEL_LABEL[sp.unlockedLevel]}`}</span>
                  </div>
                  <div className="flex gap-1">
                    {LEVELS.map((l) => (
                      <motion.span key={l} layout title={LEVEL_LABEL[l]}
                        className={`h-2 flex-1 rounded-full ${LEVELS.indexOf(l) < LEVELS.indexOf(sp.unlockedLevel) || zone === 'mastered' ? 'bg-[#8b95e0]' : l === sp.unlockedLevel ? 'bg-[#22c55e]' : 'bg-lavender-soft'}`} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {locked.length > 0 && (
              <>
                <p className="pt-2 font-bold">🔒 Chưa mở</p>
                {locked.map((s) => (
                  <p key={s.id} className="text-sm text-muted">{s.name} <span className="text-xs">· cần vững: {s.prerequisites.map(skillName).join(', ')}</span></p>
                ))}
              </>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
}
```

Lưu ý: `aside` gọi `useDemo.getState()` khi render, nên không vi phạm rules-of-hooks. Vòng nhỏ trong phiên luyện sẽ render lại vì `setZone` làm component cha re-render.

- [ ] **Step 4: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay luồng chính: làm bài đánh giá Toán (cố tình sai phần căn bậc hai) → vào Learning Zone → "Luyện ngay" → trả lời đúng liên tục → trong khoảng 4–6 câu phải có toast "🌱 Vùng của em vừa mở rộng", vòng xanh nhỏ ở bên nở ra, chấm kiến thức dịch chuyển → thoát ra thì sơ đồ lớn phản ánh trạng thái mới. Luyện liên tục đến khi hết câu → màn "Hoàn thành phiên" (không treo).

```bash
git add -A && git commit -m "feat(learning-zone): zone rings visualization and adaptive in-zone practice"
```

---

### Task 13: Phòng thi (`/phong-thi`, `/phong-thi/[examId]`)

**Files:**
- Create: `app/(app)/phong-thi/page.tsx`, `app/(app)/phong-thi/[examId]/page.tsx`, `components/exam/exam-room.tsx`, `components/exam/exam-result.tsx`
- Test: `tests/components/exam-room.test.tsx`

**Interfaces:**
- Consumes: `examsFor`, `getExam`, `EXAM_KIND_LABEL`, `startAttempt`, `remainingSec`, `isExpired`, `setAnswer`, `toggleFlag`, `addViolation`, `navStatus`, `gradeAttempt`, `formatClock`, `useDemo().{exam, setExam, finishExam, examResults}`, `QuestionView`.
- Produces:
  - `<ExamRoom exam={ExamDef} now?={() => number} />`: các pha `lobby` → `countdown` (3-2-1) → `taking` → `result`. Có khôi phục bài và tự nộp khi hết hạn lúc mở lại (Review Focus #1).
  - `<ExamResultView exam result questions onBack />`

- [ ] **Step 1: Test (failing)**

`tests/components/exam-room.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/ui/confetti', () => ({ fireConfetti: vi.fn() }));

import { ExamRoom } from '@/components/exam/exam-room';
import { getExam } from '@/lib/bank/exams';
import { useDemo } from '@/lib/store/demo-store';
import { startAttempt } from '@/lib/engine/exam';

const exam = getExam('toan9-15p-can')!;
let clock = 1_000_000;
const now = () => clock;

beforeEach(() => { useDemo.getState().resetDemo(); clock = 1_000_000; });

describe('ExamRoom', () => {
  it('lobby requires accepting rules, then starts and persists attempt', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExamRoom exam={exam} now={now} />);
    const start = screen.getByRole('button', { name: 'Vào phòng thi' });
    expect(start).toBeDisabled();
    await user.click(screen.getByLabelText(/Tôi đã đọc và đồng ý/));
    await user.click(start);
    await act(async () => { vi.advanceTimersByTime(3500); });
    expect(await screen.findByText('15:00')).toBeInTheDocument();
    expect(useDemo.getState().exam?.examId).toBe(exam.id);
    vi.useRealTimers();
  });
  it('resumes in-progress attempt with remaining time from startedAt', () => {
    useDemo.getState().setExam({ ...startAttempt(exam, clock - 60_000), answers: {} });
    render(<ExamRoom exam={exam} now={now} />);
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });
  it('auto-submits when reopened after expiry', () => {
    useDemo.getState().setExam(startAttempt(exam, clock - 16 * 60_000));
    render(<ExamRoom exam={exam} now={now} />);
    expect(screen.getByText(/Kết quả bài thi/)).toBeInTheDocument();
    expect(useDemo.getState().examResults[exam.id]).toBeDefined();
    expect(useDemo.getState().exam).toBeNull();
  });
  it('tab switch records a violation and shows warning', () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    fireEvent(document, new Event('visibilitychange'));
    expect(useDemo.getState().exam?.violations).toBe(1);
    expect(screen.getByText(/rời khỏi màn hình làm bài/)).toBeInTheDocument();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  });
  it('submit confirmation warns about unanswered questions', async () => {
    useDemo.getState().setExam(startAttempt(exam, clock));
    render(<ExamRoom exam={exam} now={now} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));
    expect(screen.getByText(new RegExp(`còn ${exam.questionIds.length} câu chưa làm`))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận nộp' }));
    expect(screen.getByText(/Kết quả bài thi/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: ExamResultView**

`components/exam/exam-result.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ExamDef } from '@/lib/bank/exams';
import type { Question } from '@/lib/bank/types';
import { LEVELS, LEVEL_LABEL } from '@/lib/bank/types';
import type { ExamResult } from '@/lib/engine/exam';
import { formatClock } from '@/lib/engine/exam';
import { MathText } from '@/components/questions/math-text';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { fireConfetti } from '@/lib/ui/confetti';

export function ExamResultView({ exam, result, questions, onBack }: { exam: ExamDef; result: ExamResult; questions: Question[]; onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { if (result.score10 >= 8) fireConfetti(); }, [result.score10]);
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <ClayCard className="flex items-center gap-8 p-8">
        <Owl state={result.score10 >= 5 ? 'celebrate' : 'cheer'} size={140} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted">Kết quả bài thi · {exam.title}</p>
          <p className="font-display text-7xl font-extrabold text-coral"><CountUp value={result.score10} format={(n) => n.toFixed(2).replace('.', ',')} /></p>
          <p className="text-muted">Đúng {result.correct}/{result.total} câu · Thời gian {formatClock(result.durationUsedSec)}
            {result.violations > 0 && <span className="ml-2 font-semibold text-peach-dark">· ⚠️ {result.violations} lần rời màn hình</span>}</p>
        </div>
      </ClayCard>
      <ClayCard className="space-y-3">
        <p className="font-bold">Phân tích theo mức độ</p>
        {LEVELS.filter((l) => result.byLevel[l].total > 0).map((l) => (
          <div key={l} className="grid grid-cols-[120px_1fr_60px] items-center gap-3 text-sm">
            <span className="font-semibold">{LEVEL_LABEL[l]}</span>
            <ProgressBar value={result.byLevel[l].correct / result.byLevel[l].total} color="mint" />
            <span className="text-right">{result.byLevel[l].correct}/{result.byLevel[l].total}</span>
          </div>
        ))}
      </ClayCard>
      <ClayCard className="space-y-2">
        <p className="font-bold">Xem lại bài làm</p>
        {questions.map((q, i) => {
          const pq = result.perQuestion.find((p) => p.questionId === q.id);
          return (
            <div key={q.id} className="rounded-xl border border-lavender-soft">
              <button type="button" onClick={() => setOpen(open === q.id ? null : q.id)} className="flex w-full items-center gap-3 p-3 text-left">
                <span className={`grid h-8 w-8 place-items-center rounded-lg font-bold ${pq?.correct ? 'bg-mint text-mint-dark' : pq && pq.fraction > 0 ? 'bg-[#fff1d6] text-[#b7791f]' : 'bg-peach text-peach-dark'}`}>{i + 1}</span>
                <MathText text={q.content} className="line-clamp-1 flex-1 text-sm" />
              </button>
              {open === q.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden px-4 pb-4 text-sm">
                  <p className="font-semibold">🤖 Lời giải</p><MathText text={q.explanation} />
                </motion.div>
              )}
            </div>
          );
        })}
      </ClayCard>
      <ClayButton onClick={onBack}>← Về danh sách bài thi</ClayButton>
    </div>
  );
}
```

- [ ] **Step 3: ExamRoom**

`components/exam/exam-room.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ExamDef } from '@/lib/bank/exams';
import { EXAM_KIND_LABEL } from '@/lib/bank/exams';
import { getQuestion } from '@/lib/bank';
import type { AnswerValue, Question } from '@/lib/bank/types';
import {
  addViolation, formatClock, gradeAttempt, isExpired, navStatus, remainingSec, setAnswer, startAttempt, toggleFlag, type ExamResult,
} from '@/lib/engine/exam';
import { BADGES } from '@/lib/engine/gamification';
import { useDemo } from '@/lib/store/demo-store';
import { QuestionView } from '@/components/questions/question-view';
import { Owl } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { ExamResultView } from './exam-result';

type Phase = 'lobby' | 'countdown' | 'taking' | 'result';
const RULES = [
  'Bài thi có tính giờ, hệ thống tự nộp khi hết giờ.',
  'Không chuyển tab hoặc rời khỏi màn hình làm bài, mọi lần rời đi đều được ghi lại.',
  'Bài làm được tự động lưu sau mỗi câu, mất mạng hay tải lại trang không mất bài.',
  'Có thể đánh dấu câu để xem lại trước khi nộp.',
];

export function ExamRoom({ exam, now = Date.now }: { exam: ExamDef; now?: () => number }) {
  const router = useRouter();
  const { exam: attempt, setExam, finishExam, examResults } = useDemo();
  const questions = useMemo(() => exam.questionIds.map(getQuestion).filter(Boolean) as Question[], [exam]);
  const mine = attempt && attempt.examId === exam.id && !attempt.submittedAt ? attempt : null;

  const submit = useCallback((): ExamResult | null => {
    const a = useDemo.getState().exam;
    if (!a || a.examId !== exam.id) return null;
    const r = gradeAttempt(questions, a, now());
    finishExam(r).forEach((b) => toast(`${BADGES[b].icon} Huy hiệu mới: ${BADGES[b].name}`));
    return r;
  }, [exam.id, questions, now, finishExam]);

  // Mở lại khi đã hết giờ → chấm ngay; lưu vào store trong effect (không set store khi đang render)
  const [result, setResult] = useState<ExamResult | null>(() =>
    mine && isExpired(mine, now()) ? gradeAttempt(questions, mine, now()) : null);
  useEffect(() => {
    if (result && useDemo.getState().exam?.examId === exam.id) finishExam(result);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>(result ? 'result' : mine ? 'taking' : 'lobby');
  const [agreed, setAgreed] = useState(false);
  const [count, setCount] = useState(3);
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState(() => (mine ? remainingSec(mine, now()) : exam.durationMin * 60));
  const [warning, setWarning] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  // đếm ngược 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) {
      setExam(startAttempt(exam, now()));
      setLeft(exam.durationMin * 60);
      setPhase('taking');
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count, exam, now, setExam]);

  // đồng hồ
  useEffect(() => {
    if (phase !== 'taking') return;
    const id = setInterval(() => {
      const a = useDemo.getState().exam;
      if (!a) return;
      const r = remainingSec(a, now());
      setLeft(r);
      if (r === 0) { const res = submit(); if (res) { setResult(res); setPhase('result'); toast('⏰ Hết giờ, bài đã được tự động nộp'); } }
    }, 500);
    return () => clearInterval(id);
  }, [phase, now, submit]);

  // phát hiện rời tab
  useEffect(() => {
    if (phase !== 'taking') return;
    const onHide = () => {
      if (!document.hidden) return;
      const a = useDemo.getState().exam;
      if (!a) return;
      const next = addViolation(a);
      setExam(next);
      setWarning(next.violations);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [phase, setExam]);

  const back = () => router.push('/phong-thi');

  if (phase === 'result') {
    const r = result ?? examResults[exam.id];
    return r ? <ExamResultView exam={exam} result={r} questions={questions} onBack={back} /> : null;
  }

  if (phase === 'lobby' || phase === 'countdown') {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <ClayCard className="w-full max-w-2xl space-y-6 p-10">
          <AnimatePresence mode="wait">
            {phase === 'countdown' ? (
              <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                className="py-16 text-center font-display text-9xl font-extrabold text-coral">{count || 'Bắt đầu!'}</motion.div>
            ) : (
              <motion.div key="lobby" className="space-y-6">
                <div className="flex items-center gap-5">
                  <Owl state="idle" size={100} />
                  <div>
                    <span className="rounded-full bg-lavender-soft px-3 py-1 text-xs font-bold text-lavender-dark">{EXAM_KIND_LABEL[exam.kind]}</span>
                    <h1 className="mt-2 text-2xl font-extrabold">{exam.title}</h1>
                    <p className="text-muted">{questions.length} câu · {exam.durationMin} phút</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {RULES.map((r) => <li key={r} className="flex gap-3 rounded-xl bg-cream px-4 py-2.5 text-sm">📌 {r}</li>)}
                </ul>
                <label className="flex items-center gap-3 font-semibold">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-5 w-5 accent-coral" />
                  Tôi đã đọc và đồng ý với quy chế thi
                </label>
                <div className="flex justify-between">
                  <ClayButton variant="ghost" onClick={back}>← Quay lại</ClayButton>
                  <ClayButton size="lg" disabled={!agreed} onClick={() => {
                    document.documentElement.requestFullscreen?.().catch(() => {});
                    setCount(3); setPhase('countdown');
                  }}>Vào phòng thi</ClayButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ClayCard>
      </div>
    );
  }

  // taking
  const a = mine ?? useDemo.getState().exam;
  if (!a) return null;
  const q = questions[current];
  const status = navStatus(a, exam.questionIds);
  const unanswered = Object.values(status).filter((s) => s === 'unanswered').length;
  const urgent = left <= 300;
  const update = (v: AnswerValue) => setExam(setAnswer(a, q.id, v));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-white/60 bg-cream/90 px-8 py-3 backdrop-blur">
        <p className="flex-1 font-display font-bold">{exam.title}</p>
        {a.violations > 0 && <span className="rounded-xl bg-peach px-3 py-1 text-sm font-semibold text-peach-dark">⚠️ {a.violations}</span>}
        <motion.span animate={left <= 60 ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ repeat: left <= 60 ? Infinity : 0, duration: 1 }}
          className={`rounded-2xl px-5 py-2 font-display text-2xl font-extrabold tabular-nums shadow-clay ${urgent ? 'bg-peach text-peach-dark' : 'bg-white'}`}>
          {formatClock(left)}
        </motion.span>
        <ClayButton onClick={() => setConfirming(true)}>Nộp bài</ClayButton>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <ClayCard className="p-8">
                <QuestionView question={q} index={current + 1} value={a.answers[q.id] ?? null} onChange={update} disabled={false} reveal={false} />
              </ClayCard>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <ClayButton variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>← Câu trước</ClayButton>
            <ClayButton variant="secondary" onClick={() => setExam(toggleFlag(a, q.id))}>{a.flagged.includes(q.id) ? '★ Bỏ đánh dấu' : '☆ Đánh dấu xem lại'}</ClayButton>
            <ClayButton variant="ghost" disabled={current === questions.length - 1} onClick={() => setCurrent((c) => c + 1)}>Câu sau →</ClayButton>
          </div>
        </div>
        <ClayCard className="h-fit space-y-4">
          <p className="font-bold">Danh sách câu hỏi</p>
          <div className="grid grid-cols-5 gap-2">
            {exam.questionIds.map((id, i) => (
              <motion.button key={id} type="button" layout onClick={() => setCurrent(i)} aria-label={`Câu ${i + 1}`}
                className={`h-10 rounded-xl text-sm font-bold ${i === current ? 'ring-2 ring-coral' : ''}
                  ${status[id] === 'answered' ? 'bg-lavender text-white' : status[id] === 'flagged' ? 'bg-sun text-ink' : 'bg-lavender-soft text-muted'}`}>
                {i + 1}
              </motion.button>
            ))}
          </div>
          <div className="space-y-1 text-xs text-muted">
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-lavender" />Đã làm</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-sun" />Đánh dấu xem lại</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded bg-lavender-soft" />Chưa làm</p>
          </div>
          <p className="text-xs text-mint-dark">✓ Bài làm được tự động lưu</p>
        </ClayCard>
      </div>

      <AnimatePresence>
        {(warning !== null || confirming) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md">
              <ClayCard className="space-y-4 p-8 text-center">
                {warning !== null ? (
                  <>
                    <div className="flex justify-center"><Owl state="wrong" size={100} /></div>
                    <p className="text-lg font-bold">Bạn vừa rời khỏi màn hình làm bài (lần {warning})</p>
                    <p className="text-sm text-muted">Hành vi này đã được ghi lại và sẽ hiển thị trong kết quả bài thi.</p>
                    <ClayButton onClick={() => setWarning(null)}>Tiếp tục làm bài</ClayButton>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">Nộp bài?</p>
                    <p className="text-muted">{unanswered > 0 ? `Em còn ${unanswered} câu chưa làm.` : 'Em đã làm hết các câu.'} Sau khi nộp sẽ không sửa được nữa.</p>
                    <div className="flex justify-center gap-3">
                      <ClayButton variant="ghost" onClick={() => setConfirming(false)}>Làm tiếp</ClayButton>
                      <ClayButton onClick={() => { const r = submit(); setConfirming(false); if (r) { setResult(r); setPhase('result'); document.exitFullscreen?.().catch(() => {}); } }}>Xác nhận nộp</ClayButton>
                    </div>
                  </>
                )}
              </ClayCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Ghi chú: trong test "submit confirmation", text mong đợi là `còn N câu chưa làm`. Chuỗi "Em còn N câu chưa làm." khớp với regex.

- [ ] **Step 4: Trang danh sách & trang thi**

`app/(app)/phong-thi/page.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/store/demo-store';
import { EXAM_KIND_LABEL, examsFor } from '@/lib/bank/exams';
import { SUBJECT_LABEL } from '@/lib/bank/types';
import { TiltCard } from '@/components/ui/tilt-card';

const KIND_STYLE = { '15p': 'bg-mint text-mint-dark', '45p': 'bg-lavender-soft text-lavender-dark', 'giua-ky': 'bg-[#fff1d6] text-[#b7791f]', 'cuoi-ky': 'bg-peach text-peach-dark' } as const;

export default function PhongThiPage() {
  const router = useRouter();
  const { profile, examResults, exam } = useDemo();
  const list = examsFor(profile.grade);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Phòng thi</h1>
        <p className="mt-1 text-muted">Bài kiểm tra do nhà trường tổ chức, đề lấy trực tiếp từ ngân hàng 40.000 câu đã được NXB phê duyệt.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e, i) => {
          const r = examResults[e.id];
          const inProgress = exam?.examId === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <TiltCard onClick={() => router.push(`/phong-thi/${e.id}`)} className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold ${KIND_STYLE[e.kind]}`}>{EXAM_KIND_LABEL[e.kind]}</span>
                  <span className="text-sm text-muted">{SUBJECT_LABEL[e.subject]}</span>
                </div>
                <h3 className="flex-1 text-lg font-bold">{e.title}</h3>
                <p className="text-sm text-muted">⏱ {e.durationMin} phút · {e.questionIds.length} câu · {e.schedule}</p>
                <p className="font-bold">
                  {r ? <span className="text-mint-dark">✓ Đã làm · {r.score10.toFixed(2).replace('.', ',')} điểm</span>
                    : inProgress ? <span className="text-coral">● Đang làm dở, vào tiếp →</span>
                    : <span className="text-coral">Vào thi →</span>}
                </p>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

`app/(app)/phong-thi/[examId]/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { getExam } from '@/lib/bank/exams';
import { ExamRoom } from '@/components/exam/exam-room';
import { ClayCard } from '@/components/ui/clay-card';

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const exam = getExam(examId);
  if (!exam) return <ClayCard className="m-10 p-10 text-center">Không tìm thấy bài thi.</ClayCard>;
  return <ExamRoom exam={exam} />;
}
```

- [ ] **Step 5: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay: vào bài 15 phút → đếm ngược 3-2-1 → làm 2 câu → **reload trang**, phải quay lại đúng bài và đồng hồ không reset → chuyển tab rồi quay lại thì hiện cảnh báo và chip ⚠️ tăng → đánh dấu câu (ô màu vàng) → nộp → trang kết quả có điểm đếm lên và phân tích theo mức độ.

```bash
git add -A && git commit -m "feat(exam): exam room with lobby, timer, autosave/resume, tab-violation, grading"
```

---

### Task 14: Dashboard (`/dashboard`)

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Test: `tests/components/dashboard.test.tsx`

**Interfaces:**
- Consumes: store (profile, streak, xp, history, assessments, zones, badges, examResults), `SkillRadar`, `ZoneRings`, `examsFor`, `skillsFor`, `skillName`, `thetaToScore`, `BADGES`, `Owl`, `CountUp`.
- Produces: bento grid gồm Lời chào + Bé Cú (6 cột) · Streak (3) · XP (3) · Radar năng lực (6, có tab Toán/Anh; trạng thái trống có CTA) · Learning Zone mini (6) · Nhiệm vụ hôm nay (6) · Lịch thi sắp tới (6) · Hoạt động 7 ngày (12, cột XP) · Huy hiệu.

- [ ] **Step 1: Test (failing)**

`tests/components/dashboard.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/charts/skill-radar', () => ({ SkillRadar: () => <div>radar</div> }));

import DashboardPage from '@/app/(app)/dashboard/page';
import { useDemo } from '@/lib/store/demo-store';

beforeEach(() => useDemo.getState().resetDemo());

describe('Dashboard', () => {
  it('greets and shows empty radar CTA before assessment', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Chào Minh/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Làm bài đánh giá/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lịch thi sắp tới/)).toBeInTheDocument();
  });
  it('works for grades without data (6 and 12)', () => {
    useDemo.getState().setGrade(12);
    expect(() => render(<DashboardPage />)).not.toThrow();
    useDemo.getState().setGrade(6);
    expect(() => render(<DashboardPage />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Implement**

`app/(app)/dashboard/page.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDemo, zoneKey } from '@/lib/store/demo-store';
import { skillsFor } from '@/lib/bank';
import { examsFor, EXAM_KIND_LABEL } from '@/lib/bank/exams';
import { SUBJECT_LABEL, type Subject } from '@/lib/bank/types';
import { thetaToScore } from '@/lib/engine/irt';
import { BADGES, type BadgeId, toDateKey } from '@/lib/engine/gamification';
import { SkillRadar } from '@/components/charts/skill-radar';
import { ZoneRings } from '@/components/zone/zone-rings';
import { Owl } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';
import { CountUp } from '@/components/ui/count-up';

const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const router = useRouter();
  const { profile, streak, xp, history, assessments, zones, badges, examResults } = useDemo();
  const grade = profile.grade;
  const [subject, setSubject] = useState<Subject>('toan');
  const key = zoneKey(subject, grade);
  const skills = skillsFor(subject, grade);
  const assessment = assessments[key];
  const zone = zones[key];
  const radar = skills.map((s) => ({
    name: s.name,
    score: zone?.[s.id] ? thetaToScore(zone[s.id].theta) : assessment?.skills.find((r) => r.skillId === s.id)?.score ?? 0,
  }));
  const today = toDateKey(new Date());
  const todayItems = history.filter((h) => h.date === today);
  const answeredToday = todayItems.reduce((s, h) => s + h.answered, 0);
  const exams = examsFor(grade).filter((e) => !examResults[e.id]).slice(0, 3);
  const tasks = [
    { label: `Làm bài đánh giá năng lực ${SUBJECT_LABEL[subject]}`, done: !!assessment, href: '/danh-gia' },
    { label: 'Luyện 10 câu trong Learning Zone', done: answeredToday >= 10, href: '/learning-zone' },
    { label: exams[0] ? `Làm bài: ${exams[0].title}` : 'Ôn tập đề tổng hợp', done: false, href: exams[0] ? `/phong-thi/${exams[0].id}` : '/luyen-tap' },
  ];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = toDateKey(d);
    return { k, label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()], xp: history.filter((h) => h.date === k).reduce((s, h) => s + h.xp, 0) };
  });
  const maxXp = Math.max(50, ...last7.map((d) => d.xp));

  return (
    <motion.div className="grid grid-cols-12 gap-5" initial="hidden" animate="show" transition={{ staggerChildren: 0.06 }}>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="flex h-full items-center gap-6 bg-gradient-to-br from-white to-lavender-soft">
          <Owl state="cheer" size={130} />
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold">Chào {profile.name}! 👋</h1>
            <OwlBubble text={assessment ? 'Hôm nay luyện 15 phút trong Learning Zone nhé!' : 'Làm bài đánh giá để Bé Cú hiểu em hơn nhé!'} />
            <ClayButton onClick={() => router.push(assessment ? '/learning-zone' : '/danh-gia')}>{assessment ? 'Vào Learning Zone' : 'Làm bài đánh giá'}</ClayButton>
          </div>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-6 lg:col-span-3">
        <ClayCard className="flex h-full flex-col justify-between bg-gradient-to-br from-[#fff1e6] to-white">
          <p className="font-semibold text-muted">Chuỗi ngày học</p>
          <p className="font-display text-6xl font-extrabold text-coral"><motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block">🔥</motion.span><CountUp value={streak.count} /></p>
          <p className="text-sm text-muted">Giữ lửa mỗi ngày nhé!</p>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-6 lg:col-span-3">
        <ClayCard className="flex h-full flex-col justify-between">
          <p className="font-semibold text-muted">Điểm kinh nghiệm</p>
          <p className="font-display text-5xl font-extrabold text-lavender-dark">⭐ <CountUp value={xp} /></p>
          <p className="text-sm text-muted">Hôm nay: {answeredToday} câu</p>
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full">
          <div className="flex items-center justify-between">
            <p className="font-bold">Bản đồ năng lực</p>
            <div className="flex gap-1 rounded-xl bg-lavender-soft p-1">
              {(['toan', 'anh'] as Subject[]).map((s) => (
                <button key={s} type="button" onClick={() => setSubject(s)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${subject === s ? 'bg-white shadow' : 'text-muted'}`}>{SUBJECT_LABEL[s]}</button>
              ))}
            </div>
          </div>
          {assessment || zone ? <SkillRadar data={radar} color={subject === 'toan' ? '#a8b5ff' : '#ff8a65'} /> : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center text-muted">
              <p>AI chưa có dữ liệu năng lực {SUBJECT_LABEL[subject]} lớp {grade} của em.</p>
              <ClayButton variant="secondary" onClick={() => router.push('/danh-gia')}>Làm bài đánh giá</ClayButton>
            </div>
          )}
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="flex h-full items-center gap-4">
          <div className="w-1/2"><ZoneRings skills={skills} map={zone ?? {}} size={240} /></div>
          <div className="space-y-3">
            <p className="font-bold">Learning Zone · {SUBJECT_LABEL[subject]}</p>
            <p className="text-sm text-muted">{zone ? `${Object.keys(zone).length}/${skills.length} kiến thức đang trong vùng vừa sức.` : 'Vùng vừa sức sẽ xuất hiện sau bài đánh giá.'}</p>
            <ClayButton onClick={() => router.push('/learning-zone')}>Luyện ngay</ClayButton>
          </div>
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full space-y-3">
          <p className="font-bold">Nhiệm vụ hôm nay</p>
          {tasks.map((t) => (
            <button key={t.label} type="button" onClick={() => router.push(t.href)} className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left hover:bg-lavender-soft">
              <span className={`grid h-7 w-7 place-items-center rounded-full ${t.done ? 'bg-mint-dark text-white' : 'border-2 border-lavender'}`}>{t.done ? '✓' : ''}</span>
              <span className={`flex-1 font-medium ${t.done ? 'text-muted line-through' : ''}`}>{t.label}</span>
              <span className="text-coral">→</span>
            </button>
          ))}
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-6">
        <ClayCard className="h-full space-y-3">
          <p className="font-bold">📅 Lịch thi sắp tới</p>
          {exams.length === 0 && <p className="text-sm text-muted">Không có bài thi nào đang chờ.</p>}
          {exams.map((e) => (
            <button key={e.id} type="button" onClick={() => router.push(`/phong-thi/${e.id}`)} className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left hover:bg-lavender-soft">
              <span className="rounded-lg bg-lavender-soft px-2 py-1 text-xs font-bold text-lavender-dark">{EXAM_KIND_LABEL[e.kind]}</span>
              <span className="flex-1 font-medium">{e.title}</span>
              <span className="text-xs text-muted">{e.schedule}</span>
            </button>
          ))}
        </ClayCard>
      </motion.div>

      <motion.div variants={item} className="col-span-12 lg:col-span-8">
        <ClayCard>
          <p className="font-bold">Hoạt động 7 ngày</p>
          <div className="mt-4 flex h-36 items-end gap-3">
            {last7.map((d, i) => (
              <div key={d.k} className="flex flex-1 flex-col items-center gap-2">
                <motion.div className="w-full rounded-t-xl bg-gradient-to-t from-lavender to-[#c9d0ff]"
                  initial={{ height: 0 }} animate={{ height: `${(d.xp / maxXp) * 100}%` }} transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 120, damping: 16 }} />
                <span className={`text-xs ${d.k === today ? 'font-bold text-coral' : 'text-muted'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </ClayCard>
      </motion.div>
      <motion.div variants={item} className="col-span-12 lg:col-span-4">
        <ClayCard className="h-full">
          <p className="font-bold">Huy hiệu</p>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(Object.keys(BADGES) as BadgeId[]).map((b) => {
              const has = badges.includes(b);
              return (
                <motion.div key={b} whileHover={{ scale: 1.1, rotate: -4 }} title={BADGES[b].name}
                  className={`grid aspect-square place-items-center rounded-2xl text-3xl ${has ? 'bg-[#fff1d6] shadow-clay' : 'bg-lavender-soft opacity-40 grayscale'}`}>
                  {BADGES[b].icon}
                </motion.div>
              );
            })}
          </div>
        </ClayCard>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay: các ô bento xuất hiện lần lượt, số đếm lên, cột XP mọc lên; đổi lớp 6/12 không lỗi.

```bash
git add -A && git commit -m "feat(dashboard): bento dashboard with streak, xp, radar, zone, tasks, exams, badges"
```

---

### Task 15: Landing page (`/`)

**Files:**
- Create: `components/landing/{landing-nav,hero,stats,pillars,zone-teaser,exam-builder-demo,footer-cta}.tsx`
- Modify: `app/page.tsx`
- Test: `tests/components/exam-builder-demo.test.tsx`

**Interfaces:**
- Consumes: `Owl`, `OwlBubble`, `CountUp`, `TiltCard`, `ZoneRings`, `buildExam`, `questionsFor`, `skillsFor`, `BANK_TOTAL`, `MathText`, `LevelPill`, `NxbBadge`.
- Produces: landing gồm các section: Nav → Hero (Bé Cú nhìn theo con trỏ, các thẻ câu hỏi bay lơ lửng) → Stats (40.000 câu · NXB phê duyệt · GDPT 2018 · 11 dạng câu hỏi) → Pillars (3 TiltCard) → Zone teaser (ZoneRings tự mở rộng theo vòng lặp) → Dành cho nhà trường + ExamBuilderDemo → Footer CTA. Không dùng AppShell; CTA dẫn tới `/dashboard`.

- [ ] **Step 1: Test (failing)**

`tests/components/exam-builder-demo.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamBuilderDemo } from '@/components/landing/exam-builder-demo';

describe('ExamBuilderDemo', () => {
  it('builds an exam from the matrix after a short "AI" delay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExamBuilderDemo />);
    await user.click(screen.getByRole('button', { name: 'Tạo đề' }));
    expect(screen.getByText(/Đang lấy câu từ ngân hàng/)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(await screen.findByText(/Đề đã sẵn sàng/)).toBeInTheDocument();
    expect(screen.getByText(/Mã phòng thi/)).toBeInTheDocument();
    vi.useRealTimers();
  });
  it('matrix stepper changes counts', async () => {
    render(<ExamBuilderDemo />);
    const plus = screen.getByRole('button', { name: 'Tăng Nhận biết' });
    const before = screen.getByTestId('count-NB').textContent;
    await userEvent.click(plus);
    expect(screen.getByTestId('count-NB').textContent).toBe(String(Number(before) + 1));
  });
});
```

- [ ] **Step 2: ExamBuilderDemo**

`components/landing/exam-builder-demo.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { questionsFor } from '@/lib/bank';
import { LEVELS, LEVEL_LABEL, SUBJECT_LABEL, type Grade, type Level, type Question, type Subject } from '@/lib/bank/types';
import { buildExam, type Matrix } from '@/lib/engine/exam-builder';
import { MathText } from '@/components/questions/math-text';
import { LevelPill } from '@/components/ui/level-pill';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { ClayButton } from '@/components/ui/clay-button';
import { ClayCard } from '@/components/ui/clay-card';

const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export function ExamBuilderDemo() {
  const [subject, setSubject] = useState<Subject>('toan');
  const [grade, setGrade] = useState<Grade>(9);
  const [matrix, setMatrix] = useState<Matrix>({ NB: 4, TH: 3, VD: 2, VDC: 1 });
  const [state, setState] = useState<'idle' | 'building' | 'done'>('idle');
  const [result, setResult] = useState<{ questions: Question[]; room: string } | null>(null);

  const step = (l: Level, d: number) => setMatrix((m) => ({ ...m, [l]: Math.max(0, Math.min(20, m[l] + d)) }));
  const build = () => {
    setState('building');
    setTimeout(() => {
      const r = buildExam(questionsFor(subject, grade).filter((q) => q.type !== 'speak'), matrix);
      setResult({ questions: r.questions, room: code() });
      setState('done');
    }, 1200);
  };
  const total = LEVELS.reduce((s, l) => s + matrix[l], 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <ClayCard className="space-y-5">
        <div className="flex gap-2">
          {(['toan', 'anh'] as Subject[]).map((s) => (
            <button key={s} type="button" onClick={() => setSubject(s)} className={`flex-1 rounded-xl py-2 font-semibold ${subject === s ? 'bg-lavender text-white' : 'bg-lavender-soft text-muted'}`}>{SUBJECT_LABEL[s]}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {([6, 9, 12] as Grade[]).map((g) => (
            <button key={g} type="button" onClick={() => setGrade(g)} className={`flex-1 rounded-xl py-2 font-semibold ${grade === g ? 'bg-coral text-white' : 'bg-cream text-muted'}`}>Lớp {g}</button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-muted">Ma trận đề</p>
          {LEVELS.map((l) => (
            <div key={l} className="flex items-center justify-between">
              <LevelPill level={l} />
              <div className="flex items-center gap-2">
                <button type="button" aria-label={`Giảm ${LEVEL_LABEL[l]}`} onClick={() => step(l, -1)} className="h-8 w-8 rounded-lg bg-lavender-soft font-bold">−</button>
                <span data-testid={`count-${l}`} className="w-6 text-center font-display font-bold">{matrix[l]}</span>
                <button type="button" aria-label={`Tăng ${LEVEL_LABEL[l]}`} onClick={() => step(l, 1)} className="h-8 w-8 rounded-lg bg-lavender-soft font-bold">+</button>
              </div>
            </div>
          ))}
          <p className="pt-1 text-right text-sm text-muted">Tổng: <b className="text-ink">{total} câu</b></p>
        </div>
        <ClayButton className="w-full" size="lg" onClick={build} disabled={state === 'building' || total === 0}>Tạo đề</ClayButton>
      </ClayCard>

      <ClayCard className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" exit={{ opacity: 0 }} className="flex h-full min-h-[380px] flex-col items-center justify-center gap-2 text-center text-muted">
              <p className="text-5xl">📝</p>
              <p>Chọn môn, lớp, ma trận mức độ rồi bấm <b className="text-ink">Tạo đề</b>.</p>
            </motion.div>
          )}
          {state === 'building' && (
            <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="font-semibold">Đang lấy câu từ ngân hàng 40.000 câu…</p>
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div key={i} className="h-14 rounded-xl bg-lavender-soft" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </motion.div>
          )}
          {state === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg font-extrabold text-mint-dark">✓ Đề đã sẵn sàng · {result.questions.length} câu</p>
                <span className="rounded-xl bg-coral px-3 py-1 font-mono font-bold text-white">Mã phòng thi: {result.room}</span>
              </div>
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {result.questions.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-xl bg-cream px-4 py-2.5 text-sm">
                    <span className="font-display font-bold text-coral">{i + 1}</span>
                    <MathText text={q.content} className="line-clamp-1 flex-1" />
                    <LevelPill level={q.level} /><NxbBadge />
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-muted">* Bản demo dùng câu mẫu; hệ thống thật chọn từ toàn bộ 40.000 câu đã duyệt.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </ClayCard>
    </div>
  );
}
```

- [ ] **Step 3: Các section landing**

`components/landing/landing-nav.tsx`:
```tsx
import Link from 'next/link';
import { Owl } from '@/components/owl/owl';
export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-cream/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"><Owl size={40} /> thi<span className="text-coral">.ai</span>.vn</Link>
        <nav className="hidden flex-1 gap-6 text-sm font-semibold text-muted md:flex">
          <a href="#tinh-nang" className="hover:text-ink">Tính năng</a>
          <a href="#learning-zone" className="hover:text-ink">Learning Zone</a>
          <a href="#nha-truong" className="hover:text-ink">Dành cho nhà trường</a>
        </nav>
        <Link href="/dashboard" className="rounded-2xl bg-coral px-5 py-2.5 font-display font-extrabold text-white shadow-[0_5px_0_var(--color-coral-dark)] transition hover:-translate-y-0.5">Vào học thử</Link>
      </div>
    </header>
  );
}
```

`components/landing/hero.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Owl } from '@/components/owl/owl';
import { OwlBubble } from '@/components/owl/owl-bubble';
import { MathText } from '@/components/questions/math-text';

const FLOATING = [
  { text: '$x^2 - 5x + 6 = 0$', cls: 'left-0 top-10 bg-white', d: 0 },
  { text: 'I have been to Hội An ✓', cls: 'right-0 top-24 bg-mint', d: 0.6 },
  { text: '🔥 Combo x5', cls: 'left-8 bottom-16 bg-peach', d: 1.2 },
  { text: '🌱 Vùng mở rộng!', cls: 'right-6 bottom-6 bg-lavender-soft', d: 1.8 },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  return (
    <section onPointerMove={(e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      setLook({ x: Math.max(-1, Math.min(1, (e.clientX - cx) / 400)), y: Math.max(-1, Math.min(1, (e.clientY - cy) / 300)) });
    }} className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-12 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-clay">✨ Nền tảng thi & ôn luyện K12 · Toán · Tiếng Anh</span>
        <h1 className="text-5xl font-extrabold leading-[1.1] xl:text-6xl">Học <span className="text-coral">vừa sức</span>,<br />tiến bộ <span className="text-lavender-dark">mỗi ngày</span></h1>
        <p className="max-w-lg text-lg text-muted">AI đánh giá đúng năng lực, Learning Zone đưa ra câu hỏi không quá khó, không quá dễ, và mở rộng dần cùng em. Ngân hàng 40.000 câu hỏi được NXB phê duyệt.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="rounded-2xl bg-coral px-7 py-4 font-display text-lg font-extrabold text-white shadow-[0_6px_0_var(--color-coral-dark)] transition hover:-translate-y-0.5">Học thử miễn phí</Link>
          <a href="#nha-truong" className="rounded-2xl bg-white px-7 py-4 font-display text-lg font-extrabold shadow-[0_6px_0_#e3e6ff] transition hover:-translate-y-0.5">Dành cho nhà trường</a>
        </div>
      </motion.div>
      <div ref={ref} className="relative mx-auto h-[460px] w-full max-w-[520px]">
        <div className="absolute inset-10 rounded-full bg-gradient-to-br from-lavender-soft to-peach blur-2xl" />
        {FLOATING.map((f) => (
          <motion.div key={f.text} className={`absolute rounded-2xl px-4 py-3 font-semibold shadow-clay ${f.cls}`}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ opacity: { delay: 0.4 + f.d * 0.3 }, scale: { delay: 0.4 + f.d * 0.3 }, y: { duration: 4, repeat: Infinity, delay: f.d, ease: 'easeInOut' } }}>
            <MathText text={f.text} />
          </motion.div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <OwlBubble text="Chào em! Mình là Bé Cú 🦉" />
          <Owl state="idle" size={240} lookAt={look} />
        </div>
      </div>
    </section>
  );
}
```

`components/landing/stats.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { CountUp } from '@/components/ui/count-up';
import { BANK_TOTAL } from '@/lib/bank';

const STATS = [
  { value: BANK_TOTAL, suffix: '+', label: 'câu hỏi trong ngân hàng' },
  { value: 100, suffix: '%', label: 'được NXB phê duyệt' },
  { value: 2018, suffix: '', label: 'chuẩn chương trình GDPT', plain: true },
  { value: 11, suffix: '', label: 'dạng câu hỏi tương tác' },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="grid grid-cols-2 gap-4 rounded-[32px] bg-white p-8 shadow-clay-lg md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl font-extrabold text-coral xl:text-5xl">
              {s.plain ? s.value : <CountUp value={s.value} />}{s.suffix}
            </p>
            <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
```

`components/landing/pillars.tsx`:
```tsx
'use client';
import { motion } from 'motion/react';
import { TiltCard } from '@/components/ui/tilt-card';

const PILLARS = [
  { icon: '📚', title: 'Ngân hàng đề chuẩn', desc: '40.000 câu hỏi theo từng chương, bài và mức độ, đã được NXB phê duyệt. Có đủ dạng câu mới: Đúng/Sai 4 ý, trả lời ngắn, kéo thả, nghe, nói.', color: 'from-lavender-soft' },
  { icon: '🤖', title: 'AI đánh giá năng lực', desc: '12 câu thích ứng là đủ để AI vẽ bản đồ năng lực theo từng kiến thức, chỉ rõ điểm mạnh và phần cần tập trung.', color: 'from-peach' },
  { icon: '🌱', title: 'Learning Zone', desc: 'Luôn luyện ở vùng vừa sức (đúng khoảng 70–85%). Khi em vững, vùng tự mở rộng sang mức độ và kiến thức mới.', color: 'from-mint' },
];

export function Pillars() {
  return (
    <section id="tinh-nang" className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="text-center text-4xl font-extrabold">Ba trụ cột của thi.ai.vn</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
            <TiltCard className={`h-full bg-gradient-to-br ${p.color} to-white p-8`}>
              <p className="text-5xl">{p.icon}</p>
              <h3 className="mt-4 text-2xl font-extrabold">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

`components/landing/zone-teaser.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { skillsFor } from '@/lib/bank';
import type { ZoneMap } from '@/lib/engine/learning-zone';
import { ZoneRings } from '@/components/zone/zone-rings';

const skills = skillsFor('toan', 9);
const FRAMES: ZoneMap[] = [
  { 't9-hpt-khai-niem': { theta: -0.5, unlockedLevel: 'NB' }, 't9-bpt': { theta: -0.8, unlockedLevel: 'NB' }, 't9-can-bac-hai': { theta: -0.6, unlockedLevel: 'NB' } },
  { 't9-hpt-khai-niem': { theta: 0.5, unlockedLevel: 'TH' }, 't9-bpt': { theta: 0, unlockedLevel: 'TH' }, 't9-can-bac-hai': { theta: 0.3, unlockedLevel: 'TH' }, 't9-ti-so-luong-giac': { theta: -0.4, unlockedLevel: 'NB' }, 't9-ham-so-ax2': { theta: -0.4, unlockedLevel: 'NB' } },
  { 't9-hpt-khai-niem': { theta: 1.5, unlockedLevel: 'VD' }, 't9-hpt-giai': { theta: 0.4, unlockedLevel: 'TH' }, 't9-bpt': { theta: 1.2, unlockedLevel: 'VD' }, 't9-can-bac-hai': { theta: 1.4, unlockedLevel: 'VD' }, 't9-bien-doi-can': { theta: 0.2, unlockedLevel: 'TH' }, 't9-ti-so-luong-giac': { theta: 0.6, unlockedLevel: 'TH' }, 't9-ham-so-ax2': { theta: 0.5, unlockedLevel: 'TH' } },
];

export function ZoneTeaser() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 2600); return () => clearInterval(id); }, []);
  return (
    <section id="learning-zone" className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
      <div className="flex justify-center rounded-[32px] bg-white p-8 shadow-clay-lg"><ZoneRings skills={skills} map={FRAMES[i]} size={440} showLabels /></div>
      <div className="space-y-5">
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-mint-dark">Learning Zone</span>
        <h2 className="text-4xl font-extrabold leading-tight">Không quá dễ.<br />Không quá khó.<br /><span className="text-mint-dark">Mở rộng dần.</span></h2>
        <ul className="space-y-3 text-lg text-muted">
          <li>🟣 <b className="text-ink">Đã thành thạo</b>: không bắt em làm lại bài quá dễ.</li>
          <li>🟢 <b className="text-ink">Vùng học tập</b>: câu hỏi em làm đúng khoảng 70–85%, vừa sức để tiến bộ.</li>
          <li>🟠 <b className="text-ink">Quá sức</b>: tạm khoá, sẽ mở khi em sẵn sàng.</li>
        </ul>
      </div>
    </section>
  );
}
```

`components/landing/footer-cta.tsx`:
```tsx
import Link from 'next/link';
import { Owl } from '@/components/owl/owl';
export function FooterCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="flex flex-col items-center gap-6 rounded-[40px] bg-gradient-to-br from-coral to-[#ffb199] p-12 text-center text-white shadow-clay-lg md:flex-row md:text-left">
        <Owl state="cheer" size={140} />
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
```

`app/page.tsx` (thay placeholder):
```tsx
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
      <section id="nha-truong" className="mx-auto max-w-7xl space-y-8 px-6 py-24">
        <div className="max-w-3xl space-y-4">
          <span className="rounded-full bg-lavender-soft px-3 py-1 text-sm font-bold text-lavender-dark">Dành cho nhà trường & giáo viên</span>
          <h2 className="text-4xl font-extrabold leading-tight">Tổ chức thi ngay, không cần soạn đề</h2>
          <p className="text-lg text-muted">Chọn lớp, chương và ma trận mức độ, hệ thống lấy câu hỏi từ ngân hàng 40.000 câu <NxbBadge /> và tạo đề cho bài 15 phút, 45 phút, giữa kỳ, cuối kỳ chỉ trong vài giây.</p>
        </div>
        <ExamBuilderDemo />
      </section>
      <FooterCta />
    </>
  );
}
```

- [ ] **Step 4: Verify & commit**

Run: `npm test && npm run typecheck && npm run build`. Kiểm tra tay ở 1440px: Bé Cú nhìn theo chuột, các thẻ bay lơ lửng, số 40.000 đếm lên khi cuộn tới, các trụ cột nghiêng 3D, Learning Zone teaser tự nở và co lại theo vòng lặp, demo tạo đề chạy được. Ở 390px: không có cuộn ngang.

```bash
git add -A && git commit -m "feat(landing): hero with owl, stats, pillars, zone teaser, school exam builder demo"
```

---

### Task 16: Hoàn thiện luồng demo, kiểm tra cuối, deploy

**Files:**
- Modify: các file cần chỉnh sau khi chạy thử luồng demo
- Create: `README.md` (hướng dẫn chạy & kịch bản demo)

- [ ] **Step 1: Chạy kịch bản demo đầy đủ (Chrome desktop 1440px)**

Bấm **Reset demo** rồi đi đúng thứ tự: Landing → "Học thử miễn phí" → Dashboard → Đánh giá AI Toán (sai vài câu căn bậc hai) → Báo cáo → "Vào Learning Zone" → Luyện ngay → thấy vùng mở rộng → thoát, quay về Dashboard (radar và zone đã cập nhật) → Phòng thi → bài 15 phút → làm 2 câu → reload → nộp → kết quả.

Ghi lại mọi chỗ giật, chỗ trống trơn hoặc lỗi console. Sửa từng lỗi, mỗi lần sửa một commit riêng.

- [ ] **Step 2: Kiểm tra reduced motion và độ rộng màn hình hẹp**

Bật Chrome DevTools → Rendering → "prefers-reduced-motion: reduce": mọi trang vẫn dùng được, không có animation lặp vô hạn. Kiểm tra ở chiều rộng 390px: không có cuộn ngang trên mọi route.

- [ ] **Step 3: README**

`README.md`:
````markdown
# thi.ai.vn — Mockup

Clickable prototype nền tảng thi & ôn luyện K12 (Toán, Tiếng Anh). Frontend-only, dữ liệu mẫu, logic mô phỏng chạy thật.

## Chạy
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit test engine + component
```

## Kịch bản demo (~5 phút)
1. `/` Landing → "Học thử miễn phí"
2. `/dashboard` → "Làm bài đánh giá"
3. `/danh-gia` → 12 câu thích ứng → báo cáo → "Vào Learning Zone"
4. `/learning-zone` → "Luyện ngay" → trả lời đúng liên tục để thấy vùng mở rộng
5. `/phong-thi` → bài 15 phút → thử reload / chuyển tab → nộp bài

Nút ↺ trên thanh điều hướng = Reset demo. Bộ chọn "Lớp" đổi khối 6/9/12.

## Cấu trúc
- `lib/engine/*`: IRT/Rasch, đánh giá thích ứng, Learning Zone, chấm thi (hàm thuần, có test)
- `lib/bank/*`: khung chương trình, câu hỏi mẫu, đề thi
- `components/questions/*`: 11 dạng câu hỏi
- `components/owl/owl.tsx`: Bé Cú (thay bằng Rive sau này mà không đổi interface `state`)
````

- [ ] **Step 4: Full verification**

Run: `npm run lint && npm run typecheck && npm test && npm run build` → Expected: tất cả pass, không có warning về hydration.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: README with demo script; polish from demo walkthrough"
```

- [ ] **Step 6: Deploy lên Vercel (cần người dùng đăng nhập)**

Vercel CLI chưa được cài. Nhờ người dùng chạy:
```
! npm i -g vercel && vercel login
```
Sau đó chạy:
```bash
vercel deploy --yes          # preview URL để chia sẻ
```
Mở URL preview và chạy lại nhanh kịch bản demo trên bản deploy.

---

## Self-review notes

- Spec §4 (routes): Tasks 10–15 ✓. §5 Learning Zone: Task 4 + 12 ✓. §6 dạng câu hỏi (11 dạng): Task 9 ✓. §7.1 bank: Task 3 ✓. §7.2–7.4: Task 4 ✓. §7.5 gamification: Task 5 + 6 ✓. §7.6 phòng thi: Task 5 + 13 ✓. §7.7 trạng thái/seed/reset: Task 6 + 8 ✓. §8 hình ảnh/Bé Cú/animation: Task 1 + 7 ✓. §9 stack/test/deploy: Task 1 + 16 ✓. Teaser nhà trường: Task 15 ✓. Công tắc lớp: Task 8 ✓.
- Review Focus đã gắn test vào: #1 Task 5 (`exam.test` timer/reload) + Task 13 (resume, tự nộp khi hết hạn); #2 Task 2 (`normalizeNumber`); #3 Task 4 (`pickNextQuestion` null/fallback) + Task 10 (runner kết thúc khi `next()` null); #4 Task 3 (helpers cho mọi lớp) + Task 6 (`ensureZone` theo khoá) + Task 14 (dashboard lớp 6/12); #5 Task 6 (`sanitizePersisted`).
