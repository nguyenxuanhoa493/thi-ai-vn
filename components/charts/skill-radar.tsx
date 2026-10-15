'use client';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

export function SkillRadar({ data, color = '#a8b5ff' }: { data: { name: string; score: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e3e6ff" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6f8a' }} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.45} isAnimationActive animationDuration={1200} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
