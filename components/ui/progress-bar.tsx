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
