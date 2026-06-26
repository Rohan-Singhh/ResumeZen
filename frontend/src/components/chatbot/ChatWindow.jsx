import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import ChatInput from './ChatInput';
import Header from './Header';
import Message from './Message';
import Suggestions from './Suggestions';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const { setIsOpen, messages, isLoading, error, pageContext, sendMessage, retryMessage, clearChat, stopGeneration, regenerateLastResponse } = useChat();
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setIsOpen]);

  const copy = async (content) => navigator.clipboard?.writeText(content);
  const retry = (message) => retryMessage(message);

  return (
    <motion.section initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="fixed bottom-24 right-4 z-[90] flex h-[min(720px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950/85 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:right-6 sm:w-[430px]">
      <Header pageContext={pageContext} onClose={() => setIsOpen(false)} onClear={clearChat} onStop={stopGeneration} onRegenerate={regenerateLastResponse} isLoading={isLoading} canRegenerate={messages.some((message) => message.role === 'assistant' && message.content && !message.error)} />
      <div className="flex-1 space-y-4 overflow-y-auto p-4 chat-scrollbar">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.04] p-4 shadow-xl">
              <p className="text-sm font-semibold text-white">How can I help with your career today?</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">I can help with resumes, ATS scores, interview prep, and navigating ResumeZen.</p>
            </div>
            <Suggestions onSelect={sendMessage} />
          </div>
        )}
        {messages.map((message) => message.content ? <Message key={message.id} message={message} onCopy={copy} onRetry={retry} /> : null)}
        {isLoading && <TypingIndicator />}
        {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</div>}
        <div ref={scrollRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </motion.section>
  );
};

export default ChatWindow;
