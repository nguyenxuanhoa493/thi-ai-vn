'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { useDemo } from './demo-store';

const subscribe = (cb: () => void) => useDemo.persist.onFinishHydration(cb);
const getSnapshot = () => useDemo.persist.hasHydrated();
const getServerSnapshot = () => false;

/** Rehydrate store từ localStorage sau khi mount để tránh hydration mismatch. */
export function useHydrated(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (!useDemo.persist.hasHydrated()) void useDemo.persist.rehydrate();
  }, []);
  return hydrated;
}
