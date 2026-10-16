'use client';
import { useCallback } from 'react';
import { playSfx, type SfxName } from './sfx';

/** play() ổn định; trạng thái bật/tắt được đọc từ store ngay lúc phát. */
export function useSfx() {
  return useCallback((name: SfxName) => playSfx(name), []);
}
