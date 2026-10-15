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
