'use client';
import { motion } from 'motion/react';
// Không dùng AnimatePresence mode="wait": khi trang bị Next giữ ẩn trong <Activity> (cacheComponents),
// animation thoát không bao giờ kết thúc và bong bóng kẹt ở câu cũ. Đổi key = remount với hiệu ứng vào.
export function OwlBubble({ text, side = 'right' }: { text: string | null; side?: 'left' | 'right' }) {
  if (!text) return null;
  return (
    <motion.div key={text}
      initial={{ opacity: 0, scale: 0.8, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`relative max-w-xs rounded-2xl bg-white px-4 py-2.5 text-sm font-medium shadow-clay ${side === 'right' ? 'origin-bottom-left' : 'origin-bottom-right'}`}>
      {text}
    </motion.div>
  );
}
