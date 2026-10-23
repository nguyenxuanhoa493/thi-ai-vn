import type { ReactNode } from 'react';

// Minh hoạ nét trắng cho thumbnail bộ đề / đề thi, vẽ trên nền màu chuyển sắc. viewBox 160×120.
const S = { stroke: 'white', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const SOFT = 'rgba(255,255,255,0.22)';
const T = { fill: 'white', fontWeight: 800, fontFamily: 'inherit', textAnchor: 'middle' } as const;

function Axes() {
  return <g {...S} strokeWidth={2} opacity={0.7}><path d="M20 100H142M136 95l6 5-6 5" /><path d="M40 112V14M35 20l5-6 5 6" /></g>;
}

function Book({ label }: { label: string }) {
  return (
    <g>
      <path d="M80 34c-14-8-32-9-46-6v62c14-3 32-2 46 6 14-8 32-9 46-6V28c-14-3-32-2-46 6z" fill={SOFT} {...S} />
      <path d="M80 34v62" {...S} />
      <text x="57" y="72" fontSize="22" {...T}>{label[0]}</text>
      <text x="103" y="72" fontSize="22" {...T}>{label[1]}</text>
    </g>
  );
}

const ART: Record<string, ReactNode> = {
  // Hệ hai phương trình: hai đường thẳng cắt nhau
  't9-c1': <><Axes /><path d="M30 92L132 26" {...S} /><path d="M34 34L134 88" {...S} /><circle cx="87" cy="55" r="7" fill="white" /></>,
  // Bất phương trình: trục số, khoảng nghiệm tô đậm
  't9-c2': (
    <>
      <path d="M14 70H146M140 64l6 6-6 6" {...S} strokeWidth={2} opacity={0.7} />
      {[30, 50, 70, 90, 110, 130].map((x) => <path key={x} d="M0 64v12" transform={`translate(${x} 0)`} {...S} strokeWidth={2} opacity={0.7} />)}
      <path d="M70 70H140" {...S} strokeWidth={8} opacity={0.9} />
      <circle cx="70" cy="70" r="8" fill="#ffffff55" {...S} />
      <text x="70" y="44" fontSize="22" {...T}>x &gt; a</text>
    </>
  ),
  // Căn bậc hai, căn bậc ba
  't9-c3': (
    <>
      <path d="M22 66l10-6 14 34 20-72h44" {...S} strokeWidth={5} />
      <text x="88" y="78" fontSize="34" {...T}>x</text>
      <text x="132" y="104" fontSize="26" {...T} opacity={0.85}>∛</text>
    </>
  ),
  // Tam giác vuông với góc α
  't9-c4': (
    <>
      <path d="M32 98H130L32 24Z" fill={SOFT} {...S} />
      <path d="M32 84h14v14" {...S} strokeWidth={2} />
      <path d="M108 98a22 22 0 0 0-5-15" {...S} strokeWidth={2} />
      <text x="96" y="92" fontSize="16" {...T}>α</text>
    </>
  ),
  // Parabol y = ax²
  't9-c6': (
    <>
      <path d="M20 96H142M80 112V12" {...S} strokeWidth={2} opacity={0.7} />
      <path d="M36 18Q80 170 124 18" {...S} />
      <circle cx="80" cy="94" r="6" fill="white" />
    </>
  ),
  // Đạo hàm: đồ thị bậc ba, tiếp tuyến tại cực trị
  't12-c1': (
    <>
      <Axes />
      <path d="M44 100C62 20 78 22 92 60S124 98 140 22" {...S} />
      <path d="M52 39H96" {...S} strokeWidth={2} strokeDasharray="5 5" />
      <circle cx="73" cy="39" r="6" fill="white" /><circle cx="111" cy="82" r="6" fill="white" />
    </>
  ),
  // Tích phân: diện tích dưới đường cong
  't12-c4': (
    <>
      <Axes />
      <path d="M62 100V62C78 40 96 34 120 42V100Z" fill={SOFT} />
      <path d="M46 78C70 44 96 32 136 44" {...S} />
      <path d="M62 100V62M120 100V42" {...S} strokeWidth={2} strokeDasharray="4 4" />
      <text x="91" y="88" fontSize="28" {...T}>∫</text>
    </>
  ),
  // Số tự nhiên: các khối số
  't6-c1': (
    <>
      {[[22, 56, '1'], [62, 40, '2'], [102, 24, '3']].map(([x, y, n]) => (
        <g key={n as string}><rect x={x as number} y={y as number} width="36" height="36" rx="8" fill={SOFT} {...S} /><text x={(x as number) + 18} y={(y as number) + 27} fontSize="22" {...T}>{n}</text></g>
      ))}
      <path d="M22 100H138" {...S} strokeWidth={2} opacity={0.7} />
    </>
  ),
  // Phân số: hình tròn chia 4, tô 3 phần
  't6-c6': (
    <>
      <circle cx="62" cy="60" r="38" {...S} />
      <path d="M62 60V22A38 38 0 1 1 24 60Z" fill="rgba(255,255,255,0.6)" />
      <path d="M62 22V98M24 60H100" {...S} strokeWidth={2} />
      <text x="128" y="54" fontSize="26" {...T}>3</text>
      <path d="M116 62h24" {...S} />
      <text x="128" y="90" fontSize="26" {...T}>4</text>
    </>
  ),
  // Ngữ âm & từ vựng: bong bóng thoại + sóng âm
  'e9-c1': (
    <>
      <path d="M24 22h80a12 12 0 0 1 12 12v36a12 12 0 0 1-12 12H56l-18 16V82H24a12 12 0 0 1-12-12V34a12 12 0 0 1 12-12z" fill={SOFT} {...S} />
      <text x="64" y="64" fontSize="26" {...T}>/æ/</text>
      <path d="M128 44q8 8 0 16M138 36q16 16 0 32" {...S} />
    </>
  ),
  // Ngữ pháp: khối câu S + V + O
  'e9-c2': (
    <>
      {[[14, 'S'], [62, 'V'], [110, 'O']].map(([x, l]) => (
        <g key={l as string}><rect x={x as number} y="40" width="36" height="40" rx="8" fill={SOFT} {...S} /><text x={(x as number) + 18} y="68" fontSize="22" {...T}>{l}</text></g>
      ))}
      <path d="M52 60h8M100 60h8" {...S} />
    </>
  ),
  // Kỹ năng: tai nghe (nghe) + bút (viết)
  'e9-c3': (
    <>
      <path d="M26 74V60a34 34 0 0 1 68 0v14" {...S} />
      <rect x="20" y="68" width="16" height="28" rx="6" fill="white" /><rect x="84" y="68" width="16" height="28" rx="6" fill="white" />
      <path d="M118 96l6-22 20-40 8 4-20 40-14 18z" fill={SOFT} {...S} />
    </>
  ),
  'e6-c1': <Book label="Aa" />,
  'e12-c1': <Book label="EN" />,
};

// Đề tổng hợp: chồng thẻ câu hỏi
ART.mixed = (
  <>
    <rect x="44" y="26" width="56" height="72" rx="10" fill={SOFT} {...S} transform="rotate(-14 72 62)" />
    <rect x="60" y="26" width="56" height="72" rx="10" fill={SOFT} {...S} transform="rotate(10 88 62)" />
    <rect x="52" y="22" width="56" height="72" rx="10" fill="white" />
    <text x="80" y="72" fontSize="36" {...T} fill="#2b2d42">?</text>
  </>
);

// Thi giữa kỳ / cuối kỳ: tờ bài thi có đáp án đã chấm và dấu điểm
ART['exam-paper'] = (
  <>
    <rect x="34" y="12" width="70" height="96" rx="8" fill={SOFT} {...S} />
    {[34, 56, 78].map((y) => (
      <g key={y}><path d={`M46 ${y}l4 4 8-8`} {...S} strokeWidth={2.5} /><path d={`M66 ${y}h26`} {...S} strokeWidth={2.5} opacity={0.8} /></g>
    ))}
    <circle cx="116" cy="84" r="22" fill="white" />
    <text x="116" y="93" fontSize="24" {...T} fill="#e86a45">A+</text>
  </>
);

/** `art`: mã chương (vd 't9-c1'), 'mixed' hoặc 'exam-paper'. Không có hình thì hiện `fallback`. */
export function TopicArt({ art, fallback = '' }: { art: string; fallback?: string }) {
  const node = ART[art];
  if (!node) return <span className="text-6xl font-black text-white/90">{fallback}</span>;
  return <svg viewBox="0 0 160 120" fill="none" className="h-[78%] w-auto drop-shadow-sm" aria-hidden>{node}</svg>;
}
