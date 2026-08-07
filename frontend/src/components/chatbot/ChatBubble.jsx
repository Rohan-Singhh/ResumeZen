import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from '../../hooks/useChat';

const ChatWindow = lazy(() => import('./ChatWindow'));

const ChatBubble = () => {
  const { isOpen, setIsOpen, unreadCount } = useChat();

  return (
    <>
      <AnimatePresence>{isOpen && <Suspense fallback={null}><ChatWindow /></Suspense>}</AnimatePresence>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => setIsOpen((open) => !open)} className="fixed bottom-5 right-4 z-[91] flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-2xl text-white shadow-2xl shadow-violet-500/30 sm:right-6" aria-label="Open ResumeZen AI assistant">
        {isOpen ? '×' : '✦'}
        {!isOpen && unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white ring-4 ring-zinc-950">{unreadCount}</span>}
      </motion.button>
    </>
  );
};

export default ChatBubble;
