'use client';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { useHydrated } from '@/lib/store/use-hydrated';
import { ChatWidget } from '@/components/chat/chat-widget';

export function Providers({ children }: { children: React.ReactNode }) {
  useHydrated(); // rehydrate store một lần ở mọi trang (landing cũng đọc soundOn đã lưu); không render UI phụ thuộc store
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      {children}
      <Suspense fallback={null}><ChatWidget /></Suspense>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 18, fontFamily: 'var(--font-be-vietnam)' } }} />
    </MotionConfig>
  );
}
