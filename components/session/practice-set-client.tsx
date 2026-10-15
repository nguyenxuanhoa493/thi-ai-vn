'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPracticeSet } from '@/lib/bank/practice-sets';
import { getQuestion } from '@/lib/bank';
import { useDemo } from '@/lib/store/demo-store';
import { PracticeRunner } from '@/components/session/practice-runner';
import { ClayCard } from '@/components/ui/clay-card';
import type { Question } from '@/lib/bank/types';

export function PracticeSetClient({ id }: { id: string }) {
  const router = useRouter();
  const set = getPracticeSet(id);
  const recordAnswer = useDemo((s) => s.recordAnswer);
  const idx = useRef(0);
  if (!set) return <ClayCard className="p-10 text-center">Không tìm thấy bộ đề.</ClayCard>;
  const questions = set.questionIds.map(getQuestion).filter(Boolean) as Question[];
  return (
    <PracticeRunner
      title={set.title}
      maxQuestions={questions.length}
      next={() => questions[idx.current++] ?? null}
      onAnswered={(q, r) => recordAnswer(set.subject, q, r.correct)}
      onExit={() => router.push('/luyen-tap')}
    />
  );
}
