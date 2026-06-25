import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_BASE } from '@/components/ui/styles';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: readonly SelectOption[];
  error?: string;
  hint?: string;
}

/**
 * Accessible select, matching the Input pattern (Section 13).
 * - Always renders an associated <label>.
 * - Errors rendered in <p role="alert"> and linked via aria-describedby.
 * - Error ID pattern: `${name}-error`; hint ID pattern: `${name}-hint`.
 */
export function Select({
  label,
  name,
  options,
  error,
  hint,
  id,
  className = '',
  ...rest
}: SelectProps) {
  const selectId = id ?? name;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-body">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(FIELD_BASE, 'border-gray-300', error && 'border-red-500', className)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
