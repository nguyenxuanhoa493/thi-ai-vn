'use client';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

type TickProps = { x?: number; y?: number; textAnchor?: 'start' | 'middle' | 'end' | 'inherit'; payload?: { value: string } };
function Tick({ x, y, textAnchor, payload }: TickProps) {
  const full = payload?.value ?? '';
  const short = full.length > 18 ? `${full.slice(0, 17)}…` : full;
  return <text x={x} y={y} textAnchor={textAnchor} fontSize={11} fill="#6b6f8a"><title>{full}</title>{short}</text>;
}

export function SkillRadar({ data, color = '#a8b5ff' }: { data: { name: string; score: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e3e6ff" />
        <PolarAngleAxis dataKey="name" tick={<Tick />} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.45} isAnimationActive animationDuration={1200} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
