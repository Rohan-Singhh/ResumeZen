import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { springSoft, duration, ease } from '../../utils/motion';

/**
 * Toasts — brief, non-blocking confirmation ("Copied", "Changes saved").
 *
 *   const toast = useToast();
 *   toast('Copied to clipboard');
 *   toast('Could not save', { tone: 'bad' });
 *
 * Bottom-center so they never cover navigation; on phones they sit above the
 * tab bar. Errors that need a decision belong inline or in a dialog, not here.
 */
const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

const TONES = {
  good: { icon: CheckCircleIcon, color: 'text-good' },
  bad: { icon: ExclamationCircleIcon, color: 'text-bad' },
  info: { icon: InformationCircleIcon, color: 'text-ink-muted' },
};

const MAX_VISIBLE = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, { tone = 'good', timeout = 3200 } = {}) => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), timeout);
  }, [dismiss]);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[150] flex flex-col items-center gap-2 px-4 lg:bottom-8"
          role="region"
          aria-label="Notifications"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const { icon: Icon, color } = TONES[t.tone] || TONES.info;
              return (
                <motion.div
                  key={t.id}
                  layout
                  role="status"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: springSoft }}
                  exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: duration.base, ease: ease.in } }}
                  className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-md border border-line-strong bg-surface-overlay py-2.5 pl-3 pr-4 text-sm font-medium text-ink shadow-e3"
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
                  {t.message}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
