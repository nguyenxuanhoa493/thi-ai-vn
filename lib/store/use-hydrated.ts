'use client';
import { useEffect, useState } from 'react';
import { useDemo } from './demo-store';

/** Rehydrate store từ localStorage sau khi mount để tránh hydration mismatch. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useDemo.persist.hasHydrated());
  useEffect(() => {
    const unsub = useDemo.persist.onFinishHydration(() => setHydrated(true));
    if (!useDemo.persist.hasHydrated()) void useDemo.persist.rehydrate();
    else setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
