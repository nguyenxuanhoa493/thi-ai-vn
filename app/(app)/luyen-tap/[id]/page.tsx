import { practiceSetsFor } from '@/lib/bank/practice-sets';
import type { Subject, Grade } from '@/lib/bank/types';
import { PracticeSetClient } from '@/components/session/practice-set-client';

// Next 16 cacheComponents: dynamic params must be known at build time (or wrapped in Suspense).
export function generateStaticParams() {
  const ids: { id: string }[] = [];
  for (const subject of ['toan', 'anh'] as Subject[])
    for (const grade of [6, 9, 12] as Grade[])
      for (const s of practiceSetsFor(subject, grade)) ids.push({ id: s.id });
  return ids;
}

export default async function PracticeSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PracticeSetClient id={id} />;
}
