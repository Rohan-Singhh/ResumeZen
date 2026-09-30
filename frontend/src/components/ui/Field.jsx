import React, { useId } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

/**
 * Form primitives: Field (label + control + hint/error), Input, Textarea.
 *
 * Inputs sit in a sunken well — darker than the card they're on — so a form
 * reads as places to write, not more boxes. Focus brightens the hairline and
 * lifts the well; the global :focus-visible outline does the rest.
 */
export const controlClasses =
  'w-full rounded-md border border-line bg-surface-sunken px-3.5 text-sm text-ink ' +
  'placeholder:text-ink-faint hover:border-line-strong ' +
  'focus:border-ink/40 focus:bg-surface-void focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-ink-faint ' +
  'aria-[invalid=true]:border-bad/60';

export const Input = React.forwardRef(function Input({ className = '', ...rest }, ref) {
  return <input ref={ref} className={`${controlClasses} h-11 ${className}`} {...rest} />;
});

export const Textarea = React.forwardRef(function Textarea({ className = '', ...rest }, ref) {
  return <textarea ref={ref} className={`${controlClasses} min-h-[104px] resize-y py-3 leading-relaxed ${className}`} {...rest} />;
});

/**
 * Field wraps one control. Pass a render function to receive the ids:
 *   <Field label="Name">{(p) => <Input {...p} value=... />}</Field>
 *
 * Props:
 *   label — visible label
 *   hint  — helper text under the control
 *   error — error text; replaces the hint and marks the control invalid
 *   aside — node rendered on the label row, flush right (e.g. a counter)
 */
export default function Field({ label, hint, error, aside, className = '', children }) {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;
  const controlProps = { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined };

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-ink-muted">{label}</label>
        {aside != null && <span className="t-meta">{aside}</span>}
      </div>
      {typeof children === 'function' ? children(controlProps) : children}
      {(error || hint) && (
        <p
          id={describedBy}
          className={`mt-2 flex items-start gap-1.5 text-[0.8125rem] leading-snug ${error ? 'text-bad' : 'text-ink-faint'}`}
        >
          {error && <ExclamationCircleIcon className="mt-px h-4 w-4 flex-shrink-0" />}
          {error || hint}
        </p>
      )}
    </div>
  );
}
