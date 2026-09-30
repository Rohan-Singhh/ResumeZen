import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/20/solid';
import { tapPress, duration, ease } from '../../utils/motion';
import Spinner from './Spinner';

/**
 * Button — the one button primitive.
 *
 * Variants
 *   primary   — paper on ink. The single most important action in a view.
 *   secondary — raised surface with a hairline. Everything else that matters.
 *   ghost     — text only until hovered. Tertiary and toolbar actions.
 *   danger    — destructive.
 *   ink       — dark on paper. The primary action when the surface is a sheet.
 * Sizes: sm (32px) | md (40px) | lg (48px)
 *
 * States
 *   loading — swaps the label for a spinner, keeps the width, blocks clicks
 *   success — flashes a check in place of the label (set it briefly after a save)
 *
 * `buttonClasses()` is exported so links can wear the same styles.
 */
const BASE =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ' +
  'disabled:pointer-events-none disabled:opacity-45';

const VARIANTS = {
  primary:
    'bg-paper text-paper-ink shadow-button hover:bg-paper-bright',
  secondary:
    'border border-line-strong bg-surface-raised text-ink shadow-e1 hover:border-ink/30 hover:bg-surface-overlay',
  ghost:
    'text-ink-muted hover:bg-ink/[0.06] hover:text-ink',
  danger:
    'border border-bad/30 bg-bad/10 text-bad hover:border-bad/50 hover:bg-bad/[0.16]',
  ink:
    'bg-paper-ink text-paper hover:bg-black',
};

const SIZES = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
};

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, className]
    .filter(Boolean)
    .join(' ');
}

const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    success = false,
    type = 'button',
    children,
    ...rest
  },
  ref
) {
  const busy = loading || success;

  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={disabled || busy ? undefined : tapPress}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {/* Label stays in the flow (invisible) while busy so the width never jumps */}
      <span className={`inline-flex items-center gap-2 ${busy ? 'invisible' : ''}`}>{children}</span>

      <AnimatePresence initial={false}>
        {busy && (
          <motion.span
            key={success ? 'success' : 'loading'}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: duration.base, ease: ease.out }}
          >
            {success ? <CheckIcon className="h-5 w-5" /> : <Spinner size={size === 'sm' ? 14 : 18} />}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

export default Button;
