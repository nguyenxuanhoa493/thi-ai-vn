import { LEVEL_LABEL, type Level } from '@/lib/bank/types';
const STYLE: Record<Level, string> = {
  NB: 'bg-mint text-mint-dark', TH: 'bg-lavender-soft text-lavender-dark', VD: 'bg-[#fff1d6] text-[#b7791f]', VDC: 'bg-peach text-peach-dark',
};
export function LevelPill({ level }: { level: Level }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[level]}`}>{LEVEL_LABEL[level]}</span>;
}
