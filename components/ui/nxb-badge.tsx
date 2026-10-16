import { BadgeCheck } from 'lucide-react';

export function NxbBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-mint-dark ${className}`}>
      <BadgeCheck aria-hidden size={14} strokeWidth={2.5} /> NXB phê duyệt
    </span>
  );
}
