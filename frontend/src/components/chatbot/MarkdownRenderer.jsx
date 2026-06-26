/* eslint-disable react/prop-types */
import { memo } from 'react';

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderInline = (text) => escapeHtml(text)
  .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-950/70 px-1.5 py-0.5 text-[0.85em] text-violet-200">$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="text-violet-300 underline decoration-violet-400/50" href="$2" target="_blank" rel="noreferrer">$1</a>');

const MarkdownRenderer = memo(function MarkdownRenderer({ content }) {
  const blocks = String(content || '').split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-6">
      {blocks.map((block, index) => {
        if (block.startsWith('```')) {
          const code = block.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return <pre key={index} className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-100 shadow-inner"><code>{code}</code></pre>;
        }

        return block.split('\n').filter(Boolean).map((line, lineIndex) => {
          const isList = /^[-*]\s+/.test(line.trim());
          const cleanLine = line.trim().replace(/^[-*]\s+/, '• ');
          return <p key={`${index}-${lineIndex}`} className={isList ? 'pl-2' : ''} dangerouslySetInnerHTML={{ __html: renderInline(cleanLine) }} />;
        });
      })}
    </div>
  );
});

export default MarkdownRenderer;
