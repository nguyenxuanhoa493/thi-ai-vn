import type { Metadata } from 'next';
import { Lexend, Be_Vietnam_Pro } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { Providers } from '@/components/providers';

const lexend = Lexend({ subsets: ['latin', 'vietnamese'], variable: '--font-lexend', weight: ['400', '600', '800'] });
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], variable: '--font-be-vietnam', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'thi.ai.vn — Học vừa sức, tiến bộ mỗi ngày',
  description: 'Nền tảng thi & ôn luyện trực tuyến K12 với AI đánh giá năng lực và Learning Zone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${lexend.variable} ${beVietnam.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
