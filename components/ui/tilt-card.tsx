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
