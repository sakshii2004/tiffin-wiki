import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_BASE } from '@/components/ui/styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

/**
 * Accessible text input (Section 13).
 * - Always renders an associated <label> (never placeholder-only).
 * - Errors rendered in <p role="alert"> and linked via aria-describedby.
 * - Error ID pattern: `${name}-error`; hint ID pattern: `${name}-hint`.
 */
export function Input({ label, name, error, hint, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? name;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-body">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(FIELD_BASE, 'border-gray-300', error && 'border-red-500', className)}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
