'use client';
import { Volume2, VolumeX } from 'lucide-react';
import { useDemo } from '@/lib/store/demo-store';
import { useHydrated } from '@/lib/store/use-hydrated';

/** Nút bật/tắt âm thanh cho landing; chỉ hiện sau hydrate vì trạng thái lấy từ localStorage. */
export function SoundToggle() {
  const hydrated = useHydrated();
  const soundOn = useDemo((s) => s.soundOn);
  const toggleSound = useDemo((s) => s.toggleSound);
  if (!hydrated) return <span aria-hidden className="inline-block h-9 w-11" />;
  return (
    <button type="button" title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
      onClick={toggleSound} className="grid h-9 place-items-center rounded-xl bg-white px-3 text-sm shadow-clay hover:text-coral">{soundOn ? <Volume2 aria-hidden size={18} /> : <VolumeX aria-hidden size={18} />}</button>
  );
}
