import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { springSoft, duration, ease } from '../../utils/motion';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal — the one dialog primitive.
 *
 * Handles role="dialog" semantics, Escape to close, focus moved into the
 * dialog (to the element marked `data-autofocus`, else the panel) and trapped
 * there, focus restored on close, and an exit animation (AnimatePresence
 * stays mounted).
 *
 * On phones the panel is a bottom sheet: it rises from the edge the thumb is
 * already on. From `sm` up it is a centered dialog.
 *
 * Props:
 *   open        — whether the dialog is shown
 *   onClose     — called on Escape / backdrop click (when dismissible)
 *   dismissible — false while work is in flight that must not be interrupted
 *   labelledBy  — id of the element that titles the dialog
 *   maxWidth    — Tailwind max-width class for the panel (default max-w-md)
 *   padded      — apply default padding (default true)
 *   className   — extra panel classes, appended last
 *   zIndex      — Tailwind z-index class for the overlay (default z-50)
 */
export default function Modal({
  open,
  onClose,
  dismissible = true,
  labelledBy,
  maxWidth = 'max-w-md',
  padded = true,
  className = '',
  zIndex = 'z-50',
  children,
}) {
  const panelRef = useRef(null);

  // Keep the latest handlers without re-running the focus effect on every render
  const closeRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  closeRef.current = onClose;
  dismissibleRef.current = dismissible;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    // Focus the dialog itself, not whichever control happens to come first
    // (usually the close button). A dialog can opt a control in with
    // `data-autofocus`, e.g. the safe choice in a confirmation.
    (panel?.querySelector('[data-autofocus]') || panel)?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && dismissibleRef.current) {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (nodes.length === 0) { e.preventDefault(); return; }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${zIndex} flex items-end justify-center sm:items-center sm:p-4`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
            className="absolute inset-0 bg-surface-sunken/80 backdrop-blur-[3px]"
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: springSoft }}
            exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: duration.base, ease: ease.in } }}
            className={[
              'relative w-full border border-line-strong bg-surface-raised shadow-e3 outline-none',
              'rounded-t-2xl sm:rounded-xl',
              maxWidth,
              padded ? 'p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6' : '',
              className,
            ].filter(Boolean).join(' ')}
          >
            {/* Grab handle: signals "sheet" on phones, hidden from sm up */}
            <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-ink/15 sm:hidden" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * ModalHeader — title row with an optional tone icon and a close button, so
 * every dialog opens the same way.
 *
 * Props:
 *   id      — must match the Modal's `labelledBy`
 *   icon    — heroicon component (optional)
 *   tone    — accent | good | warn | bad | neutral; colors the icon
 *   onClose — renders a close button when provided
 */
const ICON_TONES = {
  neutral: 'text-ink-muted',
  accent: 'text-primary-light',
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
};

export function ModalHeader({ id, icon: Icon, tone = 'neutral', onClose, children }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4 pt-1 sm:pt-0">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon className={`h-5 w-5 flex-shrink-0 ${ICON_TONES[tone] || ICON_TONES.neutral}`} />}
        <h3 id={id} className="t-h3 truncate">{children}</h3>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
