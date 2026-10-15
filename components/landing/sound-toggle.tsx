'use client';
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
      onClick={toggleSound} className="h-9 rounded-xl bg-white px-3 text-sm shadow-clay hover:text-coral">{soundOn ? '🔊' : '🔇'}</button>
  );
}
