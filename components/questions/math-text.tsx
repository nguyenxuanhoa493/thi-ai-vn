import katex from 'katex';
import { Fragment } from 'react';

function renderInline(text: string) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
      const tex = p.slice(1, -1);
      const html = katex.renderToString(tex, { throwOnError: false });
      // aria-label thay cho cây MathML bên trong (jsdom không tính được style của phần tử MathML)
      return <span key={i} role="math" aria-label={tex} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <span className={className}>
      {lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{renderInline(l)}</Fragment>)}
    </span>
  );
}
