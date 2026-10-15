'use client';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useId } from 'react';

export type OwlState = 'idle' | 'thinking' | 'correct' | 'wrong' | 'celebrate' | 'cheer';

const body: Variants = {
  idle: { y: [0, -4, 0], rotate: 0, scaleY: 1, transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  thinking: { y: 0, rotate: [-3, 3, -3], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  correct: { y: [0, -26, 0, -8, 0], scaleY: [1, 0.92, 1.05, 0.98, 1], rotate: 0, transition: { duration: 0.8 } },
  wrong: { y: 0, rotate: -10, transition: { type: 'spring', stiffness: 220, damping: 10 } },
  celebrate: { y: [0, -32, 0], rotate: [0, 360], transition: { duration: 0.9, ease: 'easeOut' } },
  cheer: { y: [0, -8, 0], rotate: 0, transition: { duration: 0.6, repeat: Infinity } },
};
const wing = (side: 1 | -1): Variants => ({
  idle: { rotate: 0 },
  thinking: { rotate: 0 },
  correct: { rotate: [0, side * -35, 0], transition: { duration: 0.5 } },
  wrong: { rotate: side * 8 },
  celebrate: { rotate: [0, side * -40, 0, side * -40, 0], transition: { duration: 0.9 } },
  cheer: { rotate: [0, side * -35, 0], transition: { duration: 0.35, repeat: Infinity } },
});
const antenna: Variants = {
  idle: { scale: 1, fill: '#ff8a65' },
  thinking: { scale: [1, 1.35, 1], fill: ['#ff8a65', '#ffd166', '#ff8a65'], transition: { duration: 0.9, repeat: Infinity } },
  correct: { scale: 1.2, fill: '#3ccf8e' },
  wrong: { scale: 1, fill: '#ffb3a7' },
  celebrate: { scale: [1, 1.5, 1], fill: '#ffd166', transition: { duration: 0.5, repeat: 2 } },
  cheer: { scale: 1.1, fill: '#ffd166' },
};

const STATE_LABEL: Record<OwlState, string> = {
  idle: 'đang chờ', thinking: 'đang suy nghĩ', correct: 'vui vì em làm đúng', wrong: 'động viên em', celebrate: 'ăn mừng', cheer: 'cổ vũ',
};

export function Owl({ state = 'idle', size = 140, lookAt }: { state?: OwlState; size?: number; lookAt?: { x: number; y: number } }) {
  const reduce = useReducedMotion();
  const shineId = `owlShine-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const happy = state === 'correct' || state === 'celebrate' || state === 'cheer';
  const px = (lookAt?.x ?? (state === 'wrong' ? -0.6 : 0)) * 3;
  const py = (lookAt?.y ?? (state === 'wrong' ? 0.5 : 0)) * 3;
  return (
    <motion.svg
      role="img" aria-label={`Bé Cú (${STATE_LABEL[state]})`} data-state={state}
      width={size} height={size * 0.95} viewBox="0 0 150 142"
      variants={body} animate={reduce ? undefined : state} initial={false}
      style={{ originX: 0.5, originY: 1, overflow: 'visible' }}
    >
      <ellipse cx="75" cy="134" rx="40" ry="6" fill="#c9cdf5" opacity="0.6" />
      <line x1="75" y1="12" x2="75" y2="28" stroke="#7c83db" strokeWidth="4" strokeLinecap="round" />
      <motion.circle cx="75" cy="10" r="7" fill="#ff8a65" variants={antenna} animate={reduce ? undefined : state} style={{ originX: 0.5, originY: 0.5 }} />
      <motion.ellipse cx="28" cy="84" rx="12" ry="24" fill="#8f9cf0" variants={wing(-1)} animate={reduce ? undefined : state} style={{ originX: 0.8, originY: 0.2 }} />
      <motion.ellipse cx="122" cy="84" rx="12" ry="24" fill="#8f9cf0" variants={wing(1)} animate={reduce ? undefined : state} style={{ originX: 0.2, originY: 0.2 }} />
      <rect x="28" y="28" width="94" height="100" rx="42" fill="#a8b5ff" />
      <rect x="28" y="28" width="94" height="100" rx="42" fill={`url(#${shineId})`} />
      <defs>
        <radialGradient id={shineId} cx="0.35" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="38" y="42" width="74" height="50" rx="24" fill="#fff" />
      {happy ? (
        <g stroke="#2b2d42" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M51 68 Q60 58 69 68" />
          <path d="M81 68 Q90 58 99 68" />
        </g>
      ) : (
        <g>
          <motion.g
            animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
            style={{ originY: '66px' }}
          >
            <ellipse cx="60" cy="66" rx="9" ry="11" fill="#2b2d42" />
            <ellipse cx="90" cy="66" rx="9" ry="11" fill="#2b2d42" />
          </motion.g>
          <circle cx={63 + px} cy={62 + py} r="3" fill="#fff" />
          <circle cx={93 + px} cy={62 + py} r="3" fill="#fff" />
        </g>
      )}
      <path d="M70 80 L75 86 L80 80 Z" fill="#ff8a65" />
      {state === 'wrong' && <path d="M104 46 q4 8 0 12 q-4 -4 0 -12" fill="#8ec5ff" />}
      <ellipse cx="75" cy="110" rx="22" ry="12" fill="#c6cfff" />
      <circle cx="46" cy="86" r="5" fill="#ffb3a7" opacity="0.6" />
      <circle cx="104" cy="86" r="5" fill="#ffb3a7" opacity="0.6" />
    </motion.svg>
  );
}
