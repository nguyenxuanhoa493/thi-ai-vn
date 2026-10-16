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
  const answered = value !== null && typeof value === 'object' && !Array.isArray(value) && 'x' in value;
  const p = answered ? (value as GraphPoint) : { x: 0, y: 0 };
  const good = answered && p.x === q.answer.x && p.y === q.answer.y;
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
    <div className="flex flex-wrap items-start gap-6">
      <svg ref={svgRef} viewBox="0 0 360 360" className="w-full max-w-[360px] touch-none rounded-2xl bg-white shadow-clay"
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
        {answered && <motion.circle r={9} fill={reveal ? (good ? '#3ccf8e' : '#ffb4a2') : '#ff8a65'} stroke="#fff" strokeWidth={3} animate={{ cx, cy }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }} style={{ cursor: disabled ? 'default' : 'grab' }} />}
      </svg>
      <div className="rounded-2xl bg-white p-4 shadow-clay">
        <p className="text-sm text-muted">Điểm đang chọn</p>
        {answered ? <p className="font-display text-2xl font-extrabold">({p.x}; {p.y})</p> : <p className="text-sm font-semibold">Bấm lên lưới để đặt điểm</p>}
        <p className="mt-2 text-xs text-muted">Bấm hoặc kéo trên lưới để di chuyển điểm</p>
      </div>
    </div>
  );
}
