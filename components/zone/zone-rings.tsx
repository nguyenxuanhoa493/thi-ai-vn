'use client';
import { motion } from 'motion/react';
import type { Skill } from '@/lib/bank/types';
import { skillZone, zoneExtent, type ZoneMap } from '@/lib/engine/learning-zone';

const ZONE_COLOR = { mastered: '#8b95e0', learning: '#22c55e', challenge: '#ff8a65' } as const;

export function ZoneRings({ skills, map, size = 380, showLabels = false, highlight }: {
  skills: Skill[]; map: ZoneMap; size?: number; showLabels?: boolean; highlight?: string;
}) {
  const c = size / 2;
  const outer = c - 10;
  const extent = zoneExtent(map, skills);
  const masteredCount = skills.filter((s) => skillZone(map[s.id]).zone === 'mastered').length;
  const rLearn = outer * (0.42 + 0.45 * extent);
  const rMaster = outer * (0.16 + 0.22 * (skills.length ? masteredCount / skills.length : 0));
  const spring = { type: 'spring', stiffness: 60, damping: 14 } as const;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Sơ đồ Learning Zone">
      <circle cx={c} cy={c} r={outer} fill="#ffe1d9" />
      <text x={c} y={24} textAnchor="middle" fontSize={11} fill="#c0563a" fontWeight={600}>QUÁ SỨC</text>
      <motion.circle data-testid="ring-learning" data-extent={extent.toFixed(3)} cx={c} cy={c} fill="#c9f2dc"
        initial={false} animate={{ r: rLearn }} transition={spring} />
      <motion.circle cx={c} cy={c} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 6"
        initial={false} animate={{ r: rLearn, rotate: 360 }} transition={{ r: spring, rotate: { duration: 60, repeat: Infinity, ease: 'linear' } }}
        style={{ originX: '50%', originY: '50%' }} />
      <motion.circle cx={c} cy={c} fill="#dfe6ff" initial={false} animate={{ r: rMaster }} transition={spring} />
      <text x={c} y={c + rLearn - 14} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1f8a57">LEARNING ZONE</text>
      {skills.map((s, i) => {
        const { zone, p } = skillZone(map[s.id]);
        const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
        const r = zone === 'mastered' ? rMaster * 0.6
          : zone === 'learning' ? rMaster + (rLearn - rMaster) * (1 - Math.min(1, p) * 0.7)
          : rLearn + (outer - rLearn) * 0.55;
        const x = c + Math.cos(angle) * r;
        const y = c + Math.sin(angle) * r;
        const hl = highlight === s.id;
        return (
          <g key={s.id}>
            <motion.circle data-testid={`dot-${s.id}`} data-zone={zone} initial={false}
              animate={{ cx: x, cy: y, r: hl ? 10 : 7, fill: ZONE_COLOR[zone] }} transition={spring}
              stroke="#fff" strokeWidth={2.5} />
            {hl && <motion.circle cx={x} cy={y} fill="none" stroke={ZONE_COLOR[zone]} strokeWidth={2}
              animate={{ r: [10, 20], opacity: [0.8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />}
            {showLabels && (
              <motion.text initial={false} animate={{ x: x + (Math.cos(angle) >= 0 ? 12 : -12), y: y + 4 }} transition={spring}
                textAnchor={Math.cos(angle) >= 0 ? 'start' : 'end'} fontSize={11} fill="#2b2d42" fontWeight={500}>{s.name}</motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
