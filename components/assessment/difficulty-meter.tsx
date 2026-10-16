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
