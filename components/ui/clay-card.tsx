import type { HTMLAttributes } from 'react';
export function ClayCard({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-clay)] bg-white p-5 shadow-clay ${className}`} {...rest} />;
}
