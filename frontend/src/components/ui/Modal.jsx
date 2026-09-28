import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { springSoft } from '../../utils/motion';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal — the one dialog primitive. Replaces the hand-rolled portal + backdrop
 * blocks that each popup used to carry.
 *
 * Handles what the copies never did: role="dialog" semantics, Escape to close,
 * focus moved into the dialog and trapped there, focus restored on close, and
 * an exit animation (AnimatePresence stays mounted).
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
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus();

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
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: springSoft }}
            exit={{ opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } }}
            className={[
              'relative w-full rounded-2xl border border-line bg-surface shadow-2xl outline-none',
              maxWidth,
              padded ? 'p-6' : '',
              className,
            ].filter(Boolean).join(' ')}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
