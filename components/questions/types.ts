import type { AnswerValue, Question } from '@/lib/bank/types';
export interface QuestionProps<Q extends Question = Question> {
  question: Q; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled: boolean; reveal: boolean;
}
export const resultClass = (r: 'correct' | 'wrong' | 'missed' | null) =>
  r === 'correct' ? 'bg-mint ring-2 ring-mint-dark' : r === 'wrong' ? 'bg-peach ring-2 ring-peach-dark' : r === 'missed' ? 'ring-2 ring-dashed ring-mint-dark' : '';
