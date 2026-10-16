'use client';
import { useState } from 'react';
import { Owl, type OwlState } from '@/components/owl/owl';
import { ClayButton } from '@/components/ui/clay-button';
import { fireConfetti } from '@/lib/ui/confetti';

const STATES: OwlState[] = ['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'cheer'];
export default function OwlDev() {
  const [s, setS] = useState<OwlState>('idle');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <Owl state={s} size={220} />
      <div className="flex flex-wrap gap-3">
        {STATES.map((x) => (
          <ClayButton key={x} variant={x === s ? 'primary' : 'ghost'} onClick={() => { setS(x); if (x === 'celebrate') fireConfetti(); }}>{x}</ClayButton>
        ))}
      </div>
    </main>
  );
}
