import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { TEXTAREA_BASE } from '@/components/ui/styles';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  value?: string;
}

/**
 * Accessible textarea (Section 13). Same pattern as Input, plus:
 * - Character counter `{currentLength}/{maxLength}` when maxLength is provided.
 * - aria-describedby includes error ID and the character-count ID.
 */
export function Textarea({
  label,
  name,
  error,
  hint,
  id,
  rows = 4,
  maxLength,
  value,
  className = '',
  ...rest
}: TextareaProps) {
  const textareaId = id ?? name;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const countId = `${name}-count`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null, maxLength ? countId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={textareaId} className="text-sm font-medium text-body">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(TEXTAREA_BASE, 'border-gray-300', error && 'border-red-500', className)}
        {...rest}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
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
        {maxLength && (
          <p id={countId} className="shrink-0 text-sm text-gray-500">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
