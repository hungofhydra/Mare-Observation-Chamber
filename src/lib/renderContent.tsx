import React from 'react';

const BOLD_ITALIC_RE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  BOLD_ITALIC_RE.lastIndex = 0;
  while ((match = BOLD_ITALIC_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const m = match[0];
    if (m.startsWith('**'))
      nodes.push(<strong key={key++}>{m.slice(2, -2)}</strong>);
    else
      nodes.push(<em key={key++}>{m.slice(1, -1)}</em>);
    last = match.index + m.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseAlign(line: string): { align: React.CSSProperties['textAlign']; text: string } {
  if (line.startsWith('[center] ')) return { align: 'center', text: line.slice(9) };
  if (line.startsWith('[right] '))  return { align: 'right',  text: line.slice(8) };
  return { align: undefined, text: line };
}

function imgMargin(align: React.CSSProperties['textAlign']): React.CSSProperties {
  if (align === 'center') return { display: 'block', margin: '8px auto' };
  if (align === 'right')  return { display: 'block', marginLeft: 'auto', marginTop: 8, marginBottom: 8 };
  return { display: 'block', margin: '8px 0' };
}

export function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n').filter(Boolean);
  return lines.map((line, i) => {
    const { align, text } = parseAlign(line);
    const style: React.CSSProperties = { textAlign: align };

    const imgMatch = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch)
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', border: '1px solid #808080', ...imgMargin(align) }} />;

    if (text.startsWith('# '))
      return <h2 key={i} style={{ fontSize: 15, fontWeight: 'bold', margin: '12px 0 6px', borderBottom: '1px solid #808080', paddingBottom: 2, ...style }}>{renderInline(text.slice(2))}</h2>;
    if (text.startsWith('## '))
      return <h3 key={i} style={{ fontSize: 13, fontWeight: 'bold', margin: '10px 0 4px', ...style }}>{renderInline(text.slice(3))}</h3>;
    if (text.startsWith('- '))
      return <li key={i} style={{ marginLeft: 16, marginBottom: 2, ...style }}>{renderInline(text.slice(2))}</li>;
    return <p key={i} style={{ marginBottom: 8, ...style }}>{renderInline(text)}</p>;
  });
}
