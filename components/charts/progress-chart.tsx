'use client';
import { useReducedMotion } from 'motion/react';
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SUBJECT_LABEL, type Subject } from '@/lib/bank/types';

export const SUBJECT_COLOR: Record<Subject, string> = { toan: '#7c83db', anh: '#ff8a65' };
export const MILESTONE_LABEL = { assessment: '🎯 Đánh giá AI', 'zone-expand': '🌱 Vùng mở rộng' } as const;

export interface ProgressRow { label: string; toan?: number; anh?: number }
export interface ProgressMark { label: string; subject: Subject; score: number; kind: keyof typeof MILESTONE_LABEL }

export function ProgressChart({ data, marks, subjects }: { data: ProgressRow[]; marks: ProgressMark[]; subjects: Subject[] }) {
  const reduce = useReducedMotion();
  return (
    <div role="img" aria-label="Biểu đồ năng lực theo thời gian">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 28, right: 16, bottom: 4, left: -16 }}>
          <CartesianGrid stroke="#e3e6ff" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b6f8a' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: '#6b6f8a' }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(v, name) => [`${v} điểm`, SUBJECT_LABEL[name as Subject] ?? String(name)]}
            labelFormatter={(l) => `Ngày ${l}`}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(124,131,219,.25)' }}
          />
          {subjects.map((s) => (
            <Line key={s} type="monotone" dataKey={s} name={s} stroke={SUBJECT_COLOR[s]} strokeWidth={3} connectNulls
              dot={{ r: 3, strokeWidth: 0, fill: SUBJECT_COLOR[s] }} activeDot={{ r: 5 }}
              isAnimationActive={!reduce} animationDuration={1200} />
          ))}
          {marks.map((m, i) => (
            <ReferenceDot key={`${m.kind}-${m.subject}-${m.label}-${i}`} x={m.label} y={m.score} r={6} fill="#fff" stroke={SUBJECT_COLOR[m.subject]} strokeWidth={3}
              ifOverflow="visible"
              label={{ value: MILESTONE_LABEL[m.kind], position: 'top', fontSize: 10, fill: '#6b6f8a', offset: 8 + (i % 2) * 12 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
