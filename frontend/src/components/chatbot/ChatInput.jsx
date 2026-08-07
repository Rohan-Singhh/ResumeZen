/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = '44px';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 112)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <div className="border-t border-white/10 bg-zinc-950/50 p-3 backdrop-blur-xl">
      <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.07] p-2 shadow-inner focus-within:border-violet-400/50">
        <textarea ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Ask ResumeZen AI…" rows={1} className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-500" aria-label="Message ResumeZen AI" />
        <button onClick={submit} disabled={disabled || !value.trim()} className="mb-0.5 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">Send</button>
      </div>
      <p className="mt-2 px-2 text-[11px] text-zinc-500">Enter to send • Shift+Enter for new line • Esc to close</p>
    </div>
  );
};

export default ChatInput;
