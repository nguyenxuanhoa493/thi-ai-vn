import katex from 'katex';
import { Fragment } from 'react';

const INLINE = /(\$[^$]+\$|\*\*[^*]+\*\*)/g;

/** Một mảnh nội dung: công thức và chữ đậm là khối nguyên, chữ thường giữ nguyên chuỗi. */
export function renderPiece(p: string, key: number) {
  if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
    const tex = p.slice(1, -1);
    const html = katex.renderToString(tex, { throwOnError: false });
    // aria-label thay cho cây MathML bên trong (jsdom không tính được style của phần tử MathML)
    return <span key={key} role="math" aria-label={tex} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  if (p.startsWith('**') && p.endsWith('**')) return <strong key={key}>{p.slice(2, -2)}</strong>;
  return <Fragment key={key}>{p}</Fragment>;
}

function renderInline(text: string) {
  return text.split(INLINE).map((p, i) => renderPiece(p, i));
}

/** Tách văn bản thành các "token" để hiện dần: từng từ (kèm khoảng trắng), công thức/chữ đậm nguyên khối, '\n' là xuống dòng. */
export function streamTokens(text: string): string[] {
  const out: string[] = [];
  text.split('\n').forEach((line, li) => {
    if (li > 0) out.push('\n');
    for (const p of line.split(INLINE)) {
      if (!p) continue;
      if ((p.startsWith('$') && p.endsWith('$') && p.length > 2) || (p.startsWith('**') && p.endsWith('**'))) out.push(p);
      else out.push(...(p.match(/\s*\S+\s*|\s+/g) ?? []));
    }
  });
  return out;
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <span className={className}>
      {lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{renderInline(l)}</Fragment>)}
    </span>
  );
}
