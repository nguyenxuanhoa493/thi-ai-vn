'use client';
import { useEffect, useState } from 'react';
import { Sprout, Star, Telescope } from 'lucide-react';
import { skillsFor } from '@/lib/bank';
import type { ZoneMap } from '@/lib/engine/learning-zone';
import { ZoneRings } from '@/components/zone/zone-rings';

const skills = skillsFor('toan', 9);
const FRAMES: ZoneMap[] = [
  { 't9-hpt-khai-niem': { theta: -0.5, unlockedLevel: 'NB' }, 't9-bpt': { theta: -0.8, unlockedLevel: 'NB' }, 't9-can-bac-hai': { theta: -0.6, unlockedLevel: 'NB' } },
  { 't9-hpt-khai-niem': { theta: 0.5, unlockedLevel: 'TH' }, 't9-bpt': { theta: 0, unlockedLevel: 'TH' }, 't9-can-bac-hai': { theta: 0.3, unlockedLevel: 'TH' }, 't9-ti-so-luong-giac': { theta: -0.4, unlockedLevel: 'NB' }, 't9-ham-so-ax2': { theta: -0.4, unlockedLevel: 'NB' } },
  { 't9-hpt-khai-niem': { theta: 1.5, unlockedLevel: 'VD' }, 't9-hpt-giai': { theta: 0.4, unlockedLevel: 'TH' }, 't9-bpt': { theta: 1.2, unlockedLevel: 'VD' }, 't9-can-bac-hai': { theta: 1.4, unlockedLevel: 'VD' }, 't9-bien-doi-can': { theta: 0.2, unlockedLevel: 'TH' }, 't9-ti-so-luong-giac': { theta: 0.6, unlockedLevel: 'TH' }, 't9-ham-so-ax2': { theta: 0.5, unlockedLevel: 'TH' } },
];

export function ZoneTeaser() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 2600); return () => clearInterval(id); }, []);
  return (
    <section id="learning-zone" className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 py-16 lg:grid-cols-2">
      <div className="flex justify-center rounded-[32px] bg-white p-8 shadow-clay-lg"><ZoneRings skills={skills} map={FRAMES[i]} size={440} showLabels /></div>
      <div className="space-y-5">
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-mint-dark">Learning Zone</span>
        <h2 className="text-4xl font-extrabold leading-tight">Không quá dễ.<br />Không quá khó.<br /><span className="text-mint-dark">Mở rộng dần.</span></h2>
        <ul className="space-y-3 text-lg text-muted">
          <li><Star aria-hidden size={16} className="inline-block align-[-2px] text-lavender-dark" /> <b className="text-ink">Đã vững</b>: không bắt em làm lại bài quá dễ.</li>
          <li><Sprout aria-hidden size={16} className="inline-block align-[-2px] text-mint-dark" /> <b className="text-ink">Vừa sức</b>: câu hỏi em làm đúng khoảng 3/4, luyện ở đây tiến bộ nhanh nhất.</li>
          <li><Telescope aria-hidden size={16} className="inline-block align-[-2px] text-lavender-dark" /> <b className="text-ink">Sắp khám phá</b>: sẽ mở khi em vững phần trước.</li>
        </ul>
      </div>
    </section>
  );
}
