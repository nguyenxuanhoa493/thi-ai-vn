'use client';
import { motion, useReducedMotion } from 'motion/react';
import { Lock, Sprout, Star, Telescope } from 'lucide-react';
import type { Skill } from '@/lib/bank/types';
import { skillZone, zoneExtent, type ZoneMap } from '@/lib/engine/learning-zone';

const ZONE_COLOR = { mastered: '#8b95e0', learning: '#22c55e', challenge: '#b39dff' } as const;

export function ZoneRings({ skills, map, size = 380, showLabels = false, highlight }: {
  skills: Skill[]; map: ZoneMap; size?: number; showLabels?: boolean; highlight?: string;
}) {
  const reduce = useReducedMotion();
  const pad = showLabels ? 110 : 0;
  const c = size / 2;
  const outer = c - 10;
  const extent = zoneExtent(map, skills);
  const masteredCount = skills.filter((s) => skillZone(map[s.id]).zone === 'mastered').length;
  const rLearn = outer * (0.42 + 0.45 * extent);
  const rMaster = outer * (0.16 + 0.22 * (skills.length ? masteredCount / skills.length : 0));
  const spring = { type: 'spring', stiffness: 60, damping: 14 } as const;

  return (
    <svg viewBox={`${-pad} 0 ${size + 2 * pad} ${size}`} width="100%" style={{ maxWidth: size + 2 * pad }} role="img" aria-label="Sơ đồ Learning Zone">
      <circle cx={c} cy={c} r={outer} fill="#f3efff" />
      <text x={c + 8} y={24} textAnchor="middle" fontSize={11} fill="#7c83db" fontWeight={700}>SẮP KHÁM PHÁ</text>
      <Telescope aria-hidden x={c - 52} y={13} width={13} height={13} stroke="#7c83db" strokeWidth={2.5} />
      <motion.circle data-testid="ring-learning" data-extent={extent.toFixed(3)} cx={c} cy={c} fill="#c9f2dc"
        initial={false} animate={{ r: rLearn }} transition={spring} />
      <motion.circle cx={c} cy={c} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 6"
        initial={false} animate={{ r: rLearn, rotate: 360 }} transition={{ r: spring, rotate: { duration: 60, repeat: Infinity, ease: 'linear' } }}
        style={{ originX: '50%', originY: '50%' }} />
      <motion.circle cx={c} cy={c} fill="#dfe6ff" initial={false} animate={{ r: rMaster }} transition={spring} />
      {skills.map((s, i) => {
        const { zone, p } = skillZone(map[s.id]);
        // số kiến thức chẵn: lệch nửa bước để không có chấm nằm ngay đáy, đè lên nhãn LEARNING ZONE
        const angle = ((i + (skills.length % 2 === 0 ? 0.5 : 0)) / skills.length) * Math.PI * 2 - Math.PI / 2;
        const r = zone === 'mastered' ? rMaster * 0.6
          : zone === 'learning' ? rMaster + (rLearn - rMaster) * (1 - Math.min(1, p) * 0.7)
          : rLearn + (outer - rLearn) * 0.55;
        // làm tròn: Math.cos/sin trên server (Node) và trình duyệt có thể lệch ở chữ số cuối → lỗi hydration
        const x = Math.round((c + Math.cos(angle) * r) * 100) / 100;
        const y = Math.round((c + Math.sin(angle) * r) * 100) / 100;
        const hl = highlight === s.id;
        const right = Math.cos(angle) >= 0;
        return (
          <g key={s.id}>
            <motion.circle data-testid={`dot-${s.id}`} data-zone={zone} initial={false}
              animate={{ cx: x, cy: y, r: hl ? 10 : 7, fill: ZONE_COLOR[zone] }} transition={spring}
              stroke="#fff" strokeWidth={2.5} />
            {hl && (reduce
              ? <circle cx={x} cy={y} r={15} fill="none" stroke={ZONE_COLOR[zone]} strokeWidth={2} opacity={0.5} />
              : <motion.circle cx={x} cy={y} fill="none" stroke={ZONE_COLOR[zone]} strokeWidth={2}
                animate={{ r: [10, 20], opacity: [0.8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />)}
            {showLabels && (
              <motion.g initial={false} animate={{ x: x + (right ? 12 : -12), y: y + 4 }} transition={spring}>
                {zone === 'challenge' && <Lock aria-hidden x={right ? 1 : -11} y={-10} width={10} height={10} stroke="#7c83db" strokeWidth={2.5} />}
                <text x={zone === 'challenge' ? (right ? 14 : -14) : 0} textAnchor={right ? 'start' : 'end'} fontSize={11} fill="#2b2d42" fontWeight={500}>
                  {s.name.length > 22 && <title>{s.name}</title>}{s.name.length > 22 ? `${s.name.slice(0, 21)}…` : s.name}</text>
              </motion.g>
            )}
          </g>
        );
      })}
      {/* nhãn nằm trên từng vòng; viền nền (paintOrder) giữ chữ đọc được khi đè lên chấm/tên kiến thức */}
      {showLabels && (
        <text x={c} y={c + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#5b64c2"
          stroke="#dfe6ff" strokeWidth={4} paintOrder="stroke">
          ĐÃ VỮNG<tspan x={c} dy={14} fontSize={10} fontWeight={600}>{masteredCount} kiến thức</tspan>
        </text>
      )}
      {showLabels && <Star aria-hidden x={c - 44} y={c - 8} width={13} height={13} stroke="#5b64c2" fill="#5b64c2" strokeWidth={2} />}
      <text x={c} y={c + rLearn - 22} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1f8a57"
        stroke="#c9f2dc" strokeWidth={4} paintOrder="stroke">
        VỪA SỨC{size >= 300 && <tspan x={c} dy={13} fontSize={10} fontWeight={600}>luyện ở đây · đúng ~75%</tspan>}
      </text>
      <Sprout aria-hidden x={c - 50} y={c + rLearn - 34} width={14} height={14} stroke="#1f8a57" strokeWidth={2.5} />
    </svg>
  );
}
