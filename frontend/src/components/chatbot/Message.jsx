/* eslint-disable react/prop-types */
import { memo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const Message = memo(function Message({ message, onCopy, onRetry }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`group max-w-[88%] rounded-3xl px-4 py-3 shadow-xl ${isUser ? 'rounded-br-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white' : 'rounded-bl-md border border-white/10 bg-white/10 text-zinc-100 backdrop-blur-xl'}`}>
        <MarkdownRenderer content={message.content} />
        {message.error && <p className="mt-2 text-xs text-rose-200">Message failed. Try again.</p>}
        <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => onCopy(message.content)} className="text-[11px] text-zinc-300 hover:text-white">Copy</button>
          {message.error && <button onClick={() => onRetry(message)} className="text-[11px] text-rose-200 hover:text-white">Retry</button>}
        </div>
      </div>
    </div>
  );
});

export default Message;
