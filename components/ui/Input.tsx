import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_BASE } from '@/components/ui/styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  prefix?: string;
}

/**
 * Accessible text input (Section 13).
 * - Always renders an associated <label> (never placeholder-only).
 * - Errors rendered in <p role="alert"> and linked via aria-describedby.
 * - Error ID pattern: `${name}-error`; hint ID pattern: `${name}-hint`.
 */
export function Input({ label, name, error, hint, id, className = '', icon, prefix, ...rest }: InputProps) {
  const inputId = id ?? name;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
            {icon}
          </span>
        )}
        {prefix && (
          <span
            className={cn(
              "absolute text-slate-500 font-medium pointer-events-none z-10 text-base",
              icon ? "left-10" : "left-3.5"
            )}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            FIELD_BASE, 
            'border-slate-200 w-full', 
            icon 
              ? prefix ? 'pl-[74px]' : 'pl-10'
              : prefix ? 'pl-[44px]' : 'pl-3', 
            error && 'border-red-500', 
            className
          )}
          {...rest}
        />
      </div>
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
