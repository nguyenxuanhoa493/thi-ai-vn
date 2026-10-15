'use client';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import type { SpeakAnswer, SpeakQuestion } from '@/lib/bank/types';
import { speak } from './mcq';
import type { QuestionProps } from './types';

export function SpeakView({ question: q, value, onChange, disabled }: QuestionProps<SpeakQuestion>) {
  const [recording, setRecording] = useState(false);
  const start = useRef(0);
  const rec = useRef<MediaRecorder | null>(null);
  const done = (value as SpeakAnswer | null)?.durationMs;

  const begin = async () => {
    start.current = Date.now();
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      rec.current = new MediaRecorder(stream);
      rec.current.start();
    } catch { rec.current = null; /* không có mic: vẫn mô phỏng theo thời gian bấm giữ */ }
  };
  const end = () => {
    if (!recording) return;
    setRecording(false);
    rec.current?.stop();
    rec.current?.stream.getTracks().forEach((t) => t.stop());
    onChange({ durationMs: Date.now() - start.current });
  };

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-white p-5 font-display text-2xl font-semibold shadow-clay">“{q.target}”</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => speak(q.target)} className="rounded-2xl bg-lavender-soft px-4 py-3 font-semibold text-lavender-dark">🔊 Nghe mẫu</button>
        <motion.button type="button" disabled={disabled}
          onPointerDown={begin} onPointerUp={end} onPointerLeave={end}
          animate={recording ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ repeat: recording ? Infinity : 0, duration: 0.8 }}
          className={`flex items-center gap-3 rounded-2xl px-6 py-3 font-bold text-white shadow-[0_6px_0_var(--color-coral-dark)] ${recording ? 'bg-peach-dark' : 'bg-coral'}`}>
          🎙️ {recording ? 'Đang ghi… thả ra để dừng' : 'Nhấn giữ để nói'}
        </motion.button>
        {recording && (
          <div className="flex h-10 items-end gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.span key={i} className="w-1.5 rounded-full bg-coral" animate={{ height: [6, 30, 10, 24, 6] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.06 }} />
            ))}
          </div>
        )}
        {done !== undefined && !recording && <span className="text-sm text-muted">Đã ghi {(done / 1000).toFixed(1)} giây</span>}
      </div>
    </div>
  );
}
