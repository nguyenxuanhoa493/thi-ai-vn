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
