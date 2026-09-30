import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../utils/motion';

/**
 * Segmented — a small set of mutually exclusive views (tabs).
 *
 * The selected pill is one shared element that slides between options, so the
 * switch reads as a move rather than two separate color changes.
 *
 * Props:
 *   options  — [{ value, label, icon?, disabled? }]
 *   value    — selected value
 *   onChange — (value) => void
 *   label    — accessible name for the tablist
 */
export default function Segmented({ options, value, onChange, label, className = '' }) {
  const groupId = useId();

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-flex rounded-md border border-line bg-surface-sunken p-1 ${className}`}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`relative flex h-8 items-center gap-1.5 rounded px-3 text-[0.8125rem] font-medium disabled:cursor-wait ${
              selected ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${groupId}`}
                className="absolute inset-0 rounded border border-line-strong bg-surface-raised shadow-e1"
                transition={spring}
              />
            )}
            {Icon && <Icon className="relative z-10 h-4 w-4" />}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
