'use client';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { ChatWidget } from '@/components/chat/chat-widget';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      {children}
      <Suspense fallback={null}><ChatWidget /></Suspense>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 18, fontFamily: 'var(--font-be-vietnam)' } }} />
    </MotionConfig>
  );
}
