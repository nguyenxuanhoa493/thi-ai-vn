'use client';
import type { AnswerValue, Question } from '@/lib/bank/types';
import { skillName } from '@/lib/bank';
import { LevelPill } from '@/components/ui/level-pill';
import { NxbBadge } from '@/components/ui/nxb-badge';
import { MathText } from './math-text';
import { McqView } from './mcq';
import { MultiView } from './multi';
import { Tf4View } from './tf4';
import { ShortView } from './short';
import { OrderView } from './order';
import { MatchView } from './match';
import { FillView } from './fill';
import { GraphView } from './graph';
import { SpeakView } from './speak';
import { WriteView } from './write';
import { useSfx } from '@/lib/ui/use-sfx';

interface Props {
  question: Question; value: AnswerValue; onChange: (v: AnswerValue) => void;
  disabled: boolean; reveal: boolean; index?: number; showMeta?: boolean;
}

export function QuestionView({ question: q, index, showMeta = true, onChange, ...rest }: Props) {
  const play = useSfx();
  // phát 'select' chỉ khi người dùng đổi đáp án (onChange do component con gọi), không phát với giá trị khởi tạo
  const p = { ...rest, onChange: (v: AnswerValue) => { play('select'); onChange(v); } };
  const body = (() => {
    switch (q.type) {
      case 'mcq': case 'listen': return <McqView question={q} {...p} />;
      case 'multi': return <MultiView question={q} {...p} />;
      case 'tf4': return <Tf4View question={q} {...p} />;
      case 'short': return <ShortView question={q} {...p} />;
      case 'order': return <OrderView question={q} {...p} />;
      case 'match': return <MatchView question={q} {...p} />;
      case 'fill': return <FillView question={q} {...p} />;
      case 'graph': return <GraphView question={q} {...p} />;
      case 'speak': return <SpeakView question={q} {...p} />;
      case 'write': return <WriteView question={q} {...p} />;
    }
  })();
  return (
    <div className="space-y-5">
      {showMeta && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {index !== undefined && <span className="font-display font-extrabold text-coral">Câu {index}</span>}
          <LevelPill level={q.level} />
          <span className="text-muted">{skillName(q.skillId)}</span>
          <NxbBadge className="ml-auto" />
        </div>
      )}
      <h2 className="text-xl font-semibold leading-relaxed"><MathText text={q.content} /></h2>
      <div key={q.id}>{body}</div>
    </div>
  );
}
