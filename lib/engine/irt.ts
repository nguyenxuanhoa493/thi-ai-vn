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
